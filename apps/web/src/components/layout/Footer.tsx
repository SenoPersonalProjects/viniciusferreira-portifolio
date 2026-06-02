export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Vinicius Ferreira.</p>
        <p>Desenvolvido com Next.js, NestJS e TypeScript.</p>
      </div>
    </footer>
  );
}