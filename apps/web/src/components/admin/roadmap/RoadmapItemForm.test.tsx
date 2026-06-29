import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("submits a normalized roadmap payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <RoadmapItemForm onSubmit={onSubmit} roadmap={[existingItem]} />,
    );

    await user.type(screen.getByLabelText("Início"), " Jan 2024 ");
    await user.type(screen.getByLabelText("Fim"), "Atual");
    await user.selectOptions(screen.getByLabelText("Tipo"), "carreira");
    await user.type(screen.getByLabelText("Título PT"), "Prática full stack");
    await user.type(screen.getByLabelText("Título EN"), "Full stack practice");
    await user.type(
      screen.getByLabelText("Resumo PT"),
      "Resumo válido em português para o item.",
    );
    await user.type(
      screen.getByLabelText("Resumo EN"),
      "Valid English summary for the item.",
    );
    await user.type(
      screen.getByLabelText("Detalhes PT"),
      "Detalhes válidos em português para o item da linha do tempo.",
    );
    await user.type(
      screen.getByLabelText("Detalhes EN"),
      "Valid English details for this timeline item.",
    );
    await user.type(screen.getByLabelText("Tecnologias"), "React\nReact\nNode.js");
    await user.click(screen.getByRole("button", { name: "Criar item" }));

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

  it("shows validation errors without clearing user input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<RoadmapItemForm onSubmit={onSubmit} roadmap={[]} />);

    await user.type(screen.getByLabelText("Título PT"), "Trajetória");
    await user.click(screen.getByRole("button", { name: "Criar item" }));

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
