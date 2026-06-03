import { stack } from "@/data/stack";

export function StackSection() {
  return (
    <section id="stack" className="section-border px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="section-eyebrow">Stack</p>

        <h2 className="section-title mt-5 text-4xl md:text-5xl">
          Tecnologias que uso
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {stack.map((group) => (
            <article key={group.category} className="section-card p-6 md:p-7">
              <h3 className="font-[var(--font-display)] text-2xl text-[var(--color-foreground)] md:text-3xl">
                {group.category}
              </h3>

              <div className="mt-6 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]"
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