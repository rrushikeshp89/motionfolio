import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="dot-grid grid min-h-dvh place-items-center px-4 pt-16 pb-24 text-center"
    >
      <div>
        <p className="label text-accent-strong">Error 404 · route not found</p>
        <h1 className="mt-3 font-display text-[clamp(4rem,18vw,12rem)] leading-none font-black tracking-[-0.06em]">
          404
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-ink-muted">
          This page didn&rsquo;t make it through the write path.
        </p>
        <Link
          href="/"
          className="press label mt-8 inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-ink px-5 text-on-ink"
        >
          Back to the portfolio
        </Link>
      </div>
    </main>
  );
}
