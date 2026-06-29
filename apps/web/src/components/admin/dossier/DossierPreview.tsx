"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

import type { DossierContent, DossierLocale } from "@/data/dossier";

type DossierPreviewProps = {
  content: DossierContent;
  locale: DossierLocale;
};

function PreviewImage({
  alt,
  className,
  src,
}: {
  alt: string;
  className: string;
  src: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`${className} grid place-items-center border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 text-center font-[var(--font-mono)] text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]`}
        role="img"
        aria-label={`${alt} indisponível`}
      >
        Imagem indisponível
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      src={src}
    />
  );
}

export function DossierPreview({ content, locale }: DossierPreviewProps) {
  return (
    <article
      className="section-card overflow-hidden p-0"
      aria-label={`Prévia do dossiê ${locale}`}
    >
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] px-6 py-4">
        <p className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Prévia local / {locale}
        </p>
        <h2 className="mt-2 font-[var(--font-display)] text-4xl uppercase text-[var(--color-foreground)]">
          {content.project}
        </h2>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative min-h-[640px] bg-[var(--color-surface)] p-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="relative grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Arquivo {content.fileId}
                </p>
                <h3 className="mt-3 font-[var(--font-display)] text-5xl uppercase leading-none text-[var(--color-foreground)]">
                  {content.subject}
                </h3>
              </div>
              <span className="rotate-[-4deg] border-2 border-[var(--color-primary)] px-4 py-2 font-[var(--font-industrial)] text-[11px] uppercase tracking-[0.22em] text-[var(--color-primary)]">
                {content.stamp}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem]">
              <div className="border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-[0_16px_40px_var(--color-shadow)]">
                <PreviewImage
                  alt={`${content.subject} - imagem principal`}
                  className="aspect-[4/5] w-full object-cover grayscale contrast-125"
                  src={content.mainPhotoUrl}
                />
              </div>

              <div className="grid gap-3">
                {[
                  ["Classificação", content.classification],
                  ["Cargo", content.role],
                  ["Status", content.status],
                  ["Localização", content.location],
                  ["Stack", content.stack],
                ].map(([label, value]) => (
                  <div
                    className="border-b border-[var(--color-border)] pb-2"
                    key={label}
                  >
                    <p className="font-[var(--font-industrial)] text-[9px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      {label}
                    </p>
                    <p className="mt-1 font-[var(--font-mono)] text-xs uppercase tracking-[0.08em] text-[var(--color-foreground)]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[var(--color-border)] bg-[var(--color-background)] p-5">
              <p className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Note
              </p>
              <p className="mt-3 whitespace-pre-wrap font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-foreground)]">
                {content.note}
              </p>
            </div>
          </div>
        </div>

        <aside className="border-t border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6 lg:border-l lg:border-t-0">
          <div className="rotate-[2deg] border border-[var(--color-border)] bg-[var(--color-background)] p-3 shadow-[0_16px_40px_var(--color-shadow)]">
            <PreviewImage
              alt={`${content.subject} - polaroid`}
              className="aspect-square w-full object-cover grayscale contrast-125"
              src={content.polaroidPhotoUrl}
            />
            <p className="mt-3 text-center font-[var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Evidência visual
            </p>
          </div>
          <div className="mt-6 border border-[var(--color-border)] p-4">
            <p className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Fonte
            </p>
            <p className="mt-2 break-all font-[var(--font-mono)] text-xs text-[var(--color-foreground)]">
              {content.mainPhotoUrl}
            </p>
            <p className="mt-2 break-all font-[var(--font-mono)] text-xs text-[var(--color-foreground)]">
              {content.polaroidPhotoUrl}
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
