import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

describe("AdminLoginForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders accessible email and password fields", () => {
    render(<AdminLoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Email autorizado")).not.toBeNull();
    expect(screen.getByLabelText("Senha")).not.toBeNull();
    expect(
      (screen.getByRole("button", {
        name: "Entrar no painel",
      }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  it("submits the provided credentials", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<AdminLoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email autorizado"), "admin@test.dev");
    await user.type(screen.getByLabelText("Senha"), "senha-segura");
    await user.click(screen.getByRole("button", { name: "Entrar no painel" }));

    expect(onSubmit).toHaveBeenCalledWith("admin@test.dev", "senha-segura");
  });

  it("shows login errors without disabling submit", () => {
    render(
      <AdminLoginForm
        errorMessage="Não foi possível entrar."
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Não foi possível entrar.",
    );
    expect(
      (screen.getByRole("button", {
        name: "Entrar no painel",
      }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  it("disables submit while credentials are being verified", () => {
    render(<AdminLoginForm isSubmitting onSubmit={vi.fn()} />);

    expect(
      (screen.getByRole("button", {
        name: "Verificando...",
      }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
