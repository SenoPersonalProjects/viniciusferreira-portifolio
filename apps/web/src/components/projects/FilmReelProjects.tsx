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
    <div className="mt-14">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)]">
            Each frame showcases a project in a film strip format. Hover over a
            frame to trigger a cinematic preview with Noir aesthetics.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={scrollPrevious}
            className="secondary-action h-11 px-6 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.25em]"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={scrollNext}
            className="secondary-action h-11 px-6 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.25em]"
          >
            Next
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