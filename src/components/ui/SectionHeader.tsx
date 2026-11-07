import type { ReactNode } from "react";

interface SectionHeaderProps {
  id?: string;
  eyebrow: string;
  title: string;
  aside?: ReactNode;
  className?: string;
}

/** Eyebrow dot + label, a stamped Outfit headline, and an optional right-hand note. */
export function SectionHeader({ id, eyebrow, title, aside, className = "" }: SectionHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-4 border-b border-ink/15 pb-6 md:flex-row md:items-end md:justify-between ${className}`}
    >
      <div data-reveal="">
        <p className="label flex items-center gap-2 text-accent-strong">
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          {eyebrow}
        </p>
        <h2
          id={id}
          className="mt-2 font-display text-[2.25rem] leading-[0.95] font-extrabold tracking-[-0.04em] uppercase sm:text-5xl lg:text-[3.5rem]"
        >
          {title}
        </h2>
      </div>
      {aside ? (
        <div data-reveal="" className="md:max-w-sm md:text-right">
          {aside}
        </div>
      ) : null}
    </header>
  );
}
