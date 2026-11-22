import { describe, expect, it } from "vitest";
import {
  LOOP_MS,
  START_MS,
  STEP_MS,
  STEPS,
  STILL_STEP,
  frameAt,
  nextChangeAfter,
  pinnedFrame,
  resumeTimeFor,
} from "@/motion/write-path-timeline";

const lit = (t: number) =>
  frameAt(t)
    .steps.map((state, i) => (state === "current" ? i : -1))
    .filter((i) => i >= 0);

describe("write-path timeline (the README card's 11.2 s loop)", () => {
  it("gives each of the seven steps 1.4 s, then commits and resets", () => {
    expect(STEPS).toBe(7);
    expect(STEP_MS).toBe(1400);
    expect(LOOP_MS).toBe(11200);
  });

  it("lights one step at a time, leaving earlier steps settled", () => {
    for (let i = 0; i < STEPS; i += 1) {
      const frame = frameAt(i * STEP_MS + 700);
      expect(lit(i * STEP_MS + 700)).toEqual([i]);
      expect(frame.steps.slice(0, i).every((state) => state === "done")).toBe(true);
      expect(frame.steps.slice(i + 1).every((state) => state === "base")).toBe(true);
      expect(frame.caption).toBe(i);
      expect(frame.at).toBe(i);
    }
  });

  it("starts the token on its way to the next step before that step lights", () => {
    expect(frameAt(STEP_MS - 100).at).toBe(1);
    expect(frameAt(STEP_MS - 100).steps[1]).toBe("base");
  });

  it("shows the commit line after the last step, then fades everything back", () => {
    const commit = frameAt(0.92 * LOOP_MS);
    expect(commit.caption).toBe("commit");
    expect(commit.steps.every((state) => state === "done")).toBe(true);

    const reset = frameAt(0.975 * LOOP_MS);
    expect(reset.visible).toBe(false);
    expect(reset.steps.every((state) => state === "base")).toBe(true);
    expect(reset.caption).toBeNull();

    // The token goes home while hidden, so the next pass starts at step 01.
    expect(frameAt(0.995 * LOOP_MS).at).toBe(0);
    expect(frameAt(LOOP_MS + 700)).toEqual(frameAt(700)); // it loops
  });

  it("only changes at the moments nextChangeAfter reports", () => {
    let t = 0;
    while (t < LOOP_MS) {
      const next = nextChangeAfter(t);
      expect(next).toBeGreaterThan(t);
      // The frame holds steady until the next change.
      expect(frameAt(next - 1)).toEqual(frameAt(t));
      t = next;
    }
  });

  it("resumes a held step from the same picture", () => {
    for (let i = 0; i < STEPS; i += 1) {
      expect(frameAt(resumeTimeFor(i))).toEqual(pinnedFrame(i));
    }
    expect(frameAt(START_MS)).toEqual(pinnedFrame(STILL_STEP));
  });
});
