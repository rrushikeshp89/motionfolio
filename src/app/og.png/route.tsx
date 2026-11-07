import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { facts } from "@/content/facts";

/** Written to out/og.png at build, so GitHub Pages serves it as image/png. */
export const dynamic = "force-static";

const SIZE = { width: 1200, height: 630 } as const;

const fontFile = (pkg: string, file: string) =>
  readFile(join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));

/** The share card, in the site's own look: cream paper, an ink frame with a hard shadow, Outfit Black. */
export async function GET() {
  const [outfitBlack, outfitRegular, spaceMono] = await Promise.all([
    fontFile("outfit", "outfit-latin-900-normal.woff"),
    fontFile("outfit", "outfit-latin-400-normal.woff"),
    fontFile("space-mono", "space-mono-latin-700-normal.woff"),
  ]);
  const { name, role, location, subline } = facts.identity;
  const [first, ...rest] = name.toUpperCase().split(" ");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#f3e9da",
        padding: 48,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#faf6ee",
          border: "4px solid #1c1917",
          borderRadius: 28,
          boxShadow: "12px 12px 0 0 #1c1917",
          padding: "44px 52px",
          color: "#1c1917",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "Space Mono",
            fontSize: 22,
            letterSpacing: 2,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              backgroundColor: "#e05a36",
              marginRight: 14,
            }}
          />
          {`${role.toUpperCase()} · ${location.toUpperCase()} · MOTION PORTFOLIO`}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Outfit",
            fontWeight: 900,
            fontSize: 132,
            lineHeight: 0.86,
            letterSpacing: -6,
          }}
        >
          <span>{first}</span>
          <span style={{ color: "#e05a36" }}>{rest.join(" ")}</span>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Outfit Text",
            fontSize: 28,
            color: "#57534e",
            maxWidth: 900,
          }}
        >
          {subline}
        </div>
      </div>
    </div>,
    {
      ...SIZE,
      fonts: [
        { name: "Outfit", data: outfitBlack, weight: 900, style: "normal" },
        { name: "Outfit Text", data: outfitRegular, weight: 400, style: "normal" },
        { name: "Space Mono", data: spaceMono, weight: 700, style: "normal" },
      ],
    },
  );
}
