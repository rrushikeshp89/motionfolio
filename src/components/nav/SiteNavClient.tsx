"use client";

import type { CSSProperties } from "react";
import { navItems, type NavId } from "@/content/nav";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SoundToggle } from "./SoundToggle";
import { useActiveSection } from "./useActiveSection";

const SECTION_IDS = navItems.map((item) => item.id);
const TAB_ICONS: Record<NavId, IconName> = {
  top: "home",
  work: "grid",
  ethos: "compass",
  contact: "at",
};

export interface SiteNavProps {
  name: string;
  role: string;
  location: string;
  resumeUrl: string;
  external: readonly { label: string; href: string }[];
}

/**
 * Desktop: a fixed top bar with a scroll-progress hairline and an ink underline that slides to the
 * active section. Mobile: a compact top bar plus the bottom tab bar from the Stitch mobile export.
 */
export function SiteNavClient({ name, role, location, resumeUrl, external }: SiteNavProps) {
  const active = useActiveSection(SECTION_IDS, "top");
  const activeIndex = Math.max(0, SECTION_IDS.indexOf(active));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/15 bg-surface/90 backdrop-blur-md">
        <div
          aria-hidden="true"
          className="scroll-progress absolute inset-x-0 bottom-[-1px] h-0.5 bg-accent"
        />
        <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between gap-4 px-4 md:h-16 md:px-8">
          <a href="#top" className="label flex min-w-0 items-center gap-2 text-ink">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 animate-pulse rounded-full bg-accent"
            />
            <span className="truncate text-xs tracking-[0.12em]">{name}</span>
            <span aria-hidden="true" className="hidden text-ink-light lg:inline">
              /
            </span>
            <span className="hidden font-normal text-ink-muted lg:inline">
              {role} · {location}
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            <ul className="flex items-center gap-5">
              {navItems.map((item) => (
                <li key={item.id} className="relative">
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? "location" : undefined}
                    className={`label block py-2 transition-colors ${active === item.id ? "text-ink" : "text-ink-muted hover:text-accent-strong"}`}
                  >
                    {item.label}
                  </a>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0.5 h-0.5 origin-left bg-ink transition-transform duration-300 ease-[var(--ease-out-expo)] ${active === item.id ? "scale-x-100" : "scale-x-0"}`}
                  />
                </li>
              ))}
            </ul>
            <span aria-hidden="true" className="h-5 w-px bg-ink/20" />
            <ul className="flex items-center gap-4">
              {external.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label inline-flex items-center gap-1 py-2 text-ink-muted underline-offset-4 transition-colors hover:text-accent-strong hover:underline"
                  >
                    {link.label}
                    <Icon name="arrow-up-right" size={12} />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 md:ml-[-0.5rem]">
            <SoundToggle />
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="label inline-flex min-h-11 items-center gap-1 rounded-full border-2 border-ink bg-card px-3 md:hidden"
            >
              Résumé <Icon name="arrow-up-right" size={12} />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </header>

      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/15 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 h-[3px] w-1/4 px-5 transition-transform duration-300 ease-[var(--ease-spring)]"
          style={{ transform: `translateX(${activeIndex * 100}%)` } as CSSProperties}
        >
          <span className="block h-full rounded-b-full bg-accent" />
        </span>
        <ul className="grid grid-cols-4">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id} className="relative">
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${isActive ? "text-accent-strong" : "text-ink-muted"}`}
                >
                  <Icon name={TAB_ICONS[item.id]} size={20} />
                  <span className="label text-[0.625rem]">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
