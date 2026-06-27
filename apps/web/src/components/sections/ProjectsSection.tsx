"use client";

import { FilmReelProjects } from "@/components/projects/FilmReelProjects";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePortfolioData } from "@/components/providers/PortfolioDataProvider";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function ProjectsSection() {
  const { dictionary } = useLanguage();
  const { content } = usePortfolioData();
  const { ref, isRevealed } = useScrollReveal();

  return (
    <section
      id="projects"
      ref={ref}
      className="section-border px-6 py-20 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <p className={`section-eyebrow scroll-reveal ${isRevealed ? "is-revealed" : ""}`}>
          {dictionary.projectsSection.eyebrow}
        </p>

        <h2 className={`section-title mt-5 text-4xl md:text-5xl scroll-reveal stagger-delay-1 ${isRevealed ? "is-revealed" : ""}`}>
          {dictionary.projectsSection.title}
        </h2>

        <FilmReelProjects projects={content.projects} />
      </div>
    </section>
  );
}
