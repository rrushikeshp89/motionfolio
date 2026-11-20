import { describe, expect, it } from "vitest";
import { INITIAL_COUNT, channelFor, normalizeProfile, reconcile } from "@/motion/pings";

const profiles = {
  github: "https://github.com/rrushikeshp89",
  linkedin: "https://www.linkedin.com/in/rushikesh-panchal/",
};

describe("channelFor", () => {
  it("recognises email, GitHub and LinkedIn profile links", () => {
    expect(channelFor("mailto:someone@example.com", null, profiles)).toBe("email");
    expect(channelFor("https://github.com/rrushikeshp89", null, profiles)).toBe("github");
    expect(channelFor("https://GitHub.com/RRushikeshp89/", null, profiles)).toBe("github");
    expect(channelFor("https://www.linkedin.com/in/rushikesh-panchal", null, profiles)).toBe(
      "linkedin",
    );
  });

  it("ignores project repositories and other links", () => {
    expect(channelFor("https://github.com/rrushikeshp89/grove-hrms", null, profiles)).toBeNull();
    expect(channelFor("https://example.com/", null, profiles)).toBeNull();
    expect(channelFor("#contact", null, profiles)).toBeNull();
    expect(channelFor(null, null, profiles)).toBeNull();
  });

  it("lets an element name its channel (the Copy button)", () => {
    expect(channelFor(null, "email", profiles)).toBe("email");
    expect(channelFor(null, "something-else", profiles)).toBeNull();
  });
});

describe("normalizeProfile", () => {
  it("drops case, protocol and trailing slashes", () => {
    expect(normalizeProfile("https://GitHub.com/Name/")).toBe("github.com/name");
    expect(normalizeProfile("not a url")).toBe("");
  });
});

describe("reconcile", () => {
  it("takes the first value as the baseline, with no remote pings", () => {
    expect(reconcile(INITIAL_COUNT, 41)).toEqual({
      state: { ...INITIAL_COUNT, server: 41 },
      remote: 0,
    });
  });

  it("never moves the count backwards", () => {
    const state = { server: 50, inFlight: 0, own: [] };
    expect(reconcile(state, 48)).toEqual({ state, remote: 0 });
  });

  it("counts increases nobody here caused as remote pings", () => {
    const { state, remote } = reconcile({ server: 41, inFlight: 0, own: [] }, 47);
    expect(state.server).toBe(47);
    expect(remote).toBe(6);
  });

  it("does not report this visitor's own hit as remote, whichever answer arrives first", () => {
    // The stream event arrives while the hit is still in flight.
    expect(reconcile({ server: 41, inFlight: 1, own: [] }, 42).remote).toBe(0);
    // The hit's own answer arrives first.
    const answered = reconcile({ server: 41, inFlight: 0, own: [42] }, 42);
    expect(answered.remote).toBe(0);
    expect(answered.state.own).toEqual([]);
  });

  it("separates own pings from other visitors' in the same jump", () => {
    expect(reconcile({ server: 41, inFlight: 0, own: [43] }, 45).remote).toBe(3);
  });
});
