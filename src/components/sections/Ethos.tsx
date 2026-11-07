import type { CSSProperties } from "react";
import { pipeline, principles } from "@/content/portfolio";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WritePathTrace } from "./WritePathTrace";

const ICONS = { eye: "eye", shield: "shield", check: "badge-check" } as const;

export function Ethos() {
  return (
    <section
      id="ethos"
      aria-labelledby="ethos-title"
      className="border-b-2 border-ink py-16 md:py-24"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8">
        <SectionHeader
          id="ethos-title"
          eyebrow="Engineering ethos"
          title="How I work."
          aside={
            <p className="label font-normal text-ink-muted">
              Explicit permission boundaries, tested claims, and limits stated up front.
            </p>
          }
          className="mb-10"
        />

        <ol className="grid gap-5 md:grid-cols-3">
          {principles.map((principle, position) => (
            <li
              key={principle.title}
              data-reveal=""
              style={{ "--reveal-index": position } as CSSProperties}
              className="group flex flex-col rounded-[var(--radius-panel)] border-2 border-ink bg-card p-6 transition-[transform,box-shadow] duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-ink-lg"
            >
              <div className="flex items-center justify-between">
                <p className="label text-accent-strong">Rule // {principle.index}</p>
                <Icon
                  name={ICONS[principle.icon]}
                  size={20}
                  className="text-ink transition-transform duration-500 group-hover:rotate-[360deg]"
                />
              </div>
              <h3 className="mt-3 font-display text-2xl font-extrabold tracking-[-0.02em] uppercase">
                {principle.title}
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-ink-muted">{principle.detail}</p>
              <p className="label mt-6 flex justify-between border-t border-ink/15 pt-4 font-normal text-ink">
                <span>{principle.tag}</span>
                <span aria-hidden="true">
                  {principle.index} / {String(principles.length).padStart(2, "0")}
                </span>
              </p>
            </li>
          ))}
        </ol>

        <div data-reveal="" className="mt-12">
          <WritePathTrace steps={pipeline.steps} caption={pipeline.caption} />
        </div>
      </div>
    </section>
  );
}
