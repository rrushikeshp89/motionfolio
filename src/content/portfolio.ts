import { facts } from "./facts";
import { getMetric, getProject } from "./queries";
import type { Metric } from "./schema";

/*
  View models for the Motion Portfolio, derived from facts.ts. Components read these, never raw
  strings: every number and claim on the page traces back to a fact. Where Stitch's copy added
  something facts.ts does not support (role titles, release dates, "multi-tenant", invented stats),
  it was dropped; see DECISIONS.md.
*/

const grove = getProject("grove-hrms");
const leadhub = getProject("leadhub-crm");
const stockroom = getProject("stockroom-erp");

const metricDisplay = (id: string) => getMetric(id).display;

export interface TickerItem {
  tag: string;
  text: string;
}

/** The hero marquee: one line per shipped system, numbers straight from the metrics. */
export const tickerItems: readonly TickerItem[] = [
  {
    tag: "Recent ship",
    text: `${grove.name}: ${metricDisplay("grove-tables")} tables · ${metricDisplay("grove-permissions")} permissions · ${metricDisplay("grove-tests")} tests`,
  },
  {
    tag: "Perf audit",
    text: `Stockroom ERP: layout shift ${metricDisplay("stockroom-cls")}`,
  },
  {
    tag: leadhub.name,
    text: "One shared Zod domain layer, shipped as a Docker image",
  },
  {
    tag: "Explainable ML",
    text: "Readmission Shield: SHAP reasons for every score",
  },
];

export interface InspectorStat {
  display: string;
  countTo?: number;
  label: string;
}

export interface InspectorLink {
  kind: "live" | "source" | "case-study";
  label: string;
  href: string;
}

export interface RelatedProject {
  name: string;
  summary: string;
  href: string;
  live?: string;
}

export interface WorkEntry {
  id: string;
  index: string;
  /** Short tab label for the mobile tab strip. */
  tab: string;
  name: string;
  badge: string;
  pitch: string;
  /** Up to four headline numbers; empty when the project has no measured metrics. */
  stats: readonly InspectorStat[];
  bullets: readonly string[];
  stack: readonly string[];
  links: readonly InspectorLink[];
  /** Grove carries the interactive role simulator. */
  hasRoleDemo: boolean;
  /** Further projects listed inside the panel (the explainable-ML entry). */
  related?: readonly RelatedProject[];
}

const statsFrom = (metrics: readonly Metric[]): InspectorStat[] =>
  metrics.slice(0, 4).map((metric) => ({
    display: metric.display,
    ...(metric.countTo === undefined ? {} : { countTo: metric.countTo }),
    label: metric.label,
  }));

function linksFor(slug: string): InspectorLink[] {
  const project = getProject(slug);
  const live = project.links.find((link) => link.kind === "live");
  const source = project.links.find((link) => link.kind === "source");
  return [
    ...(live ? [{ kind: "live" as const, label: "Live demo", href: live.href }] : []),
    ...(source ? [{ kind: "source" as const, label: "Source", href: source.href }] : []),
    {
      kind: "case-study" as const,
      label: "Case study",
      href: `${facts.site.url}/work/${slug}/`,
    },
  ];
}

const mlProjects: RelatedProject[] = facts.secondaryProjects.map((project) => {
  const source = project.links.find((link) => link.kind === "source");
  const live = project.links.find((link) => link.kind === "live");
  if (!source) throw new Error(`${project.name} has no source link`);
  return {
    name: project.name,
    summary: project.summary,
    href: source.href,
    ...(live ? { live: live.href } : {}),
  };
});

