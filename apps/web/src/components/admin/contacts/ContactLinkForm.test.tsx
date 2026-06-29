import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactLinkForm } from "@/components/admin/contacts/ContactLinkForm";

describe("ContactLinkForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders accessible fields", () => {
    render(<ContactLinkForm contactLinks={[]} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Label")).not.toBeNull();
    expect(screen.getByLabelText("Tipo")).not.toBeNull();
    expect(screen.getByLabelText("URL ou email")).not.toBeNull();
    expect(screen.getByLabelText("Ordem")).not.toBeNull();
    expect(
      screen.getByLabelText("Visível no portfólio público"),
    ).not.toBeNull();
  });

  it("submits a normalized email payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ContactLinkForm
        contactLinks={[{ order: 2 } as never]}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Label"), "Email");
    await user.selectOptions(screen.getByLabelText("Tipo"), "email");
    await user.type(screen.getByLabelText("URL ou email"), "contato@example.com");
    await user.click(screen.getByRole("button", { name: "Criar contato" }));

    expect(onSubmit).toHaveBeenCalledWith({
      label: "Email",
      order: 3,
      type: "email",
      url: "mailto:contato@example.com",
      visible: true,
    });
  });

  it("shows validation errors without clearing user input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ContactLinkForm contactLinks={[]} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Label"), "GitHub");
    await user.type(screen.getByLabelText("URL ou email"), "github.com/user");
    await user.click(screen.getByRole("button", { name: "Criar contato" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("Revise");
    expect((screen.getByLabelText("URL ou email") as HTMLInputElement).value).toBe(
      "github.com/user",
    );
  });
});
