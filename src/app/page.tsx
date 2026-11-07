import { PersonJsonLd } from "@/components/seo/PersonJsonLd";
import { Contact } from "@/components/sections/Contact";
import { Ethos } from "@/components/sections/Ethos";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Metrics } from "@/components/sections/Metrics";
import { SelectedWork } from "@/components/sections/SelectedWork";

export default function HomePage() {
  return (
    <>
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <SelectedWork />
        <Ethos />
        <Metrics />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <PersonJsonLd />
    </>
  );
}
