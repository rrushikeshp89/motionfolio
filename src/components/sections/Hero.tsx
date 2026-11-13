import type { CSSProperties } from "react";
import { facts } from "@/content/facts";
import { tickerItems } from "@/content/portfolio";
import { LinkButton } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { PingDot } from "@/components/ui/PingDot";
import { Marquee } from "@/motion/Marquee";

const { name, role, location, headline, subline, availability, email } = facts.identity;
const [firstName = name, ...rest] = name.toUpperCase().split(" ");
const lastName = rest.join(" ");
// "Software developer building reliable …" → "building reliable …", since the role is already shown.
const tagline = headline.replace(new RegExp(`^${role}\\s+`, "i"), "").replace(/\.$/, "");

/**
 * Each letter rises out of a clipped line on load, staggered, then becomes "kinetic": hovering
 * (or tapping) a letter springs it up in terracotta with a warm glow, and the whole line opens
 * its tracking, as in the Stitch desktop export. Pure CSS: no JavaScript, and the reduced-motion
 * rule in globals.css turns it off. The line is clipped only while the letters rise, so the
 * hover lift and glow are not cut off afterwards.
 */
function RisingWord({ word, offset }: { word: string; offset: number }) {
  const unclipAt = (offset + word.length) * 45 + 950;
  return (
    <span
      className="flex animate-unclip pb-[0.04em] transition-[letter-spacing] duration-700 [clip-path:inset(0_-0.5em)] hover:tracking-[-0.03em]"
      style={{ animationDelay: `${unclipAt}ms` } as CSSProperties}
      aria-hidden="true"
    >
      {[...word].map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className="inline-block animate-rise"
          style={{ animationDelay: `${(offset + index) * 45}ms` } as CSSProperties}
        >
          <span className="char-kinetic">{letter}</span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-name"
      className="dot-grid relative overflow-hidden border-b-2 border-ink pt-14 md:pt-16"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8">
        <div className="flex flex-col gap-3 border-b border-ink/15 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="label flex animate-fade items-center gap-2 text-ink">
            <PingDot color="bg-success" />
            {availability}
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-3.5 w-[7px] animate-blink bg-accent align-middle"
            />
          </p>
          <div className="flex animate-fade items-center gap-3 [animation-delay:120ms]">
            <Chip tone="sand">2026 edition</Chip>
            <span className="label hidden text-ink-muted sm:inline">
              Full-stack TypeScript + data
            </span>
          </div>
        </div>

        <h1
          id="hero-name"
          className="py-8 font-display text-[clamp(3.25rem,15.5vw,13rem)] leading-[0.82] font-black tracking-[-0.055em] md:py-12"
        >
          <span className="sr-only">{name}</span>
          <RisingWord word={firstName} offset={0} />
          <span className="text-accent md:text-ink">
            <RisingWord word={lastName} offset={firstName.length} />
          </span>
        </h1>

        <div className="grid gap-8 border-t-2 border-ink py-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl animate-fade [animation-delay:600ms]">
            <p className="label flex gap-2 text-ink">
              <span aria-hidden="true" className="mt-1 size-2 shrink-0 bg-accent" />
              <span>
                {role} — {location} / {tagline}
              </span>
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">{subline}</p>
          </div>
          <div className="flex animate-fade flex-wrap items-center gap-3 [animation-delay:750ms]">
            <span data-tactile="" data-cursor="" className="hidden xl:inline-flex">
              <Chip
                tone="sage"
                className="transition-all duration-200 hover:-translate-y-1 hover:border-ink hover:bg-ink hover:text-on-ink hover:shadow-md"
              >
                <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-success" />
                Available for hire
              </Chip>
            </span>
            <LinkButton href="#work" variant="ink" icon="arrow-down">
              Explore work
            </LinkButton>
            <LinkButton href={`mailto:${email}`} variant="outline" icon="arrow-up-right">
              Email direct
            </LinkButton>
          </div>
        </div>

        <Marquee
          label="Recent work"
          className="mb-10 animate-fade rounded-full border-2 border-ink bg-card py-3 shadow-ink-sm [animation-delay:900ms]"
        >
          {tickerItems.map((item) => (
            <span key={item.tag} className="flex items-center gap-3 pl-6">
              <span className="label rounded-full bg-ink px-2.5 py-0.5 text-on-ink">
                {item.tag}
              </span>
              <span className="font-mono text-xs whitespace-nowrap text-ink">{item.text}</span>
              <Icon name="sparkle" size={14} className="ml-3 text-accent" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
