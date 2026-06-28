import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PortfolioDataProvider } from "@/components/providers/PortfolioDataProvider";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { StackSection } from "@/components/sections/StackSection";
import {
  absoluteSiteUrl,
  getPublicSocialLinks,
  siteConfig,
} from "@/lib/site";

function getStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: siteConfig.title,
    url: absoluteSiteUrl("/"),
    description: siteConfig.description,
    inLanguage: "pt-BR",
    mainEntity: {
      "@type": "Person",
      name: siteConfig.name,
      jobTitle: siteConfig.role,
      address: {
        "@type": "PostalAddress",
        addressCountry: siteConfig.location,
      },
      sameAs: getPublicSocialLinks(),
      knowsAbout: siteConfig.stack,
    },
  };
}

function serializeJsonLd(data: ReturnType<typeof getStructuredData>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function Home() {
  const structuredData = getStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <div className="portfolio-shell text-[var(--color-foreground)] transition-colors duration-300">
        <div className="vintage-vignette" />
        <div className="vintage-grain" />

        <PortfolioDataProvider>
          <Header />

          <main className="relative">
            <HeroSection />
            <AboutSection />
            <RoadmapSection />
            <StackSection />
            <ProjectsSection />
            <ContactSection />
          </main>

          <Footer />
        </PortfolioDataProvider>
      </div>
    </>
  );
}
