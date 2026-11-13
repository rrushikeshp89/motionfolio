import type { CSSProperties } from "react";
import { monumentalStats } from "@/content/portfolio";
import { PingDot } from "@/components/ui/PingDot";
import { CountUp } from "@/motion/CountUp";

/** Splits "130+" into the number and a trailing accent mark, as the desktop export sets it. */
function splitSuffix(display: string): [string, string] {
  const match = /^(.*?)([+%]?)$/.exec(display);
  return [match?.[1] ?? display, match?.[2] ?? ""];
}

export function Metrics() {
  return (
    <section
      aria-labelledby="metrics-title"
      className="border-b-2 border-ink bg-surface-alt py-16 md:py-24"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8">
        <h2 id="metrics-title" className="label mb-8 flex items-center gap-2 text-accent-strong">
          <PingDot />
          Verified numbers
        </h2>
        <dl className="grid gap-10 md:grid-cols-3 md:gap-0">
          {monumentalStats.map((stat, position) => {
            const [number, suffix] = splitSuffix(stat.display);
            return (
              <div
                key={stat.id}
                data-reveal=""
                style={{ "--reveal-index": position } as CSSProperties}
                className="shimmer flex flex-col rounded-2xl border-ink/15 p-4 md:rounded-none md:border-l md:px-8 md:first:border-l-0"
              >
                <dt className="label order-2 mt-4 text-ink">{stat.label}</dt>
                <dd className="order-1 font-display text-[clamp(4.5rem,11vw,9rem)] leading-[0.85] font-black tracking-[-0.06em]">
                  {stat.countTo === undefined ? (
                    <span aria-hidden="true">{number}</span>
                  ) : (
                    <CountUp
                      to={stat.countTo}
                      display={number}
                      srLabel={stat.display}
                      {...(stat.decimals ? { decimals: stat.decimals } : {})}
                    />
                  )}
                  {suffix ? (
                    <span aria-hidden="true" className="text-accent">
                      {suffix}
                    </span>
                  ) : null}
                  {stat.countTo === undefined ? (
                    <span className="sr-only">{stat.display}</span>
                  ) : null}
                </dd>
                <dd className="order-3 mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
                  {stat.detail}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
