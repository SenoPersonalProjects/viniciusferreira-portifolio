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
            <div className="film-preview-label">Prévia em exibição</div>
          )}
        </div>

        <div className="border-t border-[var(--film-frame-border)] bg-[var(--film-caption-bg)] p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              {project.frameCode ?? `VF-${String(index + 1).padStart(3, "0")}`}
            </span>

            <span className="font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Frame {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h3 className="font-[var(--font-display)] text-2xl leading-none text-[var(--color-foreground)] md:text-3xl">
            {project.title}
          </h3>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-muted)]">
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.stack.slice(0, 4).map((item) => (
              <span
                key={item}
                className="border border-[var(--film-frame-border)] bg-[var(--color-surface)] px-2.5 py-1 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-action px-4 py-2 text-xs font-semibold"
              >
                Código
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="primary-action px-4 py-2 text-xs font-semibold"
              >
                Ver online
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}