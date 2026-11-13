"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { WorkEntry } from "@/content/portfolio";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { PingDot } from "@/components/ui/PingDot";
import { LinkButton } from "@/components/ui/Button";
import { CountUp } from "@/motion/CountUp";
import { fx } from "@/motion/fx";
import { tagRotation } from "@/motion/tokens";
import { RoleSimulator } from "./RoleSimulator";

/**
 * The work list and its inspector panel. Desktop: a list of systems on the left, a sticky panel on
 * the right. Mobile: a tab strip above the panel. Both are ARIA tab lists with arrow-key support.
 * Every panel is in the server HTML (inactive ones `hidden`), so all projects are readable and
 * indexable without JavaScript. Switching cross-fades like the Stitch inspector: the shown panel
 * fades down and out (WAAPI, 150 ms), then the next one rises in (a CSS keyframe). The tab state
 * updates at once, so keyboard and screen-reader users never wait on the animation.
 */
export function ProjectInspector({ entries }: { entries: readonly WorkEntry[] }) {
  const [activeIndex, setSelected] = useState(0);
  const [shownIndex, setShownIndex] = useState(0);
  const panelRef = useRef<HTMLElement | null>(null);
  const fadeRef = useRef<Animation | null>(null);
  const baseId = useId();

  function setActiveIndex(index: number, announce = false) {
    setSelected(index);
    if (announce) {
      const entry = entries[index];
      if (entry) fx.toast(`Viewing: ${entry.name}`);
    }
    fadeRef.current?.cancel();
    const panel = panelRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!panel || reduced || index === shownIndex) {
      setShownIndex(index);
      return;
    }
    const fade = panel.animate(
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "translateY(8px)" },
      ],
      { duration: 150, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
    );
    fadeRef.current = fade;
    fade.onfinish = () => setShownIndex(index);
  }
  const listRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stripRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, refs: typeof listRefs) {
    const last = entries.length - 1;
    const keys: Record<string, number> = {
      ArrowDown: activeIndex === last ? 0 : activeIndex + 1,
      ArrowRight: activeIndex === last ? 0 : activeIndex + 1,
      ArrowUp: activeIndex === 0 ? last : activeIndex - 1,
      ArrowLeft: activeIndex === 0 ? last : activeIndex - 1,
      Home: 0,
      End: last,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActiveIndex(next, true);
    refs.current[next]?.focus();
  }

  const tabId = (index: number, where: "list" | "strip") => `${baseId}-${where}-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8">
      {/* Desktop list */}
      <div
        role="tablist"
        aria-label="Selected work"
        aria-orientation="vertical"
        className="hidden flex-col gap-3 lg:flex"
      >
        {entries.map((entry, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={entry.id}
              ref={(node) => {
                listRefs.current[index] = node;
              }}
              id={tabId(index, "list")}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(index)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveIndex(index, true)}
              onMouseEnter={() => setActiveIndex(index)}
              onKeyDown={(event) => onKeyDown(event, listRefs)}
              data-reveal=""
              style={{ "--reveal-index": index } as CSSProperties}
              className={`group relative rounded-[var(--radius-card)] border-2 p-5 text-left transition-[background-color,border-color,box-shadow,transform] duration-300 ${selected ? "border-ink bg-card shadow-ink" : "border-ink/15 bg-surface-alt hover:border-ink/60 hover:bg-card"}`}
            >
              <span className="flex items-baseline gap-4">
                <span
                  className={`label ${selected ? "text-accent-strong" : "text-ink-light"}`}
                  aria-hidden="true"
                >
                  {entry.index}
                </span>
                <span
                  className={`font-display text-3xl font-extrabold tracking-[-0.03em] transition-colors ${selected ? "text-accent-strong" : "text-ink"}`}
                >
                  {entry.name}
                </span>
                {selected ? (
                  <span className="animate-pop">
                    <Chip tone="accent">{entry.badge}</Chip>
                  </span>
                ) : null}
                <Icon
                  name="arrow-up-right"
                  size={16}
                  className={`ml-auto self-center transition-transform duration-300 ${selected ? "rotate-45 text-accent-strong" : "text-ink-light group-hover:translate-x-0.5 group-hover:-translate-y-0.5"}`}
                />
              </span>
              <span className="label mt-3 flex flex-wrap gap-x-3 gap-y-1 pl-9 font-normal text-ink-muted">
                {entry.stack.slice(0, 5).map((item, i) => (
                  <span key={item} className="flex items-center gap-3">
                    {i > 0 ? <span aria-hidden="true">•</span> : null}
                    {item}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile tab strip */}
      <div
        role="tablist"
        aria-label="Selected work"
        className="relative grid grid-cols-4 gap-1 rounded-xl border-2 border-ink bg-card p-1 lg:hidden"
      >
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem-0.75rem)/4)] rounded-lg bg-ink transition-transform duration-300 ease-[var(--ease-spring)]"
          style={
            { transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))` } as CSSProperties
          }
        />
        {entries.map((entry, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={entry.id}
              ref={(node) => {
                stripRefs.current[index] = node;
              }}
              id={tabId(index, "strip")}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(index)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveIndex(index, true)}
              onKeyDown={(event) => onKeyDown(event, stripRefs)}
              className="relative min-h-11 rounded-lg px-1"
            >
              <span className={`label relative ${selected ? "text-on-ink" : "text-ink-muted"}`}>
                <span aria-hidden="true">{entry.index} </span>
                {entry.tab}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        {entries.map((entry, index) =>
          index === shownIndex ? (
            <article
              ref={panelRef}
              key={`${entry.id}-active`}
              id={panelId(index)}
              role="tabpanel"
              aria-label={entry.name}
              tabIndex={0}
              className="animate-panel-in rounded-[var(--radius-panel)] border-2 border-ink bg-card p-5 shadow-ink-lg sm:p-7"
            >
              <Panel entry={entry} />
            </article>
          ) : (
            <article
              key={entry.id}
              id={panelId(index)}
              role="tabpanel"
              aria-label={entry.name}
              hidden
            >
              <Panel entry={entry} />
            </article>
          ),
        )}
      </div>
    </div>
  );
}

