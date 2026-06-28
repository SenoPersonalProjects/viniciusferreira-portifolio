"use client";

import { useEffect, useState } from "react";
import { ColorModeToggle } from "@/components/layout/ColorModeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function Header() {
  const { dictionary } = useLanguage();
  const [activeSection, setActiveSection] = useState("home");
  const navItems = [
    { id: "about", label: dictionary.header.nav.about },
    { id: "roadmap", label: dictionary.header.nav.roadmap },
    { id: "stack", label: dictionary.header.nav.stack },
    { id: "projects", label: dictionary.header.nav.projects },
    { id: "contact", label: dictionary.header.nav.contact },
  ] as const;

  useEffect(() => {
    const sectionIds = ["home", "about", "roadmap", "stack", "projects", "contact"];
    let frameId = 0;

    const updateActiveSection = () => {
      frameId = 0;

      const probeLine = window.innerHeight * 0.48;
      let closestId = "home";
      let closestDistance = Number.POSITIVE_INFINITY;

      sectionIds.forEach((id) => {
        const element = document.getElementById(id);

        if (!element) {
          return;
        }

        const rect = element.getBoundingClientRect();
        const containsProbeLine = rect.top <= probeLine && rect.bottom >= probeLine;
        const distance = containsProbeLine
          ? 0
          : Math.min(
              Math.abs(rect.top - probeLine),
              Math.abs(rect.bottom - probeLine),
            );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = id;
        }
      });

      setActiveSection(closestId);
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
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

        <nav
          aria-label={dictionary.header.navLabel}
          className="hidden justify-self-center md:flex md:items-center md:gap-10"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={activeSection === item.id ? "true" : undefined}
              className={`border-b-2 pb-1 font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.24em] transition-all duration-300 ${
                activeSection === item.id
                  ? "border-[var(--color-primary)] text-[var(--color-foreground)]"
                  : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <LanguageToggle />
          <ColorModeToggle />
        </div>
      </div>
    </header>
  );
}

