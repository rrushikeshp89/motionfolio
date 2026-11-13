"use client";

import { useEffect, useRef } from "react";

interface CountUpProps {
  to: number;
  /** The final text, e.g. "130+". The server HTML shows it, so there is never a wrong number. */
  display: string;
  className?: string;
  /** What screen readers hear, when it differs from `display` (e.g. a suffix rendered outside). */
  srLabel?: string;
  /** Decimal places while counting, e.g. 3 for "0.004". */
  decimals?: number;
}

const DURATION_MS = 1100;

function splitAround(display: string, value: number): [string, string] {
  const digits = String(value);
  const index = display.indexOf(digits);
  if (index === -1) return ["", ""];
  return [display.slice(0, index), display.slice(index + digits.length)];
}

/**
 * Counts up to a metric the first time it scrolls into view, with an expo ease-out. A number already
 * on screen at load just shows its value, nothing moves under reduced motion, and the width is
 * reserved by an invisible copy so counting never shifts layout. Screen readers read the final value from an sr-only copy.
 * Plain requestAnimationFrame: a number tween does not need an animation library.
 */
export function CountUp({ to, display, className = "", srLabel, decimals = 0 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    const [prefix, suffix] = splitAround(display, to);
    const render = (value: number) => {
      node.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
    };
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / DURATION_MS);
          const eased = to * (1 - 2 ** (-10 * progress));
          render(decimals ? eased : Math.round(eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
          else node.textContent = display;
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    render(0);
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      node.textContent = display;
    };
  }, [to, display, decimals]);

  return (
    <>
      {/* The invisible final value sizes the cell, so the live digits never shift layout. */}
      <span aria-hidden="true" className={`inline-grid tabular-nums ${className}`}>
        <span className="invisible col-start-1 row-start-1">{display}</span>
        <span ref={ref} className="col-start-1 row-start-1">
          {display}
        </span>
      </span>
      <span className="sr-only">{srLabel ?? display}</span>
    </>
  );
}
