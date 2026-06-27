"use client";

import { useEffect, useState } from "react";
import { ColorModeToggle } from "@/components/layout/ColorModeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function Header() {
  const { dictionary } = useLanguage();
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sectionIds = ["home", "about", "roadmap", "stack", "projects", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === "roadmap" || id === "stack") {
            setActiveSection("about");
          } else {
            setActiveSection(id);
          }
        }
      });
    }, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="vintage-header sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur transition-colors duration-300">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-3 md:px-10">
        <a
          href="#home"
          className="vintage-logo vintage-flicker group relative flex items-center gap-2 font-[var(--font-display)] text-2xl leading-none text-[var(--color-foreground)] md:text-3xl"
        >
          <span className="font-[var(--font-accent)] text-[0.8em] text-[var(--color-primary)]">
            v
          </span>
          V.F.S.
        </a>

        <nav className="hidden justify-self-center md:flex md:items-center md:gap-10">
          <a
            href="#home"
            className={`border-b-2 pb-1 font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.24em] transition-all duration-300 ${
              activeSection === "home"
                ? "border-[var(--color-primary)] text-[var(--color-foreground)]"
                : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {dictionary.header.nav.home}
          </a>
          <a
            href="#projects"
            className={`border-b-2 pb-1 font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.24em] transition-all duration-300 ${
              activeSection === "projects"
                ? "border-[var(--color-primary)] text-[var(--color-foreground)]"
                : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {dictionary.header.nav.projects}
          </a>
          <a
            href="#about"
            className={`border-b-2 pb-1 font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.24em] transition-all duration-300 ${
              activeSection === "about"
                ? "border-[var(--color-primary)] text-[var(--color-foreground)]"
                : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {dictionary.header.nav.about}
          </a>
          <a
            href="#contact"
            className={`border-b-2 pb-1 font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.24em] transition-all duration-300 ${
              activeSection === "contact"
                ? "border-[var(--color-primary)] text-[var(--color-foreground)]"
                : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {dictionary.header.nav.contact}
          </a>
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <LanguageToggle />
          <ColorModeToggle />
        </div>
      </div>
    </header>
  );
}

