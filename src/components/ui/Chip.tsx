import type { ReactNode } from "react";

type Tone = "outline" | "ink" | "accent" | "sage" | "sand";

const TONES: Record<Tone, string> = {
  outline: "border-ink/20 bg-card text-ink",
  ink: "border-ink bg-ink text-on-ink",
  accent: "border-ink bg-accent text-ink",
  sage: "border-sage-strong/30 bg-sage-soft text-sage-strong",
  sand: "border-ink/15 bg-sand text-ink",
};

interface ChipProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

/** Space Mono pill for stack items, badges and status. */
export function Chip({ children, tone = "outline", className = "" }: ChipProps) {
  return (
    <span
      className={`label inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
