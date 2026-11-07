import type { SVGProps } from "react";

/*
  The handful of glyphs the Stitch exports pulled from the Material Symbols web font, drawn as
  inline SVG instead: no font request, no flash of ligature text, and they inherit currentColor.
*/
const PATHS = {
  "arrow-up-right": "M7 17 17 7M8 7h9v9",
  "arrow-down": "M12 5v14m0 0-6-6m6 6 6-6",
  "arrow-up": "M12 19V5m0 0-6 6m6-6 6 6",
  copy: "M9 9h10v10H9zM5 15V5h10",
  check: "m5 12 5 5L20 7",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  shield: "M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4",
  "badge-check":
    "m12 2.5 2.4 1.8 3 .1.9 2.9 2.2 2-1 2.7 1 2.8-2.2 2-.9 2.9-3 .1L12 21.5l-2.4-1.8-3-.1-.9-2.9-2.2-2 1-2.8-1-2.7 2.2-2 .9-2.9 3-.1L12 2.5Zm-3.5 9.6 2.4 2.4 4.6-4.6",
  code: "m8 8-4 4 4 4m8-8 4 4-4 4",
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  compass: "M12 3v3m0 0a6 6 0 0 1 0 12M12 6a6 6 0 0 0 0 12m0 0v3M9 21l3-15 3 15",
  at: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm0 0v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1",
  cap: "M2 9l10-5 10 5-10 5L2 9Zm4 2.2V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.8M22 9v6",
  sparkle: "M12 2c.6 4.8 2.9 7.4 8 8-5.1.6-7.4 3.2-8 8-.6-4.8-2.9-7.4-8-8 5.1-.6 7.4-3.2 8-8Z",
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 16, ...rest }: IconProps) {
  const filled = name === "sparkle";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
