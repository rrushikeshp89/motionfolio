import type { ReactNode } from "react";
import { isExternalHref } from "@/lib/links";
import { Icon, type IconName } from "./Icon";

type Variant = "ink" | "outline" | "accent";

const VARIANTS: Record<Variant, string> = {
  ink: "border-ink bg-ink text-on-ink hover:bg-accent-strong",
  outline: "border-ink bg-card text-ink hover:bg-sand",
  accent: "border-ink bg-accent text-ink hover:bg-tangerine",
};

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  icon?: IconName;
  className?: string;
}

/**
 * A link styled as the design's "keystroke" button: ink border, hard shadow, presses flat.
 * External links open in a new tab with rel="noopener noreferrer".
 */
export function LinkButton({
  href,
  children,
  variant = "ink",
  icon,
  className = "",
}: LinkButtonProps) {
  const external = isExternalHref(href) && !href.startsWith("mailto:");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`press label inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 px-5 py-2.5 ${VARIANTS[variant]} ${className}`}
    >
      {children}
      {icon ? <Icon name={icon} size={14} /> : null}
      {external ? <span className="sr-only">(opens in a new tab)</span> : null}
    </a>
  );
}
