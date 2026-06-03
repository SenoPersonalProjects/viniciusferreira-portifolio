"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { stack } from "@/data/stack";

export function StackSection() {
  const { dictionary } = useLanguage();
  const localizedStack = stack.map((group, index) => ({
    ...group,
    category: dictionary.stack.categories[index] ?? group.category,
  }));

  return (
    <section id="stack" className="section-border px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="section-eyebrow">{dictionary.stack.eyebrow}</p>

        <h2 className="section-title mt-6 text-5xl md:text-7xl">
          {dictionary.stack.titleStart}{" "}
          <span className="text-[var(--color-primary)]">
            {dictionary.stack.titleHighlight}
          </span>
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {localizedStack.map((group) => (
            <article
              key={group.category}
              className="section-card relative overflow-hidden p-8 md:p-10"
            >
              <div className="absolute right-4 top-4 opacity-10">
                <p className="font-[var(--font-industrial)] text-4xl uppercase tracking-[0.2em]">
                  {group.category.substring(0, 3)}
                </p>
              </div>

              <h3 className="font-[var(--font-industrial)] text-xl font-bold uppercase tracking-[0.2em] text-[var(--color-foreground)] md:text-2xl">
                {group.category}
              </h3>

              <div className="mt-8 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-1.5 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-primary)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
