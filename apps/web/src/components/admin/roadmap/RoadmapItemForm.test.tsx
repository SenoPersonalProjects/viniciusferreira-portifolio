import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RoadmapItemForm } from "@/components/admin/roadmap/RoadmapItemForm";
import type { AdminRoadmapItem } from "@/lib/admin/roadmap";

const existingItem: AdminRoadmapItem = {
  detailsEn: "Detailed English information about the portfolio project.",
  detailsPt: "Informações detalhadas em português sobre o projeto de portfólio.",
  endDate: "2026-06",
  id: "roadmap-portfolio",
  order: 2,
  published: true,
  startDate: "2026-01",
  summaryEn: "English summary for the portfolio project.",
  summaryPt: "Resumo em português para o projeto de portfólio.",
  technologies: ["Next.js", "NestJS"],
  titleEn: "Manageable portfolio",
  titlePt: "Portfólio gerenciável",
  type: "projeto",
};

describe("RoadmapItemForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders accessible roadmap fields", () => {
    render(<RoadmapItemForm onSubmit={vi.fn()} roadmap={[]} />);

    expect(screen.getByLabelText("Início")).not.toBeNull();
    expect(screen.getByLabelText("Fim")).not.toBeNull();
    expect(screen.getByLabelText("Tipo")).not.toBeNull();
    expect(screen.getByLabelText("Título PT")).not.toBeNull();
    expect(screen.getByLabelText("Título EN")).not.toBeNull();
    expect(screen.getByLabelText("Resumo PT")).not.toBeNull();
    expect(screen.getByLabelText("Resumo EN")).not.toBeNull();
    expect(screen.getByLabelText("Detalhes PT")).not.toBeNull();
    expect(screen.getByLabelText("Detalhes EN")).not.toBeNull();
    expect(screen.getByLabelText("Tecnologias")).not.toBeNull();
    expect(screen.getByLabelText("Ordem")).not.toBeNull();
    expect(screen.getByLabelText("Publicado no portfólio público")).not.toBeNull();
  });

  it("submits a normalized roadmap payload", () => {
    const onSubmit = vi.fn();

    render(
      <RoadmapItemForm onSubmit={onSubmit} roadmap={[existingItem]} />,
    );

    fireEvent.change(screen.getByLabelText("Início"), {
      target: { value: " Jan 2024 " },
    });
    fireEvent.change(screen.getByLabelText("Fim"), {
      target: { value: "Atual" },
    });
    fireEvent.change(screen.getByLabelText("Tipo"), {
      target: { value: "carreira" },
    });
    fireEvent.change(screen.getByLabelText("Título PT"), {
      target: { value: "Prática full stack" },
    });
    fireEvent.change(screen.getByLabelText("Título EN"), {
      target: { value: "Full stack practice" },
    });
    fireEvent.change(screen.getByLabelText("Resumo PT"), {
      target: { value: "Resumo válido em português para o item." },
    });
    fireEvent.change(screen.getByLabelText("Resumo EN"), {
      target: { value: "Valid English summary for the item." },
    });
    fireEvent.change(screen.getByLabelText("Detalhes PT"), {
      target: {
        value: "Detalhes válidos em português para o item da linha do tempo.",
      },
    });
    fireEvent.change(screen.getByLabelText("Detalhes EN"), {
      target: { value: "Valid English details for this timeline item." },
    });
    fireEvent.change(screen.getByLabelText("Tecnologias"), {
      target: { value: "React\nReact\nNode.js" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar item" }));

    expect(onSubmit).toHaveBeenCalledWith({
      detailsEn: "Valid English details for this timeline item.",
      detailsPt: "Detalhes válidos em português para o item da linha do tempo.",
      endDate: "Atual",
      order: 3,
      published: true,
      startDate: "Jan 2024",
      summaryEn: "Valid English summary for the item.",
      summaryPt: "Resumo válido em português para o item.",
      technologies: ["React", "Node.js"],
      titleEn: "Full stack practice",
      titlePt: "Prática full stack",
      type: "carreira",
    });
  });

  it("shows validation errors without clearing user input", () => {
    const onSubmit = vi.fn();

    render(<RoadmapItemForm onSubmit={onSubmit} roadmap={[]} />);

    fireEvent.change(screen.getByLabelText("Título PT"), {
      target: { value: "Trajetória" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar item" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("Revise");
    expect((screen.getByLabelText("Título PT") as HTMLInputElement).value).toBe(
      "Trajetória",
    );
  });

  it("fills fields when editing an existing roadmap item", () => {
    render(
      <RoadmapItemForm
        initialValue={existingItem}
        onSubmit={vi.fn()}
        roadmap={[existingItem]}
      />,
    );

    expect((screen.getByLabelText("Início") as HTMLInputElement).value).toBe(
      "2026-01",
    );
    expect((screen.getByLabelText("Fim") as HTMLInputElement).value).toBe(
      "2026-06",
    );
    expect((screen.getByLabelText("Título PT") as HTMLInputElement).value).toBe(
      "Portfólio gerenciável",
    );
    expect((screen.getByLabelText("Título EN") as HTMLInputElement).value).toBe(
      "Manageable portfolio",
    );
    expect((screen.getByLabelText("Tecnologias") as HTMLTextAreaElement).value).toBe(
      "Next.js\nNestJS",
    );
    expect((screen.getByLabelText("Ordem") as HTMLInputElement).value).toBe("2");
    expect(
      (screen.getByLabelText(
        "Publicado no portfólio público",
      ) as HTMLInputElement).checked,
    ).toBe(true);
  });
});
