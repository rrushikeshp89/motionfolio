import { facts } from "@/content/facts";
import { mainSiteUrl } from "@/lib/site";

const { name, location } = facts.identity;

export function Footer() {
  return (
    <footer className="bg-surface pb-24 md:pb-0">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="label font-normal text-ink-muted">
          © {new Date().getFullYear()} {name} · {location}
        </p>
        <p className="label font-normal text-ink-muted">
          <span aria-hidden="true" className="mr-2 inline-block size-2 rounded-full bg-success" />
          Built with Next.js, Motion and TypeScript ·{" "}
          <a
            href={mainSiteUrl.href}
            className="text-ink underline underline-offset-4 hover:text-accent-strong"
          >
            Main portfolio
          </a>
        </p>
      </div>
    </footer>
  );
}
