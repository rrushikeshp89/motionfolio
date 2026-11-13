import type { CSSProperties } from "react";
import { facts } from "@/content/facts";
import { skillUsage } from "@/content/portfolio";
import { getMetric } from "@/content/queries";
import { tagRotation } from "@/motion/tokens";
import { formatYearMonth } from "@/lib/format";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

/** Highlights the measured phrase inside a bullet ("15% … errors") the way the desktop export does. */
function withHighlight(text: string, metricIds: readonly string[]) {
  for (const id of metricIds) {
    const { display } = getMetric(id);
    const at = text.indexOf(display);
    if (at === -1) continue;
    return (
      <>
        {text.slice(0, at)}
        <mark className="rounded-md border border-accent/40 bg-accent-soft px-1 font-semibold text-accent-strong">
          {display}
        </mark>
        {text.slice(at + display.length)}
      </>
    );
  }
  return text;
}

export function Experience() {
  const [education] = facts.education;
  return (
    <section
      id="experience"
      aria-label="Experience and stack"
      className="overflow-x-clip border-b-2 border-ink py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-16 px-4 md:px-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <SectionHeader
            id="experience-title"
            eyebrow="Career & internships"
            title="Experience."
            className="mb-8"
          />
          <ol className="grid gap-5">
            {facts.experience.map((job, position) => (
              <li
                key={job.organization}
                data-reveal=""
                style={{ "--reveal-index": position } as CSSProperties}
                className="rounded-[var(--radius-panel)] border-2 border-ink bg-card p-6 transition-[transform,box-shadow] duration-300 hover:[transform:translateY(-4px)] hover:shadow-ink-lg"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-display text-2xl font-bold tracking-[-0.02em]">
                    {job.role}
                    <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
                  </h3>
                  <Chip tone="ink">{job.organization}</Chip>
                </div>
                <p className="label mt-2 font-normal text-ink-muted">
                  <time dateTime={job.start}>{formatYearMonth(job.start)}</time> –{" "}
                  <time dateTime={job.end}>{formatYearMonth(job.end)}</time> ·{" "}
                  {job.location === job.workMode
                    ? job.workMode
                    : `${job.location}, ${job.workMode}`}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {job.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 leading-relaxed text-ink">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink"
                      />
                      <span>
                        {withHighlight(
                          highlight,
                          job.metrics.map((metric) => metric.id),
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            {education ? (
              <li
                data-reveal=""
                className="rounded-[var(--radius-panel)] border-2 border-ink bg-surface-alt p-6 transition-shadow duration-300 hover:shadow-ink"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="label flex items-center gap-2 text-accent-strong">
                    <Icon name="cap" size={16} />
                    Education
                  </p>
                  <Chip>
                    CGPA: {education.cgpa.value} / {education.cgpa.scale}
                  </Chip>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.02em]">
                  {education.degree}, {education.field}
                </h3>
                <p className="label mt-2 font-normal text-ink-muted">
                  {education.institution}, {education.location} · Graduating{" "}
                  <time dateTime={education.graduation}>
                    {formatYearMonth(education.graduation)}
                  </time>
                </p>
              </li>
            ) : null}
          </ol>
        </div>

        <div>
          <SectionHeader
            id="stack-title"
            eyebrow="Production toolkit"
            title="Tech stack."
            className="mb-8"
          />
          <div className="grid gap-7">
            {facts.skills.map((skill, position) => (
              <div
                key={skill.group}
                data-reveal=""
                style={{ "--reveal-index": position } as CSSProperties}
              >
                <h3 className="label text-ink-muted">{skill.group}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {skill.items.map((item, index) => {
                    const usedIn = skillUsage(item);
                    return (
                      <li key={item} style={{ "--rot": tagRotation(index) } as CSSProperties}>
                        <Chip className="tech-tag hover:border-ink hover:bg-ink hover:text-on-ink">
                          {item}
                          {usedIn.length > 0 ? (
                            <span className="tech-tooltip label rounded-lg border-2 border-ink bg-ink px-2.5 py-1.5 font-normal text-on-ink shadow-ink-sm">
                              <span className="sr-only">, </span>Used in {usedIn.join(" · ")}
                            </span>
                          ) : null}
                        </Chip>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <div data-reveal="">
              <h3 className="label text-ink-muted">Certifications</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {facts.certifications.map((item, index) => (
                  <li key={item} style={{ "--rot": tagRotation(index) } as CSSProperties}>
                    <Chip tone="accent" className="tech-tag shadow-ink-sm">
                      {item}
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
