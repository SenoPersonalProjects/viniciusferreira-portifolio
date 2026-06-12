"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, useState } from "react";

import { dossierByLocale } from "@/data/dossier";

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
    };
  }, []);

  return {
    isHeroActive,
    sectionRef,
  };
}

export function HeroSection() {
  const { isHeroActive, sectionRef } = useHeroActive();

  return (
    <section
      id="home"
      ref={sectionRef}
      className="dossier-hero relative z-10 -mb-8 min-h-[calc(100dvh-66px)] overflow-visible bg-[var(--color-background)] pt-4 sm:-mb-12 md:-mb-16"
      data-hero-active={isHeroActive}
    >
      <div className="dossier-hero__stage mx-auto flex min-h-[calc(100dvh-66px)] w-full max-w-[1680px] items-start justify-center px-3 sm:px-4 md:px-8">
        <DossierCanvas content={dossierByLocale.pt} isHeroActive={isHeroActive} />
      </div>
    </section>
  );
}
