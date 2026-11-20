"use client";

/*
  The shared "Pings caught" counter. Every click on Rushikesh's email, GitHub or LinkedIn, from any
  visitor, adds one to a single counter, and every open copy of the site sees new pings live.

  GitHub Pages serves static files only, so the number lives in Abacus, a free counting API with
  CORS and Server-Sent Events (https://abacus.jasoncameron.dev). The page reads the count once,
  then listens on the event stream. Nothing about the visitor is sent: the request carries no data
  beyond the counter's name. See DECISIONS.md, ADR-013.

  A visitor counts once per channel per day (email, GitHub, LinkedIn), so one person clicking
  repeatedly cannot run the number up.
*/

export type PingChannel = "email" | "github" | "linkedin";

export interface PingProfiles {
  github: string;
  linkedin: string;
}

export type PingStatus = "connecting" | "live" | "offline";

export interface PingSnapshot {
  /** The shared count, or null before it has ever loaded on this device. */
  count: number | null;
  status: PingStatus;
}

export interface PingOrigin {
  x: number;
  y: number;
}

export const PING_API = "https://abacus.jasoncameron.dev";
const COUNTER = "rrushikeshp89.github.io/motionfolio-pings";
const CACHE_KEY = "motionfolio:pings";
const SEEN_KEY = "motionfolio:pinged:";
const ONCE_PER_MS = 24 * 60 * 60 * 1000;

/* ---------- Pure helpers (unit tested) ---------- */

/** "https://GitHub.com/Name/" → "github.com/name", so profile links compare reliably. */
export function normalizeProfile(href: string): string {
  try {
    const url = new URL(href);
    return `${url.host}${url.pathname}`.toLowerCase().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

/**
 * Which channel a clicked link belongs to. Only the profiles themselves count, not project
 * repositories under the same GitHub account; a [data-ping] element (the Copy button) names its
 * channel directly.
 */
export function channelFor(
  href: string | null,
  dataPing: string | null,
  profiles: PingProfiles,
): PingChannel | null {
  if (dataPing === "email" || dataPing === "github" || dataPing === "linkedin") return dataPing;
  if (!href) return null;
  if (href.toLowerCase().startsWith("mailto:")) return "email";
  const target = normalizeProfile(href);
  if (!target) return null;
  if (target === normalizeProfile(profiles.github)) return "github";
  if (target === normalizeProfile(profiles.linkedin)) return "linkedin";
  return null;
}

export interface CountState {
  /** Highest value the server has reported; null until the first answer. */
  server: number | null;
  /** This visitor's hits still waiting for an answer. */
  inFlight: number;
  /** Values the server gave back for this visitor's own hits, not yet passed by `server`. */
  own: readonly number[];
}

export const INITIAL_COUNT: CountState = { server: null, inFlight: 0, own: [] };

/**
 * Folds a value from the server (a read, a hit answer or a stream event) into the state, and says
 * how many of the new pings came from other visitors. The count never moves backwards, because a
 * hit answer and the stream event for the same hit can arrive in either order. A new value that
 * is neither one of this visitor's answered hits nor covered by a hit still in flight is remote.
 */
export function reconcile(state: CountState, value: number): { state: CountState; remote: number } {
  const { server } = state;
  if (server === null) {
    return {
      state: { ...state, server: value, own: state.own.filter((v) => v > value) },
      remote: 0,
    };
  }
  if (value <= server) return { state, remote: 0 };
  const mine = state.own.filter((v) => v > server && v <= value).length;
  const remote = Math.max(0, value - server - mine - state.inFlight);
  return { state: { ...state, server: value, own: state.own.filter((v) => v > value) }, remote };
}

/* ---------- The store ---------- */

const listeners = new Set<() => void>();
const localPingListeners = new Set<(origin: PingOrigin | null) => void>();
const remoteListeners = new Set<(count: number) => void>();

const SERVER_SNAPSHOT: PingSnapshot = { count: null, status: "connecting" };
let counts: CountState = INITIAL_COUNT;
/** Last count seen on this device, shown until the live value arrives. */
let cached: number | null = null;
/** What the count will be once this visitor's hits land; shown straight away on a click. */
let optimistic: number | null = null;
let status: PingStatus = "connecting";
let snapshot: PingSnapshot = SERVER_SNAPSHOT;
let stream: EventSource | null = null;
let wanted = false;

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // Storage blocked (private mode): no cache, no once-a-day memory.
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not persisted; the count still works for this visit.
  }
}

if (typeof window !== "undefined") {
  const stored = Number(readStorage(CACHE_KEY));
  if (Number.isInteger(stored) && stored > 0) cached = stored;
}

function displayed(): number | null {
  const base = counts.server ?? cached;
  if (optimistic === null) return base;
  return base === null ? optimistic : Math.max(base, optimistic);
}