export const workEntries: readonly WorkEntry[] = [
  {
    id: grove.slug,
    index: "01",
    tab: "Grove",
    name: grove.name,
    badge: "Flagship",
    pitch: grove.pitch,
    stats: statsFrom(grove.metrics),
    bullets: grove.bullets,
    stack: grove.stack,
    links: linksFor(grove.slug),
    hasRoleDemo: true,
  },
  {
    id: leadhub.slug,
    index: "02",
    tab: "CRM",
    name: leadhub.name,
    badge: "Live in production",
    pitch: leadhub.pitch,
    stats: statsFrom(leadhub.metrics),
    bullets: leadhub.bullets,
    stack: leadhub.stack,
    links: linksFor(leadhub.slug),
    hasRoleDemo: false,
  },
  {
    id: stockroom.slug,
    index: "03",
    tab: "ERP",
    name: "Stockroom ERP",
    badge: "Audit verified",
    pitch: stockroom.pitch,
    stats: statsFrom(stockroom.metrics),
    bullets: stockroom.bullets,
    stack: stockroom.stack,
    links: linksFor(stockroom.slug),
    hasRoleDemo: false,
  },
  {
    id: "explainable-ml",
    index: "04",
    tab: "ML",
    name: "Explainable ML",
    badge: "Show the why",
    pitch:
      "Machine-learning projects that explain themselves: weighted factors for résumé matching, a cited reasoning chain for research, SHAP reasons for every risk score.",
    stats: [],
    bullets: [],
    stack: ["Python", "Scikit-Learn", "SHAP", "Streamlit"],
    links: [],
    hasRoleDemo: false,
    related: mlProjects,
  },
];

export interface Principle {
  index: string;
  title: string;
  detail: string;
  tag: string;
  icon: "eye" | "shield" | "check";
}

const PRINCIPLE_DECOR = [
  { tag: "Explainability", icon: "eye" },
  { tag: "Server-side enforcement", icon: "shield" },
  { tag: "Stated limits", icon: "check" },
] as const;

export const principles: readonly Principle[] = facts.approach.principles.map(
  (principle, position) => {
    const decor = PRINCIPLE_DECOR[position];
    if (!decor) throw new Error("More principles than decorations");
    return {
      index: String(position + 1).padStart(2, "0"),
      title: principle.title,
      detail: principle.detail,
      ...decor,
    };
  },
);

export interface PipelineStep {
  index: string;
  label: string;
  detail: string;
}

/*
  What each write-path step does, condensed from Grove's case study (facts.projects[0].caseStudy).
  Keyed by the step names in facts.approach.writePath, so renaming a step fails the build.
*/
const STEP_DETAILS: Record<string, string> = {
  Interface: "A React form submits the change to a Next.js server action.",
  "Server action": "createAction runs the same steps for every change, every time.",
  "Permission check":
    "Role, scope and record are checked on the server; hiding a button is never the only safeguard.",
  "Zod validation": "The payload is validated with Zod before anything touches the database.",
  Transaction: "The change, its audit entries and its notifications commit together or not at all.",
  "Audit log": "Every change leaves an audit entry, written inside the same transaction.",
  PostgreSQL:
    "Supabase Postgres through Prisma, with row level security and no policies: only the server connects.",
};

export const pipeline = {
  caption: facts.approach.writePath.caption,
  steps: facts.approach.writePath.steps.map((label, position): PipelineStep => {
    const detail = STEP_DETAILS[label];
    if (!detail) throw new Error(`No description for write-path step "${label}"`);
    return { index: String(position + 1).padStart(2, "0"), label, detail };
  }),
};

export interface MonumentalStat {
  id: string;
  display: string;
  countTo?: number;
  label: string;
  detail: string;
}

/** The three big numbers: tests, schema size, and the layout-shift fix. */
export const monumentalStats: readonly MonumentalStat[] = [
  "grove-tests",
  "grove-tables",
  "stockroom-cls",
].map((id) => {
  const metric = getMetric(id);
  const isCls = id === "stockroom-cls";
  return {
    id,
    // The CLS metric reads "0.495 → 0.004"; the monument shows the result and names the start.
    display: isCls ? (metric.display.split("→").pop()?.trim() ?? metric.display) : metric.display,
    ...(metric.countTo === undefined ? {} : { countTo: metric.countTo }),
    label: isCls ? "final layout shift, down from 0.495" : metric.label,
    detail: metric.receipt.explanation,
  };
});
