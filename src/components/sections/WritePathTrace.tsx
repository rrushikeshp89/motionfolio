"use client";

import { useEffect, useRef, useState } from "react";
import type { PipelineStep } from "@/content/portfolio";
import { fx } from "@/motion/fx";
import { useInView, useReducedMotion } from "@/motion/hooks";
import {
  LOOP_MS,
  START_MS,
  STILL_STEP,
  frameAt,
  nextChangeAfter,
  pinnedFrame,
  resumeTimeFor,
  type TraceFrame,
} from "@/motion/write-path-timeline";

/** How long a step stays held after a click or tap before the trace carries on. */
const HOLD_MS = 4000;

/**
 * Grove's write path, as on the profile README card: a light paper panel where a request token
 * travels the seven steps (a row on wide screens, a column on phones), each step lights up as it
 * arrives and stays blushed, a trace line says what the step does, and the write commits at the
 * end. It loops while on screen. Clicking, tapping or focusing a step holds the trace there (with
 * a blip and a toast on click) and it carries on after a few seconds. Under reduced motion it
 * holds still on step 03 and only moves when a step is chosen.
 */
export function WritePathTrace({
  steps,
  caption,
  committed,
}: {
  steps: readonly PipelineStep[];
  caption: string;
  committed: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.3);
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState<TraceFrame>(() => pinnedFrame(STILL_STEP));
  // `turn` changes on every hold, so holding the same step again restarts its timer.
  const [held, setHeld] = useState<{ index: number; turn: number } | null>(null);
  const elapsed = useRef(START_MS);

  // Play the loop while the panel is on screen and no step is held.
  useEffect(() => {
    if (!inView || reduced || held) return;
    const origin = performance.now() - elapsed.current;
    let timer = 0;
    const tick = () => {
      const t = (performance.now() - origin) % LOOP_MS;
      elapsed.current = t;
      setFrame(frameAt(t));
      timer = window.setTimeout(tick, Math.max(16, nextChangeAfter(t) - t + 4));
    };
    tick();
    return () => {
      window.clearTimeout(timer);
      elapsed.current = (performance.now() - origin) % LOOP_MS;
    };
  }, [inView, reduced, held]);

  // A held step lets go after a few seconds (not under reduced motion, where nothing plays).
  useEffect(() => {
    if (!held || reduced) return;
    const timer = window.setTimeout(() => setHeld(null), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [held, reduced]);

  const hold = (index: number) => {
    elapsed.current = resumeTimeFor(index);
    setFrame(pinnedFrame(index));
    setHeld((current) => ({ index, turn: (current?.turn ?? 0) + 1 }));
  };
  const choose = (index: number) => {
    hold(index);
    fx.blip(400 + index * 45);
    const step = steps[index];
    if (step) fx.toast(`Trace step ${step.index}: ${step.short}`);
  };

  const last = Math.max(1, steps.length - 1);
  const progress = frame.at / last;
  const heldStep = held ? steps[held.index] : undefined;

  return (
    <div
      ref={ref}
      data-write-path=""
      data-reset={frame.visible ? undefined : ""}
      className="wp-card"
    >
      <p className="wp-title">
        <span aria-hidden="true" />
        Grove HRMS write path
      </p>
      <p className="mt-3 text-base text-ink-muted">{caption}</p>

      <div className="relative mt-5">
        {/* Phones: the rail runs down the left, with a branch to every step. */}
        <Rail
          axis="y"
          count={steps.length}
          progress={progress}
          visible={frame.visible}
          className="wp-rail-y"
        />
        <ol className="wp-list">
          {steps.map((step, index) => {
            const state = frame.steps[index] ?? "base";
            return (
              <li key={step.label}>
                <button
                  type="button"
                  data-state={state}
                  aria-pressed={held?.index === index}
                  onClick={() => choose(index)}
                  onFocus={() => hold(index)}
                  className="wp-step"
                >
                  <span>{step.index}</span>
                  <span>{step.short}</span>
                </button>
              </li>
            );
          })}
        </ol>
        {/* Wide screens: the rail runs under the row, from the first step's centre to the last's. */}
        <Rail
          axis="x"
          count={steps.length}
          progress={progress}
          visible={frame.visible}
          className="wp-rail-x"
        />
      </div>

      <div className="wp-captions">
        <div aria-hidden="true" className="grid">
          {steps.map((step, index) => (
            <p
              key={step.label}
              data-on={frame.caption === index ? "" : undefined}
              className="wp-line"
            >
              <span className="wp-label">
                Trace {step.index}
                <span className="wp-phone-only"> · {step.short}</span>
              </span>
              <span className="wp-text">{step.detail}</span>
            </p>
          ))}
          <p data-on={frame.caption === "commit" ? "" : undefined} className="wp-line">
            <span className="wp-label wp-ok">
              <CheckDot />
              Committed
            </span>
            <span className="wp-text">{committed}</span>
          </p>
        </div>
        <p aria-live="polite" className="sr-only">
          {heldStep ? `Trace ${heldStep.index}, ${heldStep.short}: ${heldStep.detail}` : ""}
        </p>
      </div>
    </div>
  );
}

/** The rail: a sand track with a dot under every step, the tangerine fill, and the token. */
function Rail({
  axis,
  count,
  progress,
  visible,
  className,
}: {
  axis: "x" | "y";
  count: number;
  progress: number;
  visible: boolean;
  className: string;
}) {
  const along = (fraction: number) =>
    axis === "x" ? { left: `${fraction * 100}%` } : { top: `${fraction * 100}%` };
  return (
    <div aria-hidden="true" className={className}>
      <span className="wp-track" />
      <span
        data-visible={visible}
        className="wp-fill"
        style={{ scale: axis === "x" ? `${progress} 1` : `1 ${progress}` }}
      />
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="wp-dot" style={along(i / Math.max(1, count - 1))} />
      ))}
      <span data-visible={visible} className="wp-token" style={along(progress)}>
        <span />
      </span>
    </div>
  );
}

function CheckDot() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M4.5 8l2.5 2.5 4.5-5"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
