import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TechnologyForm } from "@/components/admin/technologies/TechnologyForm";
import type { AdminTechnology } from "@/lib/admin/technologies";

const existingTechnology: AdminTechnology = {
  categoryEn: "Frontend",
  categoryPt: "Frontend",
  id: "frontend",
  items: ["Next.js", "React"],
  order: 2,
  visible: true,
};

describe("TechnologyForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders accessible fields", () => {
    render(<TechnologyForm onSubmit={vi.fn()} technologies={[]} />);

    expect(screen.getByLabelText("Categoria PT")).not.toBeNull();
    expect(screen.getByLabelText("Categoria EN")).not.toBeNull();
    expect(screen.getByLabelText("Itens")).not.toBeNull();
    expect(screen.getByLabelText("Ordem")).not.toBeNull();
    expect(
      screen.getByLabelText("Visível no portfólio público"),
    ).not.toBeNull();
  });

  it("submits a normalized stack payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TechnologyForm
        onSubmit={onSubmit}
        technologies={[existingTechnology]}
      />,
    );

    await user.type(screen.getByLabelText("Categoria PT"), "Backend");
    await user.type(screen.getByLabelText("Categoria EN"), "Backend");
    await user.type(
      screen.getByLabelText("Itens"),
      "NestJS\nNode.js\nNestJS\nTypeScript",
    );
    await user.click(screen.getByRole("button", { name: "Criar stack" }));

    expect(onSubmit).toHaveBeenCalledWith({
      categoryEn: "Backend",
      categoryPt: "Backend",
      items: ["NestJS", "Node.js", "TypeScript"],
      order: 3,
      visible: true,
    });
  });

  it("shows validation errors without clearing user input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TechnologyForm onSubmit={onSubmit} technologies={[]} />);

    await user.type(screen.getByLabelText("Categoria PT"), "Frontend");
    await user.type(screen.getByLabelText("Itens"), "React");
    await user.click(screen.getByRole("button", { name: "Criar stack" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("Revise");
    expect(
      (screen.getByLabelText("Categoria PT") as HTMLInputElement).value,
    ).toBe("Frontend");
  });

  it("fills fields when editing an existing technology group", () => {
    render(
      <TechnologyForm
        initialValue={existingTechnology}
        onSubmit={vi.fn()}
        technologies={[existingTechnology]}
      />,
    );

    expect((screen.getByLabelText("Categoria PT") as HTMLInputElement).value).toBe(
      "Frontend",
    );
    expect((screen.getByLabelText("Categoria EN") as HTMLInputElement).value).toBe(
      "Frontend",
    );
    expect((screen.getByLabelText("Itens") as HTMLTextAreaElement).value).toBe(
      "Next.js\nReact",
    );
    expect((screen.getByLabelText("Ordem") as HTMLInputElement).value).toBe("2");
    expect(
      (screen.getByLabelText(
        "Visível no portfólio público",
      ) as HTMLInputElement).checked,
    ).toBe(true);
  });
});
