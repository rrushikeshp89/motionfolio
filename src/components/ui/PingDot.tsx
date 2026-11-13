interface PingDotProps {
  /** Tailwind background class for the dot and its ring. */
  color?: string;
  className?: string;
}

/** A status dot with an expanding "radar" ring, as on the Stitch eyebrows and live labels. */
export function PingDot({ color = "bg-accent", className = "" }: PingDotProps) {
  return (
    <span aria-hidden="true" className={`relative inline-flex size-2 shrink-0 ${className}`}>
      <span
        className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${color}`}
      />
      <span className={`relative inline-flex size-2 rounded-full ${color}`} />
    </span>
  );
}
