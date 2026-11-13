"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { PipelineStep } from "@/content/portfolio";
import { fx } from "@/motion/fx";
import { useInView, useReducedMotion } from "@/motion/hooks";

const STEP_MS = 1400;

/**
 * Grove's write path as a row of nodes on an ink panel, with the Stitch "pulse beam" sweeping
 * across it. The trace walks through the steps on its own once the panel is in view; hovering,
 * focusing or tapping a node takes over, pins the trace there and blips (a rising pitch per step). The description below is a live region, so the selected step is announced. Under reduced
 * motion the beam never auto-advances and simply jumps to the chosen node.
 */
export function WritePathTrace({
  steps,
  caption,
}: {
  steps: readonly PipelineStep[];
  caption: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.5);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!inView || pinned || reduced) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % steps.length),
      STEP_MS,
    );
    return () => window.clearInterval(timer);
  }, [inView, pinned, reduced, steps.length]);

  const select = (index: number) => {
    setPinned(true);
    setActive(index);
    fx.blip(400 + index * 45);
  };
  const choose = (index: number) => {
    select(index);
    const step = steps[index];
    if (step) fx.toast(`Trace step ${step.index}: ${step.label}`);
  };
  const current = steps[active] ?? steps[0];
  const progress = steps.length > 1 ? active / (steps.length - 1) : 1;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[var(--radius-panel)] border-2 border-ink bg-ink p-5 text-on-ink shadow-ink-lg sm:p-7"
    >
      <span aria-hidden="true" className="pipeline-beam" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <p className="label flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2 animate-beacon rounded-full bg-accent text-accent"
          />
          Grove HRMS write path
        </p>
        <p className="label rounded-full border border-on-ink/20 px-2.5 py-1 font-normal text-on-ink-muted">
          {pinned ? "Pinned: select any step" : "Select a step to trace it"}
        </p>
      </div>
      <p className="relative mt-2 text-sm text-on-ink-muted">{caption}</p>

      <ol className="relative mt-6 flex gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
        {/* The beam: a rail behind the nodes that fills up to the active step (desktop). */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 right-[7%] left-[7%] hidden h-0.5 -translate-y-1/2 bg-on-ink/15 lg:block"
        >
          <span
            className="absolute inset-y-0 left-0 w-full origin-left bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)]"
            style={{ transform: `scaleX(${progress})` } as CSSProperties}
          />
        </span>
        {steps.map((step, index) => {
          const isActive = index === active;
          const isPast = index < active;
          return (
            <li key={step.label} className="relative shrink-0 lg:shrink">
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => choose(index)}
                onMouseEnter={() => select(index)}
                onFocus={() => select(index)}
                className={`relative flex min-h-16 w-32 flex-col items-center justify-center rounded-xl border-2 px-2 py-2 text-center transition-[color,background-color,border-color,transform] duration-300 hover:scale-105 lg:w-full ${isActive ? "scale-105 border-accent bg-accent text-ink" : isPast ? "border-accent/60 bg-ink-raised text-on-ink" : "border-on-ink/15 bg-ink-raised text-on-ink hover:border-on-ink/40"}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -inset-1 rounded-[0.9rem] border-2 border-accent/50 transition-[opacity,transform] duration-300 ${isActive ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
                />
                <span
                  className={`label text-[0.625rem] ${isActive ? "text-ink" : "text-tangerine"}`}
                >
                  {step.index}
                </span>
                <span className="label mt-0.5 text-[0.6875rem] leading-tight">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="relative mt-5 border-t border-on-ink/15 pt-4">
        <p aria-live="polite" className="font-mono text-xs leading-relaxed text-on-ink sm:text-sm">
          <span className="text-accent">
            Trace {current?.index} {current?.label}:
          </span>{" "}
          {current?.detail}
        </p>
      </div>
    </div>
  );
}
