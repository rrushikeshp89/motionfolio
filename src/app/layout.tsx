import type { Metadata, Viewport } from "next";
import { SiteNav } from "@/components/nav/SiteNav";
import { SkipLink } from "@/components/ui/SkipLink";
import { facts } from "@/content/facts";
import { CONTENT_SECURITY_POLICY } from "@/lib/csp";
import { siteUrl } from "@/lib/site";
import { REVEAL_SCRIPT } from "@/motion/reveal-script";
import { display, mono } from "./fonts";
import "./globals.css";

const { name, role, headline } = facts.identity;
const siteTitle = `${name}, ${role} — Motion Portfolio`;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: siteTitle, template: `%s | ${name}` },
  description: headline,
  authors: [{ name, url: facts.identity.github }],
  alternates: { canonical: siteUrl.href },
  openGraph: {
    type: "website",
    url: siteUrl.href,
    siteName: name,
    title: siteTitle,
    description: headline,
    locale: "en_IN",
    images: [
      { url: "og.png", width: 1200, height: 630, type: "image/png", alt: `${name}: ${headline}` },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: headline,
    images: ["og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#faf6ee",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} antialiased`}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CONTENT_SECURITY_POLICY} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <SkipLink />
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
