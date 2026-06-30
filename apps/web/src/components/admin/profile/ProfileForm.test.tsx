import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProfileForm } from "@/components/admin/profile/ProfileForm";
import type { AdminProfile } from "@/lib/admin/profile";

const existingProfile: AdminProfile = {
  headlineEn: "I build clear and manageable web products.",
  headlinePt: "Desenvolvo produtos web claros e gerenciáveis.",
  id: "profile-id",
  locationEn: "Brazil",
  locationPt: "Brasil",
  name: "Vinicius Ferreira",
  roleEn: "Full Stack Developer",
  rolePt: "Desenvolvedor Full Stack",
  summaryEn:
    "I am a full stack developer focused on frontend architecture and consistent APIs.",
  summaryPt:
    "Sou desenvolvedor full stack focado em arquitetura de frontend e APIs consistentes.",
};

function fillValidProfile() {
  fireEvent.change(screen.getByLabelText("Nome"), {
    target: { value: " Vinícius Ferreira " },
  });
  fireEvent.change(screen.getByLabelText("Localização PT"), {
    target: { value: " Brasil " },
  });
  fireEvent.change(screen.getByLabelText("Localização EN"), {
    target: { value: " Brazil " },
  });
  fireEvent.change(screen.getByLabelText("Cargo PT"), {
    target: { value: " Desenvolvedor Full Stack " },
  });
  fireEvent.change(screen.getByLabelText("Cargo EN"), {
    target: { value: " Full Stack Developer " },
  });
  fireEvent.change(screen.getByLabelText("Headline PT"), {
    target: { value: " Desenvolvo produtos web claros e gerenciáveis. " },
  });
  fireEvent.change(screen.getByLabelText("Headline EN"), {
    target: { value: " I build clear and manageable web products. " },
  });
  fireEvent.change(screen.getByLabelText("Resumo PT"), {
    target: {
      value:
        " Sou desenvolvedor full stack focado em arquitetura de frontend e APIs consistentes. ",
    },
  });
  fireEvent.change(screen.getByLabelText("Resumo EN"), {
    target: {
      value:
        " I am a full stack developer focused on frontend architecture and consistent APIs. ",
    },
  });
}

describe("ProfileForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders accessible profile fields", () => {
    render(<ProfileForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Nome")).not.toBeNull();
    expect(screen.getByLabelText("Localização PT")).not.toBeNull();
    expect(screen.getByLabelText("Localização EN")).not.toBeNull();
    expect(screen.getByLabelText("Cargo PT")).not.toBeNull();
    expect(screen.getByLabelText("Cargo EN")).not.toBeNull();
    expect(screen.getByLabelText("Headline PT")).not.toBeNull();
    expect(screen.getByLabelText("Headline EN")).not.toBeNull();
    expect(screen.getByLabelText("Resumo PT")).not.toBeNull();
    expect(screen.getByLabelText("Resumo EN")).not.toBeNull();
  });

  it("submits a normalized profile payload", () => {
    const onSubmit = vi.fn();

    render(<ProfileForm onSubmit={onSubmit} />);
    fillValidProfile();
    fireEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));

    expect(onSubmit).toHaveBeenCalledWith({
      headlineEn: "I build clear and manageable web products.",
      headlinePt: "Desenvolvo produtos web claros e gerenciáveis.",
      locationEn: "Brazil",
      locationPt: "Brasil",
      name: "Vinícius Ferreira",
      roleEn: "Full Stack Developer",
      rolePt: "Desenvolvedor Full Stack",
      summaryEn:
        "I am a full stack developer focused on frontend architecture and consistent APIs.",
      summaryPt:
        "Sou desenvolvedor full stack focado em arquitetura de frontend e APIs consistentes.",
    });
  });

  it("shows validation errors without clearing input", () => {
    const onSubmit = vi.fn();

    render(<ProfileForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Vinicius" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("Revise");
    expect((screen.getByLabelText("Nome") as HTMLInputElement).value).toBe(
      "Vinicius",
    );
  });

  it("fills fields when editing an existing profile", () => {
    render(<ProfileForm initialValue={existingProfile} onSubmit={vi.fn()} />);

    expect((screen.getByLabelText("Nome") as HTMLInputElement).value).toBe(
      "Vinicius Ferreira",
    );
    expect((screen.getByLabelText("Cargo PT") as HTMLInputElement).value).toBe(
      "Desenvolvedor Full Stack",
    );
    expect((screen.getByLabelText("Headline EN") as HTMLTextAreaElement).value).toBe(
      "I build clear and manageable web products.",
    );
    expect((screen.getByLabelText("Resumo PT") as HTMLTextAreaElement).value).toBe(
      "Sou desenvolvedor full stack focado em arquitetura de frontend e APIs consistentes.",
    );
  });

  it("disables the submit button while submitting", () => {
    render(<ProfileForm isSubmitting onSubmit={vi.fn()} />);

    expect(
      (screen.getByRole("button", { name: "Salvando..." }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
