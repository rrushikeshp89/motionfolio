/** Page sections in the navigation. Kept free of facts.ts so client bundles never pull in Zod. */
export const navItems = [
  { id: "top", label: "Overview" },
  { id: "work", label: "Work" },
  { id: "ethos", label: "Ethos" },
  { id: "contact", label: "Contact" },
] as const;

export type NavId = (typeof navItems)[number]["id"];
