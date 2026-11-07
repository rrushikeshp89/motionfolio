import { rawFacts } from "@/content/facts";
import { factsSchema } from "@/content/schema";

const clone = () => structuredClone(rawFacts);

function issuesFor(input: unknown): string[] {
  const result = factsSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe("factsSchema", () => {
  it("rejects a non-https link", () => {
    const input = clone();
    input.identity.github = "http://github.com/rrushikeshp89";
    expect(issuesFor(input)).not.toHaveLength(0);
  });

  it("rejects more than three bullets on a project", () => {
    const input = clone();
    const [first] = input.projects;
    if (!first) throw new Error("fixture has no projects");
    first.bullets = [...first.bullets, "A fourth bullet"];
    expect(issuesFor(input)).not.toHaveLength(0);
  });

  it("rejects duplicate project slugs", () => {
    const input = clone();
    const [first] = input.projects;
    if (!first) throw new Error("fixture has no projects");
    input.projects = [...input.projects, first];
    expect(issuesFor(input)).toContain("Duplicate project slug: grove-hrms");
  });

  it("rejects an invalid email", () => {
    const input = clone();
    input.identity.email = "not-an-email";
    expect(issuesFor(input)).not.toHaveLength(0);
  });

  it("rejects a headline emphasis that is not in the headline", () => {
    const input = clone();
    input.identity.headlineEmphasis = "Rust";
    expect(issuesFor(input)).toContain("headlineEmphasis must appear in headline");
  });

  it("rejects a malformed date", () => {
    const input = clone();
    const [job] = input.experience;
    if (!job) throw new Error("fixture has no experience");
    job.start = "Oct 2025";
    expect(issuesFor(input)).toContain("must be YYYY-MM");
  });
});
