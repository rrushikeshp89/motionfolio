import { workEntries } from "@/content/portfolio";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectInspector } from "./ProjectInspector";

export function SelectedWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="border-b-2 border-ink bg-surface-alt py-16 md:py-24"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8">
        <SectionHeader
          id="work-title"
          eyebrow={`Selected work (${String(workEntries.length).padStart(2, "0")})`}
          title="Products & systems I've built & shipped."
          aside={
            <p className="label inline-flex items-center gap-2 rounded-full border border-ink/20 bg-card px-3 py-1.5 font-normal whitespace-nowrap text-ink-muted">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-tangerine" />
              <span className="hidden lg:inline">Hover or select a system to inspect</span>
              <span className="lg:hidden">Tap a tab to inspect</span>
            </p>
          }
          className="mb-8"
        />
        <ProjectInspector entries={workEntries} />
      </div>
    </section>
  );
}
