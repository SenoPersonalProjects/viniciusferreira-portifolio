import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminSession } from "@/hooks/useAdminSession";

const replaceMock = vi.fn();
const signOutMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/hooks/useAdminSession", () => ({
  useAdminSession: vi.fn(),
}));

describe("AdminShell", () => {
  it("renders admin navigation and the logged user", async () => {
    vi.mocked(useAdminSession).mockReturnValue({
      accessToken: "token",
      configError: null,
      isLoading: false,
      session: { access_token: "token", user: { email: "admin@test.dev" } },
      signIn: vi.fn(),
      signOut: signOutMock,
      user: { email: "admin@test.dev" },
    } as never);

    render(
      <AdminShell>
        <p>Conteúdo protegido</p>
      </AdminShell>,
    );

    expect(screen.getByRole("navigation").textContent).toContain(
      "Visão geral",
    );
    expect(screen.getByRole("navigation").textContent).toContain("Contatos");
    expect(screen.getByRole("navigation").textContent).toContain("Stack");
    expect(screen.getByRole("navigation").textContent).toContain(
      "Calibração 3D",
    );
    expect(screen.getByText("admin@test.dev")).not.toBeNull();
    expect(screen.getByText("Conteúdo protegido")).not.toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Sair" }));

    expect(signOutMock).toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalledWith("/admin/login");
  });
});