function Panel({ entry }: { entry: WorkEntry }) {
  const live = entry.links.find((link) => link.kind === "live");
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-ink/15 pb-4">
        <Chip tone="ink">
          <PingDot className="scale-75" />
          Inspect
        </Chip>
        <span className="label font-normal text-ink-muted">
          {entry.index} · {entry.name}
        </span>
        <Chip tone="sage" className="ml-auto">
          {entry.badge}
        </Chip>
      </div>

      <h3 className="mt-5 flex items-center gap-2 font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
        {entry.name}
        <Icon name="badge-check" size={22} className="text-accent" />
      </h3>
      <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-[1.0625rem]">
        {entry.pitch}
      </p>

      {entry.stats.length > 0 ? (
        <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {entry.stats.map((stat) => (
            <div
              key={stat.label}
              className="shimmer flex flex-col-reverse items-center justify-center rounded-xl border border-ink/15 bg-surface-alt px-2 py-3 text-center"
            >
              <dt className="label mt-1 text-[0.625rem] font-normal text-ink-muted">
                {stat.label}
              </dt>
              <dd className="font-display text-2xl font-extrabold tracking-tight">
                {stat.countTo === undefined ? (
                  stat.display
                ) : (
                  <CountUp to={stat.countTo} display={stat.display} />
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {entry.bullets.length > 0 && entry.stats.length < 4 ? (
        <ul className="mt-5 space-y-2.5">
          {entry.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-ink">
              <Icon name="sparkle" size={12} className="mt-1 shrink-0 text-accent" />
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}

      {entry.related ? (
        <ul className="mt-5 grid gap-3">
          {entry.related.map((project) => (
            <li key={project.name} className="rounded-xl border-2 border-ink/15 bg-surface-alt p-4">
              <p className="font-display text-lg font-bold">{project.name}</p>
              <p className="mt-1 text-sm text-ink-muted">{project.summary}</p>
              <p className="mt-3 flex flex-wrap gap-4">
                <ExternalTextLink href={project.href}>Source</ExternalTextLink>
                {project.live ? (
                  <ExternalTextLink href={project.live}>Live demo</ExternalTextLink>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {entry.hasRoleDemo && live ? (
        <div className="mt-6">
          <RoleSimulator liveDemoHref={live.href} />
        </div>
      ) : null}

      <p className="label mt-6 text-ink-muted">Stack</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {entry.stack.map((item, index) => (
          <li key={item} style={{ "--rot": tagRotation(index) } as CSSProperties}>
            <Chip className="tech-tag">{item}</Chip>
          </li>
        ))}
      </ul>

      {entry.links.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-ink/15 pt-5">
          {entry.links.map((link) => (
            <LinkButton
              key={link.kind}
              href={link.href}
              variant={link.kind === "live" ? "ink" : "outline"}
              icon={link.kind === "source" ? "code" : "arrow-up-right"}
            >
              {link.label}
            </LinkButton>
          ))}
        </div>
      ) : null}
    </>
  );
}

function ExternalTextLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="label inline-flex min-h-6 items-center gap-1 text-accent-strong underline underline-offset-4 hover:no-underline"
    >
      {children}
      <Icon name="arrow-up-right" size={12} />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
