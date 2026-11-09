import { render, screen } from "@testing-library/react";
import { authService } from "~/modules/auth/services/auth.service";
import { useAuthStore } from "~/modules/auth/stores/use-auth-store";
import { SessionManager } from "./session-manager";

vi.mock("~/modules/auth/services/auth.service", () => ({
  authService: { session: vi.fn() },
}));

describe("SessionManager", () => {
  it("restaura a sessão pelo cookie antes de renderizar a aplicação", async () => {
    useAuthStore.setState({ user: null, status: "checking", expiresAt: null });
    vi.mocked(authService.session).mockResolvedValue({
      user: { id: 1, email: "admin@fintech.com", name: "Admin" },
      expiresIn: 900,
      csrfToken: "csrf-token-for-unit-test",
    });

    render(<SessionManager><p>Área protegida</p></SessionManager>);

    expect(screen.getByText("Validando sessão segura")).toBeInTheDocument();
    expect(await screen.findByText("Área protegida")).toBeInTheDocument();
    expect(useAuthStore.getState().status).toBe("authenticated");
  });
});
