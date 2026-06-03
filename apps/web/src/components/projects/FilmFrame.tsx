"use client";

import { useEffect, useState } from "react";

import type { Project } from "@/data/projects";

type FilmFrameProps = {
  project: Project;
  index: number;
};

export function FilmFrame({ project, index }: FilmFrameProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const previewImages =
    project.previewImages.length > 0
      ? project.previewImages
      : [project.posterImage];

  const currentImage = isPreviewing
    ? previewImages[previewIndex]
    : project.posterImage;

  useEffect(() => {
    if (!isPreviewing) {
      setPreviewIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setPreviewIndex((current) => (current + 1) % previewImages.length);
    }, 260);

    return () => window.clearInterval(interval);
  }, [isPreviewing, previewImages.length]);

  return (
    <article
      className="film-frame group relative h-full min-w-0"
      onMouseEnter={() => setIsPreviewing(true)}
      onMouseLeave={() => setIsPreviewing(false)}
      onFocus={() => setIsPreviewing(true)}
      onBlur={() => setIsPreviewing(false)}
    >
      <div className="film-frame-window relative h-full overflow-hidden border border-[var(--film-frame-border)] bg-[var(--color-surface)]">
        <div className="film-image-wrap relative aspect-[16/10] overflow-hidden">
          <img
            src={currentImage}
            alt={`Prévia do projeto ${project.title}`}
            className="film-image h-full w-full object-cover"
            draggable={false}
          />

          <div className="film-image-vignette" />

          {isPreviewing && <div className="film-image-grain" />}

          {isPreviewing && (
            <div className="film-preview-label animate-[vintage-flicker_0.15s_infinite] bg-black/80 backdrop-blur-sm">
              <span className="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
              Projecting...
            </div>
          )}
        </div>

        <div className="border-t border-[var(--film-frame-border)] bg-[var(--film-caption-bg)] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="font-[var(--font-industrial)] text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              {project.frameCode ?? `VF-${String(index + 1).padStart(3, "0")}`}
            </span>

            <div className="h-[1px] flex-1 bg-[var(--film-frame-border)] opacity-20" />

            <span className="font-[var(--font-industrial)] text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Frame {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h3 className="font-[var(--font-display)] text-2xl uppercase leading-none tracking-tight text-[var(--color-foreground)] md:text-3xl">
            {project.title}
          </h3>

          <p className="mt-4 line-clamp-2 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)] opacity-90">
            {project.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.slice(0, 4).map((item) => (
              <span
                key={item}
                className="border border-[var(--film-frame-border)] bg-[var(--color-surface-soft)] px-2 py-0.5 font-[var(--font-mono)] text-[9px] font-bold uppercase tracking-wider text-[var(--color-muted)]"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-action h-10 text-[10px] font-bold uppercase tracking-widest"
              >
                Code
              </a>
            )}

            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="primary-action h-10 text-[10px] font-bold uppercase tracking-widest"
              >
                Exhibit
              </a>
            ) : (
              <div className="secondary-action h-10 cursor-not-allowed opacity-40 text-[10px] font-bold uppercase tracking-widest">
                Classified
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}