const MONTH_YEAR = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2025-10" → "Oct 2025". Fixed locale and time zone so server and client always agree. */
export function formatYearMonth(yearMonth: string): string {
  return MONTH_YEAR.format(new Date(`${yearMonth}-01T00:00:00Z`));
}

const NON_BREAKING_HYPHEN = String.fromCharCode(0x2011);

/** Keeps compounds like "full-stack" on one line in large headings. */
export function keepHyphensTogether(text: string): string {
  return text.replace(/(?<=\p{L})-(?=\p{L})/gu, NON_BREAKING_HYPHEN);
}
