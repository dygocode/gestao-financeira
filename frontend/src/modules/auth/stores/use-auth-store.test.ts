import { useAuthStore } from "./use-auth-store";

describe("useAuthStore", () => {
  it("mantém apenas usuário e validade da sessão em memória", () => {
    useAuthStore.getState().setSession({ user: { id: 1, email: "financeiro@empresa.com", name: "Ana" }, expiresIn: 900, csrfToken: "csrf-token-for-unit-test" });
    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.user?.email).toBe("financeiro@empresa.com");
    expect(state.expiresAt).toBeGreaterThan(Date.now());
    expect(state).not.toHaveProperty("token");
    state.clearSession();
  });
});
