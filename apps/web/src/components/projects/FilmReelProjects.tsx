"use client";

import { type WheelEvent, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";

import { projects } from "@/data/projects";

import { FilmFrame } from "@/components/projects/FilmFrame";

export function FilmReelProjects() {
  const lastWheelAtRef = useRef(0);

  const repeatedProjects = Array.from({ length: 6 }).flatMap((_, repeatIndex) =>
    projects.map((project, projectIndex) => ({
      project,
      projectIndex,
      key: `${project.slug}-${repeatIndex}`,
    })),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
    skipSnaps: true,
  });

  function scrollPrevious() {
    emblaApi?.scrollPrev();
  }

  function scrollNext() {
    emblaApi?.scrollNext();
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (!emblaApi) {
      return;
    }

    event.preventDefault();

    const now = Date.now();

    if (now - lastWheelAtRef.current < 240) {
      return;
    }

    lastWheelAtRef.current = now;

    const dominantDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    if (dominantDelta > 0) {
      emblaApi.scrollNext();
      return;
    }

    emblaApi.scrollPrev();
  }

  return (
    <div className="mt-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
          Cada frame apresenta um projeto em formato de película. Passe o mouse
          sobre um frame para assistir uma prévia visual com estética noir.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={scrollPrevious}
            className="secondary-action px-4 py-2 font-[var(--font-mono)] text-xs font-bold uppercase tracking-[0.18em]"
          >
            Anterior
          </button>

          <button
            type="button"
            onClick={scrollNext}
            className="secondary-action px-4 py-2 font-[var(--font-mono)] text-xs font-bold uppercase tracking-[0.18em]"
          >
            Próximo
          </button>
        </div>
      </div>

      <div
        className="film-reel overflow-hidden"
        ref={emblaRef}
        onWheel={handleWheel}
      >
        <div className="film-reel-track flex">
          {repeatedProjects.map(({ project, projectIndex, key }) => (
            <div key={key} className="film-reel-slide min-w-0">
              <FilmFrame project={project} index={projectIndex} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}