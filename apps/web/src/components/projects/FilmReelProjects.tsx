"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
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
const CENTRAL_REPEAT_INDEX = Math.floor(REEL_REPEAT_COUNT / 2);

function getLogicalProjectIndex(snapIndex: number, projectCount: number) {
  if (projectCount === 0) {
    return 0;
  }

  return ((snapIndex % projectCount) + projectCount) % projectCount;
}

export function FilmReelProjects({ projects }: FilmReelProjectsProps) {
  const { dictionary } = useLanguage();
  const instructionsId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleProjects = useMemo(
    () =>
      projects
        .filter((project) => project.published ?? true)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [projects],
  );
  const projectCount = visibleProjects.length;
  const startIndex = CENTRAL_REPEAT_INDEX * Math.max(projectCount, 1);
  const [activeSnapIndex, setActiveSnapIndex] = useState(startIndex);
  const [activeProjectIndex, setActiveProjectIndex] = useState(
    getLogicalProjectIndex(startIndex, projectCount),
  );

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
          snapIndex: repeatIndex * localizedProjects.length + projectIndex,
          uniqueKey: `${project.slug}-${repeatIndex}`,
        })),
      ),
    [localizedProjects],
  );
  const activeProject = localizedProjects[activeProjectIndex];
  const activeStatus = activeProject
    ? `${dictionary.filmReel.statusLabel}: ${activeProjectIndex + 1} ${
        dictionary.filmReel.statusOf
      } ${projectCount}, ${activeProject.title}`
    : "";

  const updateActiveFromEmbla = useCallback(() => {
    if (!emblaApi || projectCount === 0) {
      return;
    }

    const selectedSnap = emblaApi.selectedScrollSnap();

    setActiveSnapIndex(selectedSnap);
    setActiveProjectIndex(getLogicalProjectIndex(selectedSnap, projectCount));
  }, [emblaApi, projectCount]);

  const scrollToLogicalProject = useCallback(
    (projectIndex: number) => {
      if (!emblaApi || projectCount === 0) {
        return;
      }

      emblaApi.scrollTo(CENTRAL_REPEAT_INDEX * projectCount + projectIndex);
    },
    [emblaApi, projectCount],
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

    const frameId = window.requestAnimationFrame(updateActiveFromEmbla);

    emblaApi.on("select", updateActiveFromEmbla);
    emblaApi.on("reInit", updateActiveFromEmbla);

    return () => {
      window.cancelAnimationFrame(frameId);
      emblaApi.off("select", updateActiveFromEmbla);
      emblaApi.off("reInit", updateActiveFromEmbla);
    };
  }, [emblaApi, updateActiveFromEmbla]);

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

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!emblaApi || projectCount === 0) {
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        emblaApi.scrollNext();
        emblaApi.rootNode().focus({ preventScroll: true });
        break;
      case "ArrowLeft":
        event.preventDefault();
        emblaApi.scrollPrev();
        emblaApi.rootNode().focus({ preventScroll: true });
        break;
      case "Home":
        event.preventDefault();
        scrollToLogicalProject(0);
        emblaApi.rootNode().focus({ preventScroll: true });
        break;
      case "End":
        event.preventDefault();
        scrollToLogicalProject(projectCount - 1);
        emblaApi.rootNode().focus({ preventScroll: true });
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription={dictionary.filmReel.roleDescription}
      aria-label={dictionary.filmReel.carouselLabel}
      aria-describedby={instructionsId}
      className="relative mt-16 overflow-visible md:mt-20"
      onKeyDown={handleKeyDown}
    >
      <p id={instructionsId} className="sr-only">
        {dictionary.filmReel.instructions}
      </p>
      <p
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        data-film-reel-status
      >
        {activeStatus}
      </p>

      <div className="relative z-10 mb-12 flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)]">
            {dictionary.filmReel.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 md:justify-end">
          <button
            type="button"
            onClick={scrollPrevious}
            aria-label={dictionary.filmReel.previousLabel}
            className="film-reel-control secondary-action h-11 px-6 font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.22em]"
          >
            {dictionary.filmReel.previous}
          </button>

          <button
            type="button"
            onClick={scrollNext}
            aria-label={dictionary.filmReel.nextLabel}
            className="film-reel-control secondary-action h-11 px-6 font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.22em]"
          >
            {dictionary.filmReel.next}
          </button>
        </div>
      </div>

      <div className="film-reel-full-bleed">
        <div className="film-reel-tilt">
          <div
            className="film-reel relative z-10"
            ref={emblaRef}
            tabIndex={0}
            role="group"
            aria-label={dictionary.filmReel.viewportLabel}
          >
            <div className="film-reel-track flex">
              {repeatedProjects.map((item) => {
                const isActive = item.snapIndex === activeSnapIndex;

                return (
                  <div
                    key={item.uniqueKey}
                    className="film-reel-slide min-w-0"
                    data-active={isActive}
                    aria-hidden={!isActive}
                  >
                    <FilmFrame
                      project={item}
                      index={item.displayIndex}
                      isActive={isActive}
                      isInteractive={isActive}
                      position={item.displayIndex + 1}
                      total={projectCount}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
