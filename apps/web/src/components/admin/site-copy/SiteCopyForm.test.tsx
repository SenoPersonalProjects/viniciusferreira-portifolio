import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteCopyForm } from "@/components/admin/site-copy/SiteCopyForm";
import type { AdminSiteCopy } from "@/lib/admin/siteCopy";

const existingRecord: AdminSiteCopy = {
  id: "site-copy-hero-headline",
  key: "hero.headline",
  locale: "pt-BR",
  value: "Desenvolvo produtos web claros e gerenciáveis.",
};

describe("SiteCopyForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders accessible fields", () => {
    render(<SiteCopyForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Chave")).not.toBeNull();
    expect(screen.getByLabelText("Locale")).not.toBeNull();
    expect(screen.getByLabelText("Texto")).not.toBeNull();
  });

  it("submits a normalized site copy payload", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const user = userEvent.setup();

    render(<SiteCopyForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Chave"), " Hero.Headline ");
    await user.selectOptions(screen.getByLabelText("Locale"), "en");
    await user.type(screen.getByLabelText("Texto"), "  Keep This Casing  ");
    await user.click(screen.getByRole("button", { name: "Criar texto" }));

    expect(onSubmit).toHaveBeenCalledWith({
      key: "hero.headline",
      locale: "en",
      value: "Keep This Casing",
    });
  });

  it("shows validation errors without clearing user input", () => {
    const onSubmit = vi.fn();

    render(<SiteCopyForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Chave"), {
      target: { value: "hero headline" },
    });
    fireEvent.change(screen.getByLabelText("Texto"), {
      target: { value: "Texto preservado" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar texto" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("Revise");
    expect((screen.getByLabelText("Chave") as HTMLInputElement).value).toBe(
      "hero headline",
    );
    expect((screen.getByLabelText("Texto") as HTMLTextAreaElement).value).toBe(
      "Texto preservado",
    );
  });

  it("fills fields and locks key and locale when editing", () => {
    render(<SiteCopyForm initialValue={existingRecord} onSubmit={vi.fn()} />);

    expect((screen.getByLabelText("Chave") as HTMLInputElement).value).toBe(
      "hero.headline",
    );
    expect((screen.getByLabelText("Chave") as HTMLInputElement).disabled).toBe(
      true,
    );
    expect((screen.getByLabelText("Locale") as HTMLSelectElement).value).toBe(
      "pt-BR",
    );
    expect(
      (screen.getByLabelText("Locale") as HTMLSelectElement).disabled,
    ).toBe(true);
    expect((screen.getByLabelText("Texto") as HTMLTextAreaElement).value).toBe(
      "Desenvolvo produtos web claros e gerenciáveis.",
    );
  });

  it("disables submit while submitting", () => {
    render(<SiteCopyForm isSubmitting onSubmit={vi.fn()} />);

    expect(
      (screen.getByRole("button", { name: "Salvando..." }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
