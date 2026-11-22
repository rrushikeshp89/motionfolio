/*
  The Grove HRMS write-path animation as a timeline, ported from the profile README card
  (rrushikeshp89/rrushikeshp89, scripts/build_cards.py, principles()). One loop lasts 11.2 s and
  each of the seven steps owns 12.5% of it (1.4 s): the request token slides to the step, the box
  lights up tangerine and pops, its trace line fades in, and as the token moves on the box settles
  to a soft blush. After the last step the write commits, then everything resets and starts over.

  frameAt(t) says what is on screen t ms into the loop; nextChangeAfter(t) says when it next
  changes, so the component only re-renders on those moments instead of every animation frame.
*/

export const STEP_MS = 1400;
export const STEPS = 7;
export const LOOP_MS = STEP_MS * 8; // 11.2 s: seven steps, then the commit and the reset
/** How long the token takes to slide from one step to the next (matches the CSS transition). */
export const TOKEN_MS = 448;

const pct = (value: number) => Math.round((value / 100) * LOOP_MS);
const RESET = pct(96); // boxes, token and rail fade back to the start
const SNAP = pct(99); // the token and rail jump home while hidden
const COMMIT_IN = pct(88.5);
const COMMIT_OUT = pct(95);

const start = (i: number) => i * STEP_MS;
/* A step starts lighting as its window opens and starts settling as the next one opens; the
   CSS colour transition (about 150 ms) is the crossfade, as in the card's keyframes. */
const lightAt = (i: number) => start(i);
const settleAt = (i: number) => start(i + 1);
const captionIn = (i: number) => start(i) + pct(0.8);
const captionOut = (i: number) =>
  (i < STEPS - 1 ? start(i + 1) : STEPS * STEP_MS + pct(0.5)) - pct(0.6);
/** The token leaves for step i so that it arrives 1% into that step's window. */
const moveAt = (i: number) => start(i) + pct(1) - TOKEN_MS;

export type StepState = "base" | "current" | "done";

export interface TraceFrame {
  steps: readonly StepState[];
  /** Which step the token sits on (and how far the rail is filled). */
  at: number;
  /** False while the token and rail are faded out for the reset. */
  visible: boolean;
  /** The trace line on show: a step, the commit line, or nothing. */
  caption: number | "commit" | null;
}

export function frameAt(time: number): TraceFrame {
  const t = ((time % LOOP_MS) + LOOP_MS) % LOOP_MS;
  const resetting = t >= RESET;
  const steps = Array.from({ length: STEPS }, (_, i): StepState => {
    if (resetting) return "base";
    if (t >= settleAt(i)) return "done";
    return t >= lightAt(i) ? "current" : "base";
  });
  let at = 0;
  for (let i = 1; i < STEPS; i += 1) if (t >= moveAt(i)) at = i;
  if (t >= SNAP) at = 0;
  let caption: TraceFrame["caption"] = null;
  if (t >= COMMIT_IN && t < COMMIT_OUT) caption = "commit";
  for (let i = 0; i < STEPS; i += 1) if (t >= captionIn(i) && t < captionOut(i)) caption = i;
  return { steps, at, visible: !resetting, caption };
}

const CHANGES = [
  ...Array.from({ length: STEPS }, (_, i) => [
    lightAt(i),
    captionIn(i),
    captionOut(i),
    i > 0 ? moveAt(i) : 0,
  ]).flat(),
  STEPS * STEP_MS, // the last step settles
  COMMIT_IN,
  COMMIT_OUT,
  RESET,
  SNAP,
]
  .filter((value) => value > 0 && value < LOOP_MS)
  .sort((a, b) => a - b);

/** The next moment (ms into the loop, possibly LOOP_MS) at which the frame changes. */
export function nextChangeAfter(time: number): number {
  const t = ((time % LOOP_MS) + LOOP_MS) % LOOP_MS;
  return CHANGES.find((value) => value > t) ?? LOOP_MS;
}

/** The trace held on one step: earlier steps done, this one lit, its trace line showing. */
export function pinnedFrame(index: number): TraceFrame {
  return {
    steps: Array.from({ length: STEPS }, (_, i): StepState =>
      i < index ? "done" : i === index ? "current" : "base",
    ),
    at: index,
    visible: true,
    caption: index,
  };
}

/** Where the loop picks up after a step was held: just after that step lit up. */
export const resumeTimeFor = (index: number) => lightAt(index) + pct(2.4);

/** The still frame before the animation starts (and under reduced motion): paused at step 03,
 *  as the README card shows without animation. The loop starts from this same moment. */
export const STILL_STEP = 2;
export const START_MS = resumeTimeFor(STILL_STEP);
