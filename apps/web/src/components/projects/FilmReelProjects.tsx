"use client";

import { useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useEmblaCarousel from "embla-carousel-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { PortfolioProject } from "@/data/portfolioContent";

import { FilmFrame } from "@/components/projects/FilmFrame";

type FilmReelProjectsProps = {
  projects: PortfolioProject[];
};

const REEL_REPEAT_COUNT = 7;

export function FilmReelProjects({ projects }: FilmReelProjectsProps) {
  const { dictionary } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleProjects = useMemo(
    () =>
      projects
        .filter((project) => project.published ?? true)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [projects],
  );
  const startIndex =
    Math.floor(REEL_REPEAT_COUNT / 2) * Math.max(visibleProjects.length, 1);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
    containScroll: false,
    skipSnaps: false,
    slidesToScroll: 1,
    startIndex,
  });

  const localizedProjects = useMemo(
    () =>
      visibleProjects.map((project) => {
        const projectCopy =
          dictionary.projects[
            project.slug as keyof typeof dictionary.projects
          ];

        return {
          ...project,
          title: projectCopy?.title ?? project.title,
          description: projectCopy?.description ?? project.description,
        };
      }),
    [dictionary, visibleProjects],
  );

  // Repetir projetos para garantir loop infinito visual suave
  const repeatedProjects = useMemo(
    () =>
      Array.from({ length: REEL_REPEAT_COUNT }).flatMap((_, repeatIndex) =>
        localizedProjects.map((project, projectIndex) => ({
          ...project,
          displayIndex: projectIndex,
          uniqueKey: `${project.slug}-${repeatIndex}`,
        })),
      ),
    [localizedProjects],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const frame = window.requestAnimationFrame(() => {
      emblaApi.reInit();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    let lastWheelTime = 0;
    const throttleTime = 120; // ms para evitar scroll muito rápido

    const onWheel = (e: WheelEvent) => {
      // Prioriza o eixo com maior movimento
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      // Se houver intenção clara de scroll (threshold)
      if (Math.abs(delta) > 5) {
        // Impede o scroll vertical da página para focar no carrossel
        e.preventDefault();

        const now = Date.now();
        if (now - lastWheelTime > throttleTime) {
          if (delta > 0) {
            emblaApi.scrollNext();
          } else {
            emblaApi.scrollPrev();
          }
          lastWheelTime = now;
        }
      }
    };

    const emblaNode = emblaApi.rootNode();
    emblaNode.addEventListener("wheel", onWheel, { passive: false });
    
    return () => {
      emblaNode.removeEventListener("wheel", onWheel);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = containerRef.current;

    if (!container) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(container, {
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
        },
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }, container);

    return () => ctx.revert();
  }, []);

  function scrollPrevious() {
    emblaApi?.scrollPrev();
  }

  function scrollNext() {
    emblaApi?.scrollNext();
  }

  return (
    <div className="relative mt-14 overflow-visible" ref={containerRef}>
      <div className="relative z-10 mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)]">
            {dictionary.filmReel.description}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={scrollPrevious}
            className="secondary-action h-11 px-6 font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.22em]"
          >
            {dictionary.filmReel.previous}
          </button>

          <button
            type="button"
            onClick={scrollNext}
            className="secondary-action h-11 px-6 font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.22em]"
          >
            {dictionary.filmReel.next}
          </button>
        </div>
      </div>

      <div className="film-reel-full-bleed">
        <div className="film-reel-tilt">
          <div className="film-reel relative z-10" ref={emblaRef}>
            <div className="film-reel-track flex">
              {repeatedProjects.map((item) => (
                <div key={item.uniqueKey} className="film-reel-slide min-w-0">
                  <FilmFrame project={item} index={item.displayIndex} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
