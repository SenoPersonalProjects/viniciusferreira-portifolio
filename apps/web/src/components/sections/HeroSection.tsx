"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { DossierLocale } from "@/data/dossier";
import { useDossierContent } from "@/hooks/useDossierContent";

const DossierCanvas = dynamic(
  () =>
    import("@/components/three/dossier/DossierCanvas").then((module) => ({
      default: module.DossierCanvas,
    })),
  {
    ssr: false,
  },
);

function useHeroActive() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isHeroActive, setIsHeroActive] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const heroSection = section;

    const thresholds = [0, 0.15, 0.3, 0.45, 0.6];
    let frameId: number | null = null;

    function getViewportRootBounds() {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      return {
        top: viewportHeight * 0.04,
        right: viewportWidth,
        bottom: viewportHeight * 0.92,
        left: 0,
      };
    }

    function computeHeroActive(rect: DOMRect) {
      const rootBounds = getViewportRootBounds();
      const intersectionWidth = Math.max(
        0,
        Math.min(rect.right, rootBounds.right) - Math.max(rect.left, rootBounds.left),
      );
      const intersectionHeight = Math.max(
        0,
        Math.min(rect.bottom, rootBounds.bottom) - Math.max(rect.top, rootBounds.top),
      );
      const targetArea = Math.max(rect.width * rect.height, 1);
      const intersectionRatio = (intersectionWidth * intersectionHeight) / targetArea;

      return intersectionWidth > 0 && intersectionHeight > 0 && intersectionRatio >= 0.24;
    }

    function updateHeroActive() {
      setIsHeroActive(computeHeroActive(heroSection.getBoundingClientRect()));
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setIsHeroActive(false);
          return;
        }

        setIsHeroActive(entry.intersectionRatio >= 0.24);
      },
      {
        threshold: thresholds,
        rootMargin: "-4% 0px -8% 0px",
      },
    );

    const resizeObserver = new ResizeObserver(() => {
      updateHeroActive();
    });

    updateHeroActive();
    resizeObserver.observe(section);
    window.addEventListener("resize", updateHeroActive);
    window.addEventListener("scroll", updateHeroActive, {
      passive: true,
    });

    frameId = window.requestAnimationFrame(() => {
      updateHeroActive();
      observer.observe(heroSection);
    });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeroActive);
      window.removeEventListener("scroll", updateHeroActive);
    };
  }, []);

  return {
    isHeroActive,
    sectionRef,
  };
}

export function HeroSection() {
  const { isHeroActive, sectionRef } = useHeroActive();
  const { language } = useLanguage();
  const dossierLocale: DossierLocale = language === "en" ? "en" : "pt";
  const { content: dossierContent } = useDossierContent(dossierLocale);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="dossier-hero relative z-10 min-h-[calc(100svh-66px)] overflow-hidden bg-[var(--color-background)]"
      data-hero-active={isHeroActive}
    >
      <div className="dossier-hero__stage flex min-h-[calc(100svh-66px)] w-screen items-start justify-center">
        <DossierCanvas
          content={dossierContent}
          locale={dossierLocale}
          isHeroActive={isHeroActive}
        />
      </div>
    </section>
  );
}
