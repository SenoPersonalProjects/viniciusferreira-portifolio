export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)] px-6 py-8 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Vinicius Ferreira.</p>
        <p>Desenvolvido com Next.js, NestJS e TypeScript.</p>
      </div>
    </footer>
  );
}