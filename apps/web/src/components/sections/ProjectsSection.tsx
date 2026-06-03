import { FilmReelProjects } from "@/components/projects/FilmReelProjects";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="section-border px-6 py-20 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <p className="section-eyebrow">Projetos</p>

        <h2 className="section-title mt-5 text-4xl md:text-5xl">
          Projetos em destaque
        </h2>

        <FilmReelProjects />
      </div>
    </section>
  );
}