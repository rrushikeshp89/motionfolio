import { facts } from "@/content/facts";
import {
  monumentalStats,
  pipeline,
  principles,
  tickerItems,
  workEntries,
} from "@/content/portfolio";

const allMetricDisplays = [
  ...facts.projects.flatMap((project) => project.metrics),
  ...facts.experience.flatMap((job) => job.metrics),
].map((metric) => metric.display);

describe("portfolio view models", () => {
  it("lists every flagship project, plus the explainable-ML entry", () => {
    const names = workEntries.map((entry) => entry.id);
    for (const project of facts.projects) expect(names).toContain(project.slug);
    expect(workEntries).toHaveLength(facts.projects.length + 1);
  });

  it("only shows numbers that exist in facts.ts", () => {
    for (const entry of workEntries) {
      for (const stat of entry.stats) expect(allMetricDisplays).toContain(stat.display);
    }
  });

  it("links every project to its live demo, source and main-site case study", () => {
    for (const project of facts.projects) {
      const entry = workEntries.find((candidate) => candidate.id === project.slug);
      const hrefs = entry?.links.map((link) => link.href) ?? [];
      for (const link of project.links) expect(hrefs).toContain(link.href);
      expect(hrefs).toContain(`${facts.site.url}/work/${project.slug}/`);
    }
  });

  it("lists the secondary ML projects with their source links", () => {
    const ml = workEntries.find((entry) => entry.id === "explainable-ml");
    expect(ml?.related?.map((project) => project.name)).toEqual(
      facts.secondaryProjects.map((project) => project.name),
    );
  });

  it("follows the write path in facts.ts, with a description for every step", () => {
    expect(pipeline.steps.map((step) => step.label)).toEqual(facts.approach.writePath.steps);
    for (const step of pipeline.steps) expect(step.detail.length).toBeGreaterThan(20);
  });

  it("keeps the three principles from facts.ts", () => {
    expect(principles.map((principle) => principle.title)).toEqual(
      facts.approach.principles.map((principle) => principle.title),
    );
  });

  it("takes ticker numbers from metrics, not hand-typed copy", () => {
    const text = tickerItems.map((item) => item.text).join(" ");
    expect(text).toContain("45 tables");
    expect(text).toContain("28 permissions");
    expect(text).toContain("130+ tests");
    expect(text).toContain("0.495 → 0.004");
  });

  it("shows the CLS result and names its starting value", () => {
    const cls = monumentalStats.find((stat) => stat.id === "stockroom-cls");
    expect(cls?.display).toBe("0.004");
    expect(cls?.label).toContain("0.495");
  });

  it("never repeats claims the Stitch mock-ups invented", () => {
    const everything = JSON.stringify({ workEntries, tickerItems, principles, pipeline });
    for (const invented of [
      "Multi-tenant",
      "Concurrent",
      "Technical Architect",
      "Founder",
      "Visvesvaraya",
      "MongoDB",
      "Redis",
      "100% containerized",
    ]) {
      expect(everything.toLowerCase()).not.toContain(invented.toLowerCase());
    }
  });
});
