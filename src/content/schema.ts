import { z } from "zod";

/** Marks a fact that still needs the owner's confirmation. Allowed while building, rejected at ship. */
export const TODO_CONFIRM = "TODO(confirm)";

const text = z.string().trim().min(1);
const httpsUrl = z.url({ protocol: /^https$/ });
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case");
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "must be YYYY-MM");
const pending = z.literal(TODO_CONFIRM);

const proofSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("repo"), href: httpsUrl, label: text }),
  z.object({ kind: z.literal("tests"), href: httpsUrl, label: text }),
  z.object({ kind: z.literal("ci"), href: httpsUrl, label: text }),
  z.object({ kind: z.literal("live"), href: httpsUrl, label: text }),
  z.object({ kind: z.literal("resume"), label: text }),
]);

const metricSchema = z.object({
  id: slug,
  /** Exactly what the page shows, e.g. "130+" or "0.495 → 0.004". */
  display: text,
  /** Optional numeric target for the count-up animation; must match `display`. */
  countTo: z.number().nonnegative().optional(),
  label: text,
  receipt: z.object({
    explanation: text,
    proof: proofSchema,
  }),
});

const projectLinkSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("source"), href: httpsUrl }),
  z.object({ kind: z.literal("live"), href: httpsUrl }),
]);

const caseStudySchema = z.object({
  /** What the system is for and what makes it hard, in two or three sentences. */
  problem: text,
  /** Drawn as stacked layers, top to bottom, with arrows between them. */
  diagram: z.object({
    title: text,
    description: text,
    layers: z.array(z.object({ label: text, items: z.array(text).min(1) })).min(2),
  }),
  decisions: z.array(z.object({ title: text, detail: text })).min(2),
  proof: z.array(z.object({ claim: text, label: text, href: httpsUrl })).min(1),
});

const projectSchema = z.object({
  slug,
  name: text,
  pitch: text,
  stack: z.array(text).min(1),
  bullets: z.array(text).min(1).max(3),
  links: z.array(projectLinkSchema).min(1),
  metrics: z.array(metricSchema),
  limitations: z.union([z.array(text).min(1), pending]),
  caseStudy: caseStudySchema,
});

const secondaryProjectSchema = z.object({
  name: text,
  summary: text,
  links: z.array(projectLinkSchema).min(1),
});

const experienceSchema = z.object({
  role: text,
  organization: text,
  start: yearMonth,
  end: yearMonth,
  location: text,
  workMode: z.enum(["On-site", "Remote"]),
  highlights: z.array(text).min(1),
  metrics: z.array(metricSchema),
});

const educationSchema = z.object({
  degree: text,
  field: text,
  institution: text,
  location: text,
  graduation: yearMonth,
  cgpa: z.object({ value: z.number().positive(), scale: z.number().positive() }),
});

export const SKILL_GROUPS = [
  "Languages",
  "Frontend",
  "Backend",
  "Databases",
  "Security",
  "DevOps & tools",
] as const;

const skillGroupSchema = z.object({
  group: z.enum(SKILL_GROUPS),
  items: z.array(text).min(1),
});

export const factsSchema = z
  .object({
    site: z.object({
      url: z.union([httpsUrl, pending]),
      source: httpsUrl,
    }),
    identity: z.object({
      name: text,
      role: text,
      location: text,
      email: z.email(),
      linkedin: httpsUrl,
      github: httpsUrl,
      headline: text,
      /** The phrase of the headline set in italic accent; must occur in `headline`. */
      headlineEmphasis: text,
      subline: text,
      availability: text,
      objective: text,
      /** Site path of the résumé PDF, e.g. "/resume.pdf". */
      resume: z.union([z.string().regex(/^\/[\w./-]+\.pdf$/), pending]),
    }),
    approach: z.object({
      principles: z.array(z.object({ title: text, detail: text })).length(3),
      writePath: z.object({ caption: text, steps: z.array(text).min(2) }),
    }),
    projects: z.array(projectSchema).min(1),
    secondaryProjects: z.array(secondaryProjectSchema),
    experience: z.array(experienceSchema),
    education: z.array(educationSchema).min(1),
    certifications: z.array(text),
    skills: z.array(skillGroupSchema).length(SKILL_GROUPS.length),
  })
  .superRefine((facts, ctx) => {
    const projectSlugs = facts.projects.map((project) => project.slug);
    reportDuplicates(projectSlugs, "project slug", ctx);

    const metricIds = [
      ...facts.projects.flatMap((project) => project.metrics),
      ...facts.experience.flatMap((job) => job.metrics),
    ].map((metric) => metric.id);
    reportDuplicates(metricIds, "metric id", ctx);

    const groups = facts.skills.map((skill) => skill.group);
    reportDuplicates(groups, "skill group", ctx);

    if (!facts.identity.headline.includes(facts.identity.headlineEmphasis)) {
      ctx.addIssue({ code: "custom", message: "headlineEmphasis must appear in headline" });
    }
  });

function reportDuplicates(values: readonly string[], label: string, ctx: z.RefinementCtx) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) ctx.addIssue({ code: "custom", message: `Duplicate ${label}: ${value}` });
    seen.add(value);
  }
}

export type Facts = z.infer<typeof factsSchema>;
export type FactsInput = z.input<typeof factsSchema>;
export type Project = Facts["projects"][number];
export type Metric = z.infer<typeof metricSchema>;
