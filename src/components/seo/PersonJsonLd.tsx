import { facts } from "@/content/facts";
import { siteUrl } from "@/lib/site";

/**
 * schema.org Person: name, job title, site URL and profiles. Deliberately no email, phone or
 * address; contact details live in the page body only (same rule as the main portfolio).
 */
export function PersonJsonLd() {
  const { name, role, linkedin, github } = facts.identity;
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: role,
    url: siteUrl.href,
    sameAs: [linkedin, github, facts.site.url],
  };

  return (
    <script
      type="application/ld+json"
      // "<" is escaped so the JSON can never close the script element early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
    />
  );
}
