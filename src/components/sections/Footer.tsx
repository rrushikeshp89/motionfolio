import { facts } from "@/content/facts";
import { Icon } from "@/components/ui/Icon";
import { mainSiteUrl } from "@/lib/site";

const { name, location } = facts.identity;

export function Footer() {
  return (
    <footer className="bg-surface pb-24 md:pb-0">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="label font-normal text-ink-muted">
          © {new Date().getFullYear()} {name} · {location}
        </p>
        <div className="flex items-center justify-between gap-4">
          <p className="label font-normal text-ink-muted">
            <span
              aria-hidden="true"
              className="mr-2 inline-block size-2 animate-pulse rounded-full bg-success"
            />
            Built with Next.js and TypeScript ·{" "}
            <a
              href={mainSiteUrl.href}
              className="text-ink underline underline-offset-4 hover:text-accent-strong"
            >
              Main portfolio
            </a>
          </p>
          <a
            href="#top"
            aria-label="Back to the top"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-on-ink transition-all duration-200 hover:scale-110 hover:bg-accent-strong"
          >
            <Icon name="arrow-up" size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