function publish() {
  if (optimistic !== null && counts.server !== null && counts.server >= optimistic) {
    optimistic = null;
  }
  const count = displayed();
  if (count === snapshot.count && status === snapshot.status) return;
  snapshot = { count, status };
  for (const listener of listeners) listener();
}

function applyServer(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return;
  const result = reconcile(counts, Math.floor(value));
  counts = result.state;
  if (counts.server !== null) writeStorage(CACHE_KEY, String(counts.server));
  publish();
  if (result.remote > 0) for (const listener of remoteListeners) listener(result.remote);
}

async function readValue(path: "get" | "hit"): Promise<number | null> {
  const response = await fetch(`${PING_API}/${path}/${COUNTER}`, {
    cache: "no-store",
    credentials: "omit",
    referrerPolicy: "no-referrer",
    // A hit fires as the visitor leaves for GitHub or their mail app: keepalive lets it finish.
    keepalive: path === "hit",
  });
  if (path === "get" && response.status === 404) return 0; // No ping yet: the counter starts at 0.
  if (!response.ok) throw new Error(`Counter answered ${response.status}`);
  const body = (await response.json()) as { value?: unknown };
  return typeof body.value === "number" ? body.value : null;
}

function openStream() {
  if (stream || typeof EventSource === "undefined") return;
  stream = new EventSource(`${PING_API}/stream/${COUNTER}`);
  stream.onopen = () => {
    status = "live";
    publish();
  };
  stream.onmessage = (event: MessageEvent<string>) => {
    try {
      applyServer((JSON.parse(event.data) as { value?: unknown }).value);
      status = "live";
      publish();
    } catch {
      // Ignore a malformed event; the next one carries the full value again.
    }
  };
  stream.onerror = () => {
    // EventSource reconnects by itself; only a closed stream means the counter is unreachable.
    if (stream?.readyState === EventSource.CLOSED) {
      status = "offline";
      publish();
    }
  };
}

function closeStream() {
  stream?.close();
  stream = null;
}

async function refresh() {
  try {
    const value = await readValue("get");
    if (value !== null) applyServer(value);
  } catch {
    status = "offline";
    publish();
  }
}

function onVisibility() {
  if (document.visibilityState === "hidden") {
    closeStream();
  } else if (wanted) {
    void refresh();
    openStream();
  }
}

export const pings = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  getServerSnapshot: () => SERVER_SNAPSHOT,

  /**
   * Starts reading and listening (idempotent). Called when the counter scrolls into view, so a
   * visitor who never reaches the contact section makes no request to the counter.
   */
  connect() {
    if (wanted || typeof window === "undefined") return;
    wanted = true;
    publish();
    document.addEventListener("visibilitychange", onVisibility);
    void refresh();
    openStream();
  },

  /** Counts a click on a contact channel; returns false when this visitor already counted today. */
  send(channel: PingChannel, origin: PingOrigin | null): boolean {
    const now = Date.now();
    const last = Number(readStorage(SEEN_KEY + channel));
    if (Number.isFinite(last) && last > 0 && now - last < ONCE_PER_MS) return false;
    writeStorage(SEEN_KEY + channel, String(now));

    const before = displayed();
    if (before !== null) optimistic = before + 1;
    counts = { ...counts, inFlight: counts.inFlight + 1 };
    publish();
    for (const listener of localPingListeners) listener(origin);

    const settle = () => ({ ...counts, inFlight: Math.max(0, counts.inFlight - 1) });
    readValue("hit").then(
      (value) => {
        counts = settle();
        // Once every hit has an answer, the server's number is the truth (even below a stale cache).
        if (counts.inFlight === 0) optimistic = null;
        if (value === null) return publish();
        counts = { ...counts, own: [...counts.own, value] };
        applyServer(value);
      },
      () => {
        counts = settle();
        optimistic = null;
        status = "offline";
        publish();
      },
    );
    return true;
  },

  /** This visitor's own pings, with where on screen they started (for the flight animation). */
  onLocalPing(listener: (origin: PingOrigin | null) => void) {
    localPingListeners.add(listener);
    return () => void localPingListeners.delete(listener);
  },

  /** Pings from other visitors, as they arrive on the stream. */
  onRemotePing(listener: (count: number) => void) {
    remoteListeners.add(listener);
    return () => void remoteListeners.delete(listener);
  },
};

/** Click delegation: counts clicks on email, GitHub and LinkedIn wherever they sit on the page. */
export function pingFromEvent(event: MouseEvent, profiles: PingProfiles) {
  if (event.type === "auxclick" && event.button !== 1) return; // middle click opens a new tab
  const target = event.target instanceof Element ? event.target : null;
  const element = target?.closest<HTMLElement>("a[href], [data-ping]");
  if (!element) return;
  const channel = channelFor(element.getAttribute("href"), element.dataset.ping ?? null, profiles);
  if (!channel) return;
  const rect = element.getBoundingClientRect();
  pings.send(channel, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
}
