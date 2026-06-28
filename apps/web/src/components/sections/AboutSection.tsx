"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePortfolioData } from "@/components/providers/PortfolioDataProvider";

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const { dictionary } = useLanguage();
  const { content, source } = usePortfolioData();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const profileSummary =
    source === "api" && content.profile.summary
      ? content.profile.summary
      : dictionary.profile.summary;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".about-title-reveal", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(contentRef.current, {
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 85%",
        },
        x: 40,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="section-border px-6 py-20 md:px-10 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-12">
        <div className="md:col-span-5 about-title-reveal">
          <p className="section-eyebrow">{dictionary.about.eyebrow}</p>

          <h2 className="section-title mt-6 text-5xl md:text-7xl">
            {dictionary.about.titleStart}{" "}
            <span className="text-[var(--color-primary)]">
              {dictionary.about.titleHighlight}
            </span>
          </h2>

          <div className="mt-10 hidden md:block">
            <div className="h-px w-24 bg-[var(--color-primary)]" />
            <p className="mt-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">
              {dictionary.about.classified}
            </p>
          </div>
        </div>

        <div className="relative md:col-span-7">
          <div className="absolute -left-6 top-10 hidden h-px w-12 bg-[var(--color-border)] md:block" />

          <div 
            ref={contentRef}
            className="section-card relative border-l-4 border-l-[var(--color-primary)] p-8 md:p-12"
          >
            <div className="space-y-8 font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
              <p className="first-letter:font-[var(--font-display)] first-letter:text-5xl first-letter:text-[var(--color-primary)]">
                {profileSummary}
              </p>

              <p className="border-t border-[var(--color-border)] pt-8 opacity-90">
                {dictionary.about.focus}
              </p>
            </div>

            <div className="mt-12 flex items-center gap-4 opacity-40">
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <p className="font-[var(--font-industrial)] text-[9px] uppercase tracking-[0.5em]">
                {dictionary.about.end}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
