import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AdminDossierPreviewPage } from "@/components/admin/dossier/AdminDossierPreviewPage";

describe("AdminDossierPreviewPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders accessible dossier fields", () => {
    render(<AdminDossierPreviewPage />);

    expect(screen.getByLabelText("Locale")).not.toBeNull();
    expect(screen.getByLabelText("Arquivo")).not.toBeNull();
    expect(screen.getByLabelText("Classificação")).not.toBeNull();
    expect(screen.getByLabelText("Projeto")).not.toBeNull();
    expect(screen.getByLabelText("Assunto")).not.toBeNull();
    expect(screen.getByLabelText("Note")).not.toBeNull();
    expect(screen.getByLabelText("Imagem principal")).not.toBeNull();
    expect(screen.getByLabelText("Imagem polaroid")).not.toBeNull();
    expect(screen.getByText(/Prévia local: alterações não são salvas/)).not.toBeNull();
  });

  it("switches locale using the local dossier content", () => {
    render(<AdminDossierPreviewPage />);

    fireEvent.change(screen.getByLabelText("Locale"), {
      target: { value: "en" },
    });

    expect((screen.getByLabelText("Projeto") as HTMLInputElement).value).toBe(
      "MANAGEABLE PORTFOLIO",
    );
    expect(screen.getByText("Locales disponíveis: pt, en")).not.toBeNull();
  });

  it("applies normalized edits to the preview", () => {
    render(<AdminDossierPreviewPage />);

    fireEvent.change(screen.getByLabelText("Projeto"), {
      target: { value: " PROJETO DE TESTE " },
    });
    fireEvent.change(screen.getByLabelText("Note"), {
      target: { value: " Nota com Acentos e Casing Preservado. " },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar na prévia" }),
    );

    expect(screen.getByText("PROJETO DE TESTE")).not.toBeNull();
    expect(
      screen.getAllByText("Nota com Acentos e Casing Preservado.").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("Prévia atualizada localmente. Nada foi salvo no banco."),
    ).not.toBeNull();
  });

  it("shows validation errors without clearing user input", () => {
    render(<AdminDossierPreviewPage />);

    fireEvent.change(screen.getByLabelText("Imagem principal"), {
      target: { value: "profile/detective/individual-1.jpeg" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar na prévia" }),
    );

    expect(screen.getByRole("alert").textContent).toContain("Revise");
    expect(
      (screen.getByLabelText("Imagem principal") as HTMLInputElement).value,
    ).toBe("profile/detective/individual-1.jpeg");
  });

  it("resets the current locale to local content", () => {
    render(<AdminDossierPreviewPage />);

    fireEvent.change(screen.getByLabelText("Projeto"), {
      target: { value: "PROJETO ALTERADO" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar na prévia" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Resetar conteúdo atual" }),
    );

    expect((screen.getByLabelText("Projeto") as HTMLInputElement).value).toBe(
      "PORTFOLIO GERENCIAVEL",
    );
    expect(
      screen.getByText("Conteúdo local restaurado para este locale."),
    ).not.toBeNull();
  });
});
