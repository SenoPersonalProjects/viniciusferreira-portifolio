"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePortfolioData } from "@/components/providers/PortfolioDataProvider";
import { useSiteCopy } from "@/components/providers/SiteCopyProvider";
import { RotaryTelephoneProp } from "@/components/three/contact/RotaryTelephoneProp";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function ContactSection() {
  const { dictionary } = useLanguage();
  const { resolveCopy } = useSiteCopy();
  const { content } = usePortfolioData();
  const { ref, isRevealed } = useScrollReveal();

  const visibleLinks = content.contactLinks
    .filter((link) => link.visible && link.url)
    .sort((a, b) => a.order - b.order);
  const emailLink = visibleLinks.find((link) => link.type === "email");
  const secondaryLinks = visibleLinks.filter((link) => link.type !== "email");

  return (
    <section
      id="contact"
      ref={ref}
      className="section-border overflow-hidden px-6 py-20 md:px-10 md:pb-20 md:pt-32"
    >
      <div className="relative mx-auto max-w-7xl overflow-hidden pb-44 md:pb-52 lg:pb-56">
        <div className={`section-card relative z-10 overflow-visible p-8 sm:p-10 md:p-16 lg:p-20 scroll-reveal ${isRevealed ? "is-revealed" : ""}`}>
          <div
            className="absolute -right-20 -top-20 hidden h-64 w-64 md:block"
            aria-hidden="true"
          >
            <div className="halftone-bg h-full w-full opacity-10" />
          </div>

          <div className="relative z-10">
            <p className={`section-eyebrow scroll-reveal stagger-delay-1 ${isRevealed ? "is-revealed" : ""}`}>
              {resolveCopy("contact.eyebrow", dictionary.contact.eyebrow)}
            </p>

            <h2 className={`section-title mt-8 max-w-4xl text-5xl md:text-7xl scroll-reveal stagger-delay-2 ${isRevealed ? "is-revealed" : ""}`}>
              {resolveCopy("contact.titleStart", dictionary.contact.titleStart)}{" "}
              <span className="text-[var(--color-primary)]">
                {resolveCopy(
                  "contact.titleHighlight",
                  dictionary.contact.titleHighlight,
                )}
              </span>
            </h2>

            <p className={`mt-8 max-w-2xl font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl scroll-reveal stagger-delay-3 ${isRevealed ? "is-revealed" : ""}`}>
              {resolveCopy("contact.copy", dictionary.contact.copy)}
            </p>

            <div className={`mt-14 flex flex-col gap-6 sm:flex-row sm:flex-wrap scroll-reveal stagger-delay-4 ${isRevealed ? "is-revealed" : ""}`}>
              {emailLink && (
                <a
                  href={emailLink.url}
                  className="primary-action h-14 min-w-[min(100%,220px)] text-[10px] font-bold uppercase tracking-[0.3em]"
                >
                  {resolveCopy(
                    "contact.messageCta",
                    dictionary.contact.messageCta,
                  )}
                </a>
              )}

              <div className="flex min-w-0 flex-wrap gap-4">
                {secondaryLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-action h-14 min-w-[min(100%,160px)] text-[10px] font-bold uppercase tracking-[0.3em]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <RotaryTelephoneProp />
      </div>
    </section>
  );
}
