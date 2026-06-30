"use client";

import { FilmReelProjects } from "@/components/projects/FilmReelProjects";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePortfolioData } from "@/components/providers/PortfolioDataProvider";
import { useSiteCopy } from "@/components/providers/SiteCopyProvider";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function ProjectsSection() {
  const { dictionary } = useLanguage();
  const { resolveCopy } = useSiteCopy();
  const { content, source } = usePortfolioData();
  const { ref, isRevealed } = useScrollReveal();

  return (
    <section
      id="projects"
      ref={ref}
      className="section-border px-6 py-20 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <p className={`section-eyebrow scroll-reveal ${isRevealed ? "is-revealed" : ""}`}>
          {resolveCopy(
            "projectsSection.eyebrow",
            dictionary.projectsSection.eyebrow,
          )}
        </p>

        <h2 className={`section-title mt-5 text-4xl md:text-5xl scroll-reveal stagger-delay-1 ${isRevealed ? "is-revealed" : ""}`}>
          {resolveCopy("projectsSection.title", dictionary.projectsSection.title)}
        </h2>

        <FilmReelProjects
          localizeProjects={source === "fallback"}
          projects={content.projects}
        />
      </div>
    </section>
  );
}
