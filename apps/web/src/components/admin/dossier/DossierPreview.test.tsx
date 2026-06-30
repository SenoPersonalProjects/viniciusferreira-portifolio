import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DossierPreview } from "@/components/admin/dossier/DossierPreview";
import { dossierByLocale } from "@/data/dossier";

describe("DossierPreview", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders dossier text from the provided draft", () => {
    render(
      <DossierPreview
        content={{
          ...dossierByLocale.pt,
          note: "Nota editada para prévia local.",
          project: "PROJETO EDITADO",
        }}
        locale="pt"
      />,
    );

    expect(screen.getByText("PROJETO EDITADO")).not.toBeNull();
    expect(screen.getByText("Nota editada para prévia local.")).not.toBeNull();
  });

  it("shows a textual fallback when an image fails to load", () => {
    render(
      <DossierPreview
        content={{
          ...dossierByLocale.pt,
          mainPhotoUrl: "/imagem-inexistente.jpg",
        }}
        locale="pt"
      />,
    );

    fireEvent.error(screen.getByAltText(/imagem principal/i));

    expect(screen.getByText("Imagem indisponível")).not.toBeNull();
  });
});
