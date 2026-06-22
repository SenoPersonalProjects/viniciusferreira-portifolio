"use client";

import { useMemo, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePortfolioData } from "@/components/providers/PortfolioDataProvider";

function formatPeriod(startDate: string, endDate: string) {
  const start = startDate.replace("-", ".");
  const end = endDate.replace("-", ".");

  return start === end ? start : `${start} - ${end}`;
}

export function RoadmapSection() {
  const { dictionary } = useLanguage();
  const { content } = usePortfolioData();
  const items = useMemo(
    () =>
      [...content.roadmap]
        .filter((item) => item.published)
        .sort((a, b) => a.order - b.order),
    [content.roadmap],
  );
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id="roadmap"
      className="section-border px-6 py-20 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <p className="section-eyebrow">{dictionary.roadmap.eyebrow}</p>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)] lg:items-start">
          <div>
            <h2 className="section-title text-5xl md:text-7xl">
              {dictionary.roadmap.title}
            </h2>
            <p className="mt-8 max-w-3xl font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
              {dictionary.roadmap.copy}
            </p>
          </div>

          <aside className="section-card p-6 md:p-8">
            <p className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.28em] text-[var(--color-muted)]">
              {dictionary.roadmap.selected}
            </p>
            <h3 className="mt-4 font-[var(--font-display)] text-3xl uppercase leading-none">
              {activeItem.title}
            </h3>
            <p className="mt-4 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
              {activeItem.details}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {activeItem.technologies.map((technology) => (
                <span
                  key={technology}
                  className="border border-[var(--color-border)] px-2 py-1 font-[var(--font-mono)] text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]"
                >
                  {technology}
                </span>
              ))}
            </div>
          </aside>
        </div>

        <div className="roadmap-timeline mt-14">
          {items.map((item) => {
            const isActive = item.id === activeItem.id;

            return (
              <article
                key={item.id}
                tabIndex={0}
                className="roadmap-item"
                data-active={isActive}
                onMouseEnter={() => setActiveId(item.id)}
                onFocus={() => setActiveId(item.id)}
              >
                <div className="roadmap-item__marker" aria-hidden="true" />
                <div className="roadmap-item__body">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      {formatPeriod(item.startDate, item.endDate)}
                    </span>
                    <span className="border border-[var(--color-border)] px-2 py-0.5 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.2em]">
                      {dictionary.roadmap.types[item.type]}
                    </span>
                  </div>
                  <h3 className="mt-4 font-[var(--font-display)] text-2xl uppercase leading-none md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)] md:text-base">
                    {item.summary}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
