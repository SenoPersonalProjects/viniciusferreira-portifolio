"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePortfolioData } from "@/components/providers/PortfolioDataProvider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
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

function getRoadmapImage(item: RoadmapItem) {
  if (item.id === "roadmap-portfolio-gerenciavel") {
    return "/projects/portfolio/poster.svg";
  }

  return "";
}

export function RoadmapSection() {
  const { dictionary } = useLanguage();
  const { content, source } = usePortfolioData();
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const items = useMemo(
    () =>
      [...content.roadmap]
        .filter((item) => item.published)
        .sort((a, b) => a.order - b.order),
    [content.roadmap],
  );
  const { ref: headingRevealRef, isRevealed: headingRevealed } = useScrollReveal<HTMLDivElement>();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const activeItemId = items.some((item) => item.id === activeId)
    ? activeId
    : items[0]?.id ?? "";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".roadmap-timeline__line",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 75%",
            end: "bottom 85%",
            scrub: true,
          },
        }
      );
    }, timelineRef);

    return () => ctx.revert();
  }, [items]);

  useEffect(() => {
    let frame = 0;

    const updateActiveFromViewport = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestId = "";
      let closestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item) => {
        if (!item) {
          return;
        }

        item.setAttribute("data-visible", "true");

        const trigger = item.querySelector(".roadmap-item__trigger");
        const rect = (trigger ?? item).getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = item.dataset.roadmapId ?? "";
        }
      });

      if (closestId) {
        setActiveId(closestId);
      }
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActiveFromViewport();
      });
    };

    const timer = window.setTimeout(updateActiveFromViewport, 0);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
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
        <div
          ref={headingRevealRef}
          className={`roadmap-heading scroll-reveal ${headingRevealed ? "is-revealed" : ""}`}
        >
          <p className="section-eyebrow">{dictionary.roadmap.eyebrow}</p>

          <h2 className="section-title mt-6 text-5xl md:text-7xl">
            {dictionary.roadmap.title}
          </h2>
          <p className="mt-8 max-w-3xl font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
            {dictionary.roadmap.copy}
          </p>
        </div>

        <div ref={timelineRef} className="roadmap-timeline mt-14">
          <div className="roadmap-timeline__line" aria-hidden="true" />
          {items.map((item, index) => {
            const isActive = item.id === activeItemId;
            const period = formatPeriod(item.startDate, item.endDate);
            const evidenceCode = getEvidenceCode(item);
            const figureLabel = getFigureLabel(dictionary.roadmap.figure, index);
            const position = index % 2 === 0 ? "left" : "right";
            const imageUrl = getRoadmapImage(item);
            const panelId = `roadmap-panel-${item.id}`;
            const localizedItem =
              source === "fallback"
                ? dictionary.roadmap.items[
                    item.id as keyof typeof dictionary.roadmap.items
                  ]
                : undefined;
            const itemTitle = localizedItem?.title ?? item.title;
            const itemSummary = localizedItem?.summary ?? item.summary;
            const itemDetails = localizedItem?.details ?? item.details;
            const visualStyle = imageUrl
              ? ({
                  "--roadmap-visual-image": `url(${imageUrl})`,
                } as CSSProperties)
              : undefined;

            return (
              <article
                key={item.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className="roadmap-item"
                data-active={isActive}
                data-position={position}
                data-roadmap-id={item.id}
              >
                <div className="roadmap-item__axis" aria-hidden="true">
                  <span className="roadmap-item__marker">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="roadmap-item__card">
                  <button
                    type="button"
                    className="roadmap-item__trigger"
                    aria-controls={panelId}
                    aria-expanded={isActive}
                    aria-label={`${dictionary.roadmap.selectItem}: ${itemTitle}`}
                    onClick={() => setActiveId(item.id)}
                    onFocus={() => setActiveId(item.id)}
                    onMouseEnter={() => setActiveId(item.id)}
                  >
                    <span className="roadmap-item__period">{period}</span>
                    <span className="roadmap-item__type">
                      {dictionary.roadmap.types[item.type]}
                    </span>
                    <span className="roadmap-item__title">{itemTitle}</span>
                  </button>

                  <div
                    id={panelId}
                    className="roadmap-item__panel"
                    aria-hidden={!isActive}
                  >
                    <div className="roadmap-item__description">
                      <p>{itemSummary}</p>
                      <p>{itemDetails}</p>

                      <div
                        className="roadmap-tech-list"
                        aria-label={dictionary.roadmap.technologies}
                      >
                        {item.technologies.map((technology) => (
                          <span key={technology}>{technology}</span>
                        ))}
                      </div>
                    </div>

                    <figure
                      className="roadmap-visual-card"
                      data-has-image={Boolean(imageUrl)}
                      style={visualStyle}
                    >
                      <div className="roadmap-visual-card__topline">
                        <span>{figureLabel}</span>
                        <span>{dictionary.roadmap.evidence}</span>
                      </div>
                      <div className="roadmap-visual-card__media" aria-hidden="true">
                        <span>{evidenceCode}</span>
                      </div>
                      <figcaption>
                        {dictionary.roadmap.types[item.type]} / {itemTitle}
                      </figcaption>
                    </figure>
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
