"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { profile } from "@/data/profile";

export function HeroSection() {
  const { dictionary } = useLanguage();
  const firstName = profile.name.split(" ")[0];
  const lastName = profile.name.split(" ").slice(1).join(" ");

  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".section-eyebrow", {
        y: 20,
        opacity: 0,
        duration: 0.8,
      })
        .from(
          titleRef.current?.children ?? [],
          {
            y: 40,
            opacity: 0,
            stagger: 0.1,
            duration: 1,
          },
          "-=0.4",
        )
        .from(
          ".vintage-copy-frame",
          {
            x: -20,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.6",
        )
        .from(
          ".primary-action, .secondary-action",
          {
            y: 20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
          },
          "-=0.4",
        )
        .from(
          posterRef.current,
          {
            rotateY: 20,
            rotateX: 10,
            scale: 0.95,
            opacity: 0,
            duration: 1.2,
          },
          "-=1",
        );

      gsap.to(".vintage-flicker", {
        opacity: 0.8,
        repeat: -1,
        yoyo: true,
        duration: 0.1,
        repeatRefresh: true,
        ease: "none",
        onRepeat: () => {
          gsap.set(".vintage-flicker", {
            opacity: Math.random() > 0.95 ? 0.6 : 1,
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={containerRef}
      className="vintage-hero mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-14 px-6 py-16 md:grid-cols-12 md:px-10 md:py-24"
    >
      <div className="relative md:col-span-7">
        <p className="section-eyebrow mb-10">{dictionary.profile.role}</p>

        <h1
          ref={titleRef}
          className="section-title vintage-title-shadow vintage-hero-title vintage-flicker text-6xl font-normal md:text-8xl"
        >
          <span className="block opacity-80">{dictionary.hero.intro}</span>

          <span className="block font-[var(--font-accent)] text-[0.85em] lowercase italic leading-[0.8] tracking-normal text-[var(--color-primary)]">
            {firstName}
          </span>

          <span className="block">{lastName}.</span>
        </h1>

        <div className="relative mt-12 max-w-2xl">
          <div className="absolute -left-4 top-0 h-full w-[2px] bg-[var(--color-primary)] opacity-40" />

          <div className="vintage-copy-frame relative z-10 p-6 md:p-8">
            <p className="font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
              {dictionary.profile.headline}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 sm:flex-row">
          <a
            href="#projects"
            className="primary-action vintage-action h-14 min-w-[200px] text-[10px] font-bold uppercase tracking-[0.3em]"
          >
            {dictionary.hero.projectsCta}
          </a>

          <a
            href="#contact"
            className="secondary-action vintage-action h-14 min-w-[200px] text-[10px] font-bold uppercase tracking-[0.3em]"
          >
            {dictionary.hero.contactCta}
          </a>
        </div>
      </div>

      <div className="relative md:col-span-5">
        <div className="vintage-halftone-accent absolute -right-4 -top-4 hidden h-48 w-48 md:block">
          <div className="halftone-bg h-full w-full" />
        </div>

        <div className="relative mx-auto max-w-[440px]">
          <div className="absolute inset-0 translate-x-4 translate-y-4 border-2 border-[var(--color-border)] opacity-30" />

          <div
            ref={posterRef}
            className="vintage-frame vintage-poster relative z-10 aspect-[3/4.2] overflow-hidden p-5"
          >
            <div className="vintage-frame-inner vintage-poster-inner flex h-full w-full flex-col items-center justify-between border border-[var(--color-border)] p-8 text-center">
              <div className="w-full border-b border-[var(--color-border)] pb-4 opacity-40">
                <p className="font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.4em]">
                  {dictionary.hero.production}
                </p>
              </div>

              <div className="py-12">
                <p className="vintage-poster-mark font-[var(--font-accent)] text-8xl leading-none text-[var(--color-foreground)] md:text-9xl">
                  VF
                </p>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <div className="h-[1px] w-8 bg-[var(--color-border)]" />

                  <p className="vintage-poster-caption font-[var(--font-industrial)] text-[11px] font-bold uppercase tracking-[0.4em]">
                    {dictionary.hero.posterRole}
                  </p>

                  <div className="h-[1px] w-8 bg-[var(--color-border)]" />
                </div>
              </div>

              <div className="w-full border-t border-[var(--color-border)] pt-4 opacity-40">
                <p className="font-[var(--font-industrial)] text-[9px] font-bold uppercase tracking-[0.45em]">
                  {dictionary.hero.posterExperience}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
