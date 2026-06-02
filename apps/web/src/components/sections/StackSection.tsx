import { stack } from "@/data/stack";

export function StackSection() {
  return (
    <section id="stack" className="border-t border-white/10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">
          Stack
        </p>

        <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
          Tecnologias que uso
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {stack.map((group) => (
            <article
              key={group.category}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >
              <h3 className="text-xl font-semibold text-white">
                {group.category}
              </h3>

              <div className="mt-5 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm text-cyan-100"
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