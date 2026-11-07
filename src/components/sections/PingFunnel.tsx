"use client";

import { animate } from "motion/mini";
import { useAnimate } from "motion/react-mini";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/motion/hooks";
import { ease } from "@/motion/tokens";

interface Ping {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

/**
 * "Everything ends up here": a click anywhere on the contact block (outside links and buttons)
 * drops a ping that arcs into the funnel card, which counts what it caught. The counter is local
 * to this visit; no number is faked. The funnel itself is a button, so keyboard users can play too.
 */
export function PingFunnel({ children }: { children: ReactNode }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [funnelRef, animateFunnel] = useAnimate<HTMLButtonElement>();
  const nextId = useRef(0);
  const [pings, setPings] = useState<Ping[]>([]);
  const [caught, setCaught] = useState(0);
  const [bump, setBump] = useState(0);
  const reduced = useReducedMotion();

  // A small "gulp" each time the funnel catches something (WAAPI, so it costs almost nothing).
  useEffect(() => {
    if (bump === 0 || reduced || !funnelRef.current) return;
    animateFunnel(
      funnelRef.current,
      { transform: ["scale(0.93) rotate(-3deg)", "scale(1.03) rotate(1deg)", "none"] },
      { duration: 0.35, ease: "easeOut" },
    );
  }, [bump, reduced, animateFunnel, funnelRef]);

  const dispatch = useCallback(
    (clientX: number, clientY: number) => {
      const area = areaRef.current?.getBoundingClientRect();
      const funnel = funnelRef.current?.getBoundingClientRect();
      if (!area || !funnel || funnel.width === 0) return;
      if (reduced) {
        setCaught((count) => count + 1);
        setBump((value) => value + 1);
        return;
      }
      const x = clientX - area.left;
      const y = clientY - area.top;
      const targetX = funnel.left + funnel.width * 0.22 - area.left;
      const targetY = funnel.top + funnel.height / 2 - area.top;
      nextId.current += 1;
      const ping = { id: nextId.current, x, y, dx: targetX - x, dy: targetY - y };
      setPings((current) => [...current.slice(-11), ping]);
    },
    [reduced, funnelRef],
  );

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("a, button, input, [data-ping-ignore]")) return;
      dispatch(event.clientX, event.clientY);
    };
    area.addEventListener("pointerdown", onPointerDown);
    return () => area.removeEventListener("pointerdown", onPointerDown);
  }, [dispatch]);

  const land = useCallback((id: number) => {
    setPings((current) => current.filter((ping) => ping.id !== id));
    setCaught((count) => count + 1);
    setBump((value) => value + 1);
  }, []);

  const fromFunnelButton = () => {
    const area = areaRef.current?.getBoundingClientRect();
    if (!area) return;
    dispatch(area.left + area.width * (0.2 + Math.random() * 0.5), area.top + area.height * 0.7);
  };

  return (
    <div ref={areaRef} className="relative">
      {children}

      <button
        ref={funnelRef}
        type="button"
        onClick={fromFunnelButton}
        className="press absolute top-0 right-0 hidden items-center gap-4 rounded-2xl border-2 border-ink bg-card px-5 py-4 text-left sm:flex"
      >
        <FunnelGlyph />
        <span>
          <span className="block font-mono text-2xl leading-none font-bold tabular-nums">
            {String(caught).padStart(6, "0")}
          </span>
          <span className="label mt-1 block text-accent-strong">Pings caught</span>
          <span className="sr-only">, send a ping to the funnel</span>
        </span>
      </button>

      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
        {pings.map((ping) => (
          <PingDot key={ping.id} ping={ping} onLand={land} />
        ))}
      </span>
    </div>
  );
}

/** One ping: arcs up and over into the funnel (Motion's WAAPI animate), then reports landing. */
function PingDot({ ping, onLand }: { ping: Ping; onLand: (id: number) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const peakY = Math.min(ping.dy, 0) - 90;
    const controls = animate(
      node,
      {
        transform: [
          "translate(0px, 0px) scale(0)",
          `translate(${ping.dx * 0.45}px, ${peakY}px) scale(1.2)`,
          `translate(${ping.dx}px, ${ping.dy}px) scale(0.5)`,
        ],
      },
      { duration: 0.85, ease: ease.arc },
    );
    let cancelled = false;
    controls.then(() => {
      if (!cancelled) onLand(ping.id);
    });
    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [ping, onLand]);

  return (
    <span
      ref={ref}
      className="absolute size-3 rounded-full border-2 border-ink bg-accent"
      style={{ left: ping.x - 6, top: ping.y - 6, transform: "scale(0)" }}
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
