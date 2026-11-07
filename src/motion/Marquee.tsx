import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  label: string;
  className?: string;
}

/**
 * An endless CSS ticker. The content is rendered twice and the track slides by half its width;
 * the copy is hidden from assistive tech, and hovering or focusing pauses it. Under reduced motion
 * the global rule stops the animation and the row simply scrolls horizontally.
 */
export function Marquee({ children, label, className = "" }: MarqueeProps) {
  return (
    <div
      role="region"
      aria-label={label}
      className={`group relative overflow-hidden motion-reduce:overflow-x-auto ${className}`}
    >
      <div className="flex w-max animate-marquee group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center motion-reduce:hidden" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
