/*
  One vocabulary for the scripted animations (the browser's Web Animations API).
  CSS animations use the matching --ease-* and keyframes in globals.css.
*/
export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  arc: [0.45, 0, 0.55, 1],
} as const;

export const duration = {
  fast: 0.18,
  base: 0.32,
  slow: 0.6,
} as const;

/** Alternating tilts for the tap "spring" on tech tags (the Stitch mobile export's --rot values). */
const TAG_ROTATIONS = ["-2deg", "2deg", "-1.5deg", "1.5deg", "-1deg", "2deg"] as const;
export const tagRotation = (index: number) => TAG_ROTATIONS[index % TAG_ROTATIONS.length];

/** A cubic-bezier tuple as a CSS easing string, for the Web Animations API. */
export const cubicBezier = (points: readonly [number, number, number, number]) =>
  `cubic-bezier(${points.join(", ")})`;
