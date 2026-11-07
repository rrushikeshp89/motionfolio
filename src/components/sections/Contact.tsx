import { facts } from "@/content/facts";
import { resumeUrl } from "@/lib/site";
import { LinkButton } from "@/components/ui/Button";
import { CopyEmail } from "./CopyEmail";
import { PingFunnel } from "./PingFunnel";

const { email, github, linkedin } = facts.identity;

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden border-b-2 border-ink bg-canvas-warm py-16 md:py-24"
    >
      <div className="mx-auto max-w-[90rem] px-4 md:px-8">
        <PingFunnel>
          <p className="label flex items-center gap-2 text-ink-muted">
            <span
              aria-hidden="true"
              className="size-2 animate-beacon rounded-full bg-accent text-accent"
            />
            <span className="hidden sm:inline">Click anywhere to dispatch a ping</span>
            <span className="sm:hidden">System dispatch</span>
          </p>
          <h2
            id="contact-title"
            data-reveal=""
            className="mt-3 font-display text-[clamp(2.75rem,5.6vw,5.25rem)] leading-[0.88] font-black tracking-[-0.055em] uppercase sm:pr-60"
          >
            Everything ends up here.
          </h2>
          <p data-reveal="" className="mt-5 max-w-xl text-lg text-ink-muted">
            Let&rsquo;s engineer something real. {facts.identity.availability}
          </p>

          <div data-reveal="" className="mt-10 flex flex-wrap items-center gap-4">
            <span className="label text-ink-muted">Say hi:</span>
            <a
              href={`mailto:${email}`}
              className="font-display text-2xl font-extrabold tracking-[-0.03em] break-all underline decoration-4 underline-offset-[6px] transition-colors hover:text-accent-strong sm:text-4xl"
            >
              {email}
            </a>
            <CopyEmail email={email} />
          </div>

          <ul data-reveal="" className="mt-8 flex flex-wrap gap-3">
            <li>
              <LinkButton href={github} variant="outline" icon="arrow-up-right">
                GitHub
              </LinkButton>
            </li>
            <li>
              <LinkButton href={linkedin} variant="outline" icon="arrow-up-right">
                LinkedIn
              </LinkButton>
            </li>
            <li>
              <LinkButton href={resumeUrl} variant="accent" icon="arrow-up-right">
                Résumé
              </LinkButton>
            </li>
          </ul>
        </PingFunnel>

        <div className="mt-16 flex justify-center">
          <a href="#top" className="group relative grid size-40 place-items-center rounded-full">
            <svg
              viewBox="0 0 160 160"
              className="absolute inset-0 animate-spin-slow text-ink group-hover:[animation-play-state:paused]"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <path id="return-ring" d="M80 80m-68 0a68 68 0 1 1 136 0a68 68 0 1 1-136 0" />
              </defs>
              <text className="fill-current font-mono text-[10.5px] font-bold uppercase">
                <textPath href="#return-ring" textLength="420" lengthAdjust="spacing">
                  Return to top • Architecture first •
                </textPath>
              </text>
            </svg>
            <span className="press grid size-24 place-items-center rounded-full border-2 border-ink bg-accent text-ink transition-transform duration-300 group-hover:scale-105">
              <span className="text-center">
                <span className="block font-display text-2xl font-black">RP</span>
                <span className="label block text-[0.5625rem]">
                  To the top <span aria-hidden="true">↑</span>
                </span>
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
