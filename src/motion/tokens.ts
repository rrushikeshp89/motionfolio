/*
  One vocabulary for the scripted animations (Motion's WAAPI `animate`, motion/react-mini).
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
