"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { fx } from "@/motion/fx";
import { useInView, useReducedMotion } from "@/motion/hooks";
import { pings, type PingOrigin, type PingStatus } from "@/motion/pings";
import { cubicBezier, ease } from "@/motion/tokens";

interface Flight {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

/**
 * "Everything ends up here": the live "Pings caught" counter. Every click on the email, GitHub or
 * LinkedIn links, from any visitor, counts once (see src/motion/pings.ts), and the number updates
 * in real time in every open copy of the site. A click on a link in this block flies a ping into
 * the card before the number ticks over; a ping from another visitor makes the card gulp.
 */
export function PingFunnel({ children }: { children: ReactNode }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const funnelRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const { count, status } = useSyncExternalStore(
    pings.subscribe,
    pings.getSnapshot,
    pings.getServerSnapshot,
  );
  const reduced = useReducedMotion();
  const inView = useInView(areaRef, 0);
  const inViewRef = useRef(false);

  // Start reading the shared count once the contact block is on screen.
  useEffect(() => {
    inViewRef.current = inView;
    if (inView) pings.connect();
  }, [inView]);

  // This visitor's own ping: fly it from the clicked link into the card.
  useEffect(
    () =>
      pings.onLocalPing((origin: PingOrigin | null) => {
        const area = areaRef.current?.getBoundingClientRect();
        const funnel = funnelRef.current?.getBoundingClientRect();
        if (reduced || !origin || !area || !funnel || funnel.width === 0) return;
        const inside =
          origin.x >= area.left &&
          origin.x <= area.right &&
          origin.y >= area.top &&
          origin.y <= area.bottom;
        if (!inside) return;
        const x = origin.x - area.left;
        const y = origin.y - area.top;
        const targetX = funnel.left + funnel.width * 0.22 - area.left;
        const targetY = funnel.top + funnel.height / 2 - area.top;
        nextId.current += 1;
        const flight = { id: nextId.current, x, y, dx: targetX - x, dy: targetY - y };
        setFlights((current) => [...current.slice(-5), flight]);
      }),
    [reduced],
  );

  // Another visitor's ping, while this block is on screen.
  useEffect(
    () =>
      pings.onRemotePing((added) => {
        if (!inViewRef.current) return;
        fx.toast(added === 1 ? "New ping from another visitor" : `${added} new pings just landed`);
      }),
    [],
  );

  // Pings still in the air are not counted on the card until they land.
  const shown = count === null ? null : Math.max(0, count - flights.length);
  const previous = useRef(shown);
  useEffect(() => {
    const before = previous.current;
    previous.current = shown;
    if (before === null || shown === null || shown <= before) return;
    if (reduced || !funnelRef.current) return;
    funnelRef.current.animate(
      { scale: ["0.93", "1.03", "1"], rotate: ["-3deg", "1deg", "0deg"] },
      { duration: 350, easing: "ease-out" },
    );
  }, [shown, reduced]);

  const land = useCallback((id: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
  }, []);

  return (
    <div ref={areaRef} className="relative">
      {children}

      <div
        ref={funnelRef}
        data-ping-funnel=""
        className="mt-10 flex w-fit items-center gap-4 rounded-2xl border-2 border-ink bg-card px-5 py-4 shadow-[var(--shadow-ink-sm)] transition-transform duration-300 hover:scale-105 hover:-rotate-1 sm:absolute sm:top-0 sm:right-0 sm:mt-0"
      >
        <FunnelGlyph />
        <span>
          <span
            data-ping-count=""
            aria-hidden="true"
            className="block font-mono text-2xl leading-none font-bold tabular-nums"
          >
            {shown === null ? "------" : String(shown).padStart(6, "0")}
          </span>
          <span className="label mt-1 flex items-center gap-2 text-accent-strong">
            Pings caught
            <StatusDot status={status} />
          </span>
          <span className="sr-only">{describe(shown, status)}</span>
        </span>
      </div>

      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
        {flights.map((flight) => (
          <PingFlight key={flight.id} flight={flight} onLand={land} />
        ))}
      </span>
    </div>
  );
}

function describe(shown: number | null, status: PingStatus): string {
  if (shown === null) return status === "offline" ? "Ping count unavailable" : "Ping count loading";
  const noun = shown === 1 ? "ping" : "pings";
  return `${shown} ${noun} from visitors who emailed or opened GitHub or LinkedIn${status === "live" ? ", updating live" : ""}`;
}

/** Green and pulsing while the live stream is open; grey when the counter cannot be reached. */
function StatusDot({ status }: { status: PingStatus }) {
  if (status === "connecting") return null;
  const live = status === "live";
  return (
    <span
      data-ping-status={status}
      aria-hidden="true"
      title={live ? "Updating live" : "Counter offline"}
      className="relative inline-flex size-2"
    >
      {live && (
        <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
      )}
      <span className={`relative size-2 rounded-full ${live ? "bg-success" : "bg-ink-light"}`} />
    </span>
  );
}

/** One ping: arcs up and over into the funnel (native Web Animations API), then reports landing. */
function PingFlight({ flight, onLand }: { flight: Flight; onLand: (id: number) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const peakY = Math.min(flight.dy, 0) - 90;
    const animation = node.animate(
      [
        { transform: "translate(0px, 0px) scale(0)" },
        { transform: `translate(${flight.dx * 0.45}px, ${peakY}px) scale(1.2)`, offset: 0.45 },
        { transform: `translate(${flight.dx}px, ${flight.dy}px) scale(0.5)` },
      ],
      { duration: 850, easing: cubicBezier(ease.arc), fill: "forwards" },
    );
    let cancelled = false;
    const finish = () => {
      if (!cancelled) onLand(flight.id);
    };
    // The visitor may be leaving for GitHub: a cancelled or interrupted flight still lands.
    animation.finished.then(finish, finish);
    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [flight, onLand]);

  return (
    <span
      ref={ref}
      className="absolute size-3 rounded-full border-2 border-ink bg-accent"
      style={{ left: flight.x - 6, top: flight.y - 6, transform: "scale(0)" }}
    />
  );
}

function FunnelGlyph() {
  return (
    <svg width="56" height="32" viewBox="0 0 56 32" aria-hidden="true" focusable="false">
      <path d="M2 10h22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 4v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="28" y="6" width="22" height="14" rx="3" fill="currentColor" />
      <path d="M50 10h4v6h-4" fill="currentColor" />
      <path d="M32 20v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
