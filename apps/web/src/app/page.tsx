import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { StackSection } from "@/components/sections/StackSection";

export default function Home() {
  return (
    <div className="portfolio-shell text-[var(--color-foreground)] transition-colors duration-300">
      <div className="vintage-vignette" />
      <div className="vintage-grain" />

      <Header />

      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <StackSection />
        <ProjectsSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}