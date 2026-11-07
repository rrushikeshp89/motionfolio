import { facts } from "./facts";
import type { Metric, Project } from "./schema";

export function getProject(slug: string): Project {
  const project = facts.projects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
}

const ALL_METRICS: readonly Metric[] = [
  ...facts.projects.flatMap((project) => project.metrics),
  ...facts.experience.flatMap((job) => job.metrics),
];

export function getMetric(id: string): Metric {
  const metric = ALL_METRICS.find((candidate) => candidate.id === id);
  if (!metric) throw new Error(`Unknown metric: ${id}`);
  return metric;
}
