import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminDossierPreviewPage } from "@/components/admin/dossier/AdminDossierPreviewPage";
import { dossierByLocale } from "@/data/dossier";
import { adminApiFetch } from "@/lib/admin/adminApi";
import type { PersistedDossierContent } from "@/lib/admin/dossier";

vi.mock("@/hooks/useAdminSession", () => ({
  useAdminSession: () => ({
    accessToken: "admin-token",
  }),
}));

vi.mock("@/lib/admin/adminApi", () => ({
  AdminApiError: class AdminApiError extends Error {
    code = "http";
  },
  adminApiFetch: vi.fn(),
}));

const persistedEn: PersistedDossierContent = {
  ...dossierByLocale.en,
  createdAt: "2026-06-29T00:00:00.000Z",
  id: "dossier-en",
  locale: "en",
  stack: ["NEXT.JS", "NESTJS"],
  updatedAt: "2026-06-29T00:00:00.000Z",
};

function mockDossierApi(items: PersistedDossierContent[] = []) {
  vi.mocked(adminApiFetch).mockImplementation(async (path, options) => {
    if (path === "/admin/dossier") {
      return { items };
    }

    if (path === "/admin/dossier/pt" && options?.method === "PUT") {
      return {
        ...dossierByLocale.pt,
        createdAt: "2026-06-29T00:00:00.000Z",
        id: "dossier-pt",
        locale: "pt",
        stack: ["NEXT.JS", "NESTJS", "TYPESCRIPT"],
        updatedAt: "2026-06-29T00:00:00.000Z",
      };
    }

    throw new Error(`Unexpected admin api call: ${path}`);
  });
}

describe("AdminDossierPreviewPage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders accessible dossier fields and fallback origin", async () => {
    mockDossierApi();

    render(<AdminDossierPreviewPage />);

    await screen.findByText("Conteudo do dossie carregado.");

    expect(screen.getByLabelText("Locale")).not.toBeNull();
    expect(screen.getByLabelText("Arquivo")).not.toBeNull();
    expect(screen.getByLabelText("Classificacao")).not.toBeNull();
    expect(screen.getByLabelText("Projeto")).not.toBeNull();
    expect(screen.getByLabelText("Assunto")).not.toBeNull();
    expect(screen.getByLabelText("Note")).not.toBeNull();
    expect(screen.getByLabelText("Imagem principal")).not.toBeNull();
    expect(screen.getByLabelText("Imagem polaroid")).not.toBeNull();
    expect(screen.getAllByText("Fallback local").length).toBeGreaterThan(0);
  });

  it("shows database origin when the API returns persisted content", async () => {
    mockDossierApi([persistedEn]);

    render(<AdminDossierPreviewPage />);

    await screen.findByText("Conteudo do dossie carregado.");

    fireEvent.change(screen.getByLabelText("Locale"), {
      target: { value: "en" },
    });

    expect((screen.getByLabelText("Projeto") as HTMLInputElement).value).toBe(
      "MANAGEABLE PORTFOLIO",
    );
    expect((screen.getByLabelText("Stack") as HTMLInputElement).value).toBe(
      "NEXT.JS / NESTJS",
    );
    expect(screen.getAllByText("Banco").length).toBeGreaterThan(0);
  });

  it("applies normalized edits to the preview", async () => {
    mockDossierApi();

    render(<AdminDossierPreviewPage />);

    await screen.findByText("Conteudo do dossie carregado.");

    fireEvent.change(screen.getByLabelText("Projeto"), {
      target: { value: " PROJETO DE TESTE " },
    });
    fireEvent.change(screen.getByLabelText("Note"), {
      target: { value: " Nota com Acentos e Casing Preservado. " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar previa" }));

    expect(screen.getByText("PROJETO DE TESTE")).not.toBeNull();
    expect(
      screen.getAllByText("Nota com Acentos e Casing Preservado.").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("Previa atualizada localmente. Nada foi salvo ainda."),
    ).not.toBeNull();
  });

  it("saves the current locale with a normalized payload", async () => {
    mockDossierApi();

    render(<AdminDossierPreviewPage />);

    await screen.findByText("Conteudo do dossie carregado.");

    fireEvent.click(screen.getByRole("button", { name: "Salvar no banco" }));

    await waitFor(() => {
      expect(adminApiFetch).toHaveBeenCalledWith(
        "/admin/dossier/pt",
        expect.objectContaining({
          body: expect.stringContaining('"stack":["NEXT.JS","NESTJS","TYPESCRIPT"]'),
          method: "PUT",
        }),
        "admin-token",
      );
    });
    expect(screen.getByText("Dossie salvo no banco administrativo.")).not.toBeNull();
  });

  it("shows validation errors without clearing user input", async () => {
    mockDossierApi();

    render(<AdminDossierPreviewPage />);

    await screen.findByText("Conteudo do dossie carregado.");

    fireEvent.change(screen.getByLabelText("Imagem principal"), {
      target: { value: "profile/detective/individual-1.jpeg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar no banco" }));

    expect(screen.getByRole("alert").textContent).toContain("Revise");
    expect(
      (screen.getByLabelText("Imagem principal") as HTMLInputElement).value,
    ).toBe("profile/detective/individual-1.jpeg");
  });

  it("keeps user input when the API save fails", async () => {
    vi.mocked(adminApiFetch).mockImplementation(async (path, options) => {
      if (path === "/admin/dossier") {
        return { items: [] };
      }

      if (path === "/admin/dossier/pt" && options?.method === "PUT") {
        throw new Error("offline");
      }

      throw new Error(`Unexpected admin api call: ${path}`);
    });

    render(<AdminDossierPreviewPage />);

    await screen.findByText("Conteudo do dossie carregado.");

    fireEvent.change(screen.getByLabelText("Projeto"), {
      target: { value: "PROJETO SEM API" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar no banco" }));

    await screen.findByText("Nao foi possivel concluir a operacao do dossie.");
    expect((screen.getByLabelText("Projeto") as HTMLInputElement).value).toBe(
      "PROJETO SEM API",
    );
  });
});
