"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePortfolioData } from "@/components/providers/PortfolioDataProvider";
import type { RoadmapItem } from "@/data/roadmap";

function formatPeriod(startDate: string, endDate: string) {
  const start = startDate.replace("-", ".");
  const end = endDate.replace("-", ".");

  return start === end ? start : `${start} - ${end}`;
}

function getEvidenceCode(item: RoadmapItem) {
  const typeCode = item.type.slice(0, 3).toUpperCase();
  const orderCode = String(item.order).padStart(2, "0");

  return `VF-${typeCode}-${orderCode}`;
}

function getFigureLabel(label: string, index: number) {
  return `${label} ${String(index + 1).padStart(2, "0")}`;
}

export function RoadmapSection() {
  const { dictionary } = useLanguage();
  const { content } = usePortfolioData();
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const items = useMemo(
    () =>
      [...content.roadmap]
        .filter((item) => item.published)
        .sort((a, b) => a.order - b.order),
    [content.roadmap],
  );
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];
  const activePeriod = activeItem
    ? formatPeriod(activeItem.startDate, activeItem.endDate)
    : "";
  const activeEvidenceCode = activeItem ? getEvidenceCode(activeItem) : "";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      itemRefs.current.forEach((item) => {
        item?.setAttribute("data-visible", "true");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.22,
      },
    );

    itemRefs.current.forEach((item) => {
      if (item) {
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
  }, [items]);

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

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(320px,0.6fr)] lg:items-start">
          <div>
            <h2 className="section-title text-5xl md:text-7xl">
              {dictionary.roadmap.title}
            </h2>
            <p className="mt-8 max-w-3xl font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
              {dictionary.roadmap.copy}
            </p>
          </div>

          <aside className="roadmap-selected section-card p-6 md:p-8" aria-live="polite">
            <div className="roadmap-selected__meta">
              <span>{dictionary.roadmap.selected}</span>
              <span>{activeEvidenceCode}</span>
            </div>

            <h3 className="roadmap-selected__title">{activeItem.title}</h3>

            <dl className="roadmap-selected__facts">
              <div>
                <dt>{dictionary.roadmap.period}</dt>
                <dd>{activePeriod}</dd>
              </div>
              <div>
                <dt>{dictionary.roadmap.archive}</dt>
                <dd>{dictionary.roadmap.types[activeItem.type]}</dd>
              </div>
            </dl>

            <div className="roadmap-selected__details">
              <p>{dictionary.roadmap.details}</p>
              <p>{activeItem.details}</p>
            </div>

            <div className="roadmap-tech-list" aria-label={dictionary.roadmap.technologies}>
              {activeItem.technologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          </aside>
        </div>

        <div className="roadmap-timeline mt-14">
          {items.map((item, index) => {
            const isActive = item.id === activeItem.id;
            const period = formatPeriod(item.startDate, item.endDate);
            const evidenceCode = getEvidenceCode(item);
            const figureLabel = getFigureLabel(dictionary.roadmap.figure, index);
            const position = index % 2 === 0 ? "left" : "right";

            return (
              <article
                key={item.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className="roadmap-item"
                data-active={isActive}
                data-position={position}
              >
                <div className="roadmap-item__axis" aria-hidden="true">
                  <span className="roadmap-item__marker">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="roadmap-item__copy">
                  <button
                    type="button"
                    className="roadmap-item__button"
                    aria-pressed={isActive}
                    aria-label={`${dictionary.roadmap.selectItem}: ${item.title}`}
                    onClick={() => setActiveId(item.id)}
                    onFocus={() => setActiveId(item.id)}
                    onMouseEnter={() => setActiveId(item.id)}
                  >
                    <div className="roadmap-item__stamps">
                      <span>{period}</span>
                      <span>{dictionary.roadmap.types[item.type]}</span>
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>

                    <div className="roadmap-tech-list">
                      {item.technologies.map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </div>
                  </button>
                </div>

                <div className="roadmap-item__evidence" aria-hidden="true">
                  <div className="roadmap-evidence-card">
                    <div className="roadmap-evidence-card__topline">
                      <span>{figureLabel}</span>
                      <span>{dictionary.roadmap.evidence}</span>
                    </div>
                    <div className="roadmap-evidence-card__code">{evidenceCode}</div>
                    <div className="roadmap-evidence-card__plate">
                      <span>{dictionary.roadmap.types[item.type]}</span>
                      <strong>{item.title}</strong>
                    </div>
                    <div className="roadmap-evidence-card__lines">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
