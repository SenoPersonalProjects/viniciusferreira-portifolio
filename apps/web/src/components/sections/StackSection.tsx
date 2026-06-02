import { stack } from "@/data/stack";

export function StackSection() {
  return (
    <section
      id="stack"
      className="border-t border-[var(--color-border)] px-6 py-24 transition-colors duration-300"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-[var(--color-primary)]">
          Stack
        </p>

        <h2 className="mt-4 text-3xl font-bold text-[var(--color-foreground)] md:text-4xl">
          Tecnologias que uso
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {stack.map((group) => (
            <article
              key={group.category}
              className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6 transition-colors duration-300"
            >
              <h3 className="text-xl font-semibold text-[var(--color-foreground)]">
                {group.category}
              </h3>

              <div className="mt-5 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-primary)]"
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