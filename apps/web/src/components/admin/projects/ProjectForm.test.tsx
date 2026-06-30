import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProjectForm } from "@/components/admin/projects/ProjectForm";
import type { AdminProject } from "@/lib/admin/projects";

const existingProject: AdminProject = {
  descriptionEn: "English description for the manageable portfolio project.",
  descriptionPt: "Descrição em português para o projeto de portfólio.",
  featured: true,
  frameCode: "VF-001",
  id: "project-portfolio",
  liveUrl: null,
  order: 2,
  posterImage: "/projects/portfolio/poster.svg",
  previewImages: [
    "/projects/portfolio/preview-01.svg",
    "/projects/portfolio/preview-02.svg",
  ],
  published: true,
  repositoryUrl:
    "https://github.com/SenoPersonalProjects/viniciusferreira-portifolio",
  slug: "portfolio-gerenciavel",
  stack: ["Next.js", "NestJS"],
  titleEn: "Manageable portfolio",
  titlePt: "Portfólio gerenciável",
};

describe("ProjectForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders accessible project fields", () => {
    render(<ProjectForm onSubmit={vi.fn()} projects={[]} />);

    expect(screen.getByLabelText("Título PT")).not.toBeNull();
    expect(screen.getByLabelText("Título EN")).not.toBeNull();
    expect(screen.getByLabelText("Slug")).not.toBeNull();
    expect(screen.getByLabelText("Descrição PT")).not.toBeNull();
    expect(screen.getByLabelText("Descrição EN")).not.toBeNull();
    expect(screen.getByLabelText("Stack")).not.toBeNull();
    expect(screen.getByLabelText("URL do repositório")).not.toBeNull();
    expect(screen.getByLabelText("URL da demo")).not.toBeNull();
    expect(screen.getByLabelText("Código do frame")).not.toBeNull();
    expect(screen.getByLabelText("Poster")).not.toBeNull();
    expect(screen.getByLabelText("Imagens de preview")).not.toBeNull();
    expect(screen.getByLabelText("Ordem")).not.toBeNull();
    expect(screen.getByLabelText("Destacado no Film Reel")).not.toBeNull();
    expect(
      screen.getByLabelText("Publicado no portfólio público"),
    ).not.toBeNull();
  });

  it("generates slug only when the button is clicked", async () => {
    const user = userEvent.setup();

    render(<ProjectForm onSubmit={vi.fn()} projects={[]} />);

    await user.type(screen.getByLabelText("Título PT"), "Portfólio Gerenciável");

    expect((screen.getByLabelText("Slug") as HTMLInputElement).value).toBe("");

    await user.click(screen.getByRole("button", { name: "Gerar slug" }));

    expect((screen.getByLabelText("Slug") as HTMLInputElement).value).toBe(
      "portfolio-gerenciavel",
    );
  });

  it("submits a normalized project payload", async () => {
    const onSubmit = vi.fn();

    render(<ProjectForm onSubmit={onSubmit} projects={[existingProject]} />);

    fireEvent.change(screen.getByLabelText("Título PT"), {
      target: { value: "Novo Projeto Noir" },
    });
    fireEvent.change(screen.getByLabelText("Título EN"), {
      target: { value: "New Noir Project" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Gerar slug" }));
    fireEvent.change(screen.getByLabelText("Descrição PT"), {
      target: { value: "Descrição válida em português para o novo projeto." },
    });
    fireEvent.change(screen.getByLabelText("Descrição EN"), {
      target: { value: "Valid English description for the new project." },
    });
    fireEvent.change(screen.getByLabelText("Stack"), {
      target: { value: "Next.js\nReact\nNext.js" },
    });
    fireEvent.change(screen.getByLabelText("URL do repositório"), {
      target: { value: "https://github.com/SenoPersonalProjects/example" },
    });
    fireEvent.change(screen.getByLabelText("Poster"), {
      target: { value: "/projects/portfolio/poster.svg" },
    });
    fireEvent.change(screen.getByLabelText("Imagens de preview"), {
      target: {
        value:
          "/projects/portfolio/preview-01.svg\n/projects/portfolio/preview-01.svg",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar projeto" }));

    expect(onSubmit).toHaveBeenCalledWith({
      descriptionEn: "Valid English description for the new project.",
      descriptionPt: "Descrição válida em português para o novo projeto.",
      featured: true,
      frameCode: null,
      liveUrl: null,
      order: 3,
      posterImage: "/projects/portfolio/poster.svg",
      previewImages: ["/projects/portfolio/preview-01.svg"],
      published: true,
      repositoryUrl: "https://github.com/SenoPersonalProjects/example",
      slug: "novo-projeto-noir",
      stack: ["Next.js", "React"],
      titleEn: "New Noir Project",
      titlePt: "Novo Projeto Noir",
    });
  });

  it("shows validation errors without clearing user input", async () => {
    const onSubmit = vi.fn();

    render(<ProjectForm onSubmit={onSubmit} projects={[]} />);

    fireEvent.change(screen.getByLabelText("Título PT"), {
      target: { value: "Projeto" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar projeto" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("Revise");
    expect((screen.getByLabelText("Título PT") as HTMLInputElement).value).toBe(
      "Projeto",
    );
  });

  it("fills fields when editing an existing project", () => {
    render(
      <ProjectForm
        initialValue={existingProject}
        onSubmit={vi.fn()}
        projects={[existingProject]}
      />,
    );

    expect((screen.getByLabelText("Título PT") as HTMLInputElement).value).toBe(
      "Portfólio gerenciável",
    );
    expect((screen.getByLabelText("Título EN") as HTMLInputElement).value).toBe(
      "Manageable portfolio",
    );
    expect((screen.getByLabelText("Slug") as HTMLInputElement).value).toBe(
      "portfolio-gerenciavel",
    );
    expect((screen.getByLabelText("Stack") as HTMLTextAreaElement).value).toBe(
      "Next.js\nNestJS",
    );
    expect(
      (screen.getByLabelText("Imagens de preview") as HTMLTextAreaElement)
        .value,
    ).toBe(
      "/projects/portfolio/preview-01.svg\n/projects/portfolio/preview-02.svg",
    );
    expect((screen.getByLabelText("Ordem") as HTMLInputElement).value).toBe("2");
    expect(
      (screen.getByLabelText("Destacado no Film Reel") as HTMLInputElement)
        .checked,
    ).toBe(true);
  });
});
