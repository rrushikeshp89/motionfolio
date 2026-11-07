import { facts } from "@/content/facts";
import { resumeUrl } from "@/lib/site";
import { SiteNavClient } from "./SiteNavClient";

/** Server wrapper: reads facts here so the client bundle receives plain strings, not facts.ts + Zod. */
export function SiteNav() {
  const { name, role, location, linkedin, github } = facts.identity;
  return (
    <SiteNavClient
      name={name}
      role={role}
      location={location}
      resumeUrl={resumeUrl}
      external={[
        { label: "Résumé", href: resumeUrl },
        { label: "LinkedIn", href: linkedin },
        { label: "GitHub", href: github },
      ]}
    />
  );
}
