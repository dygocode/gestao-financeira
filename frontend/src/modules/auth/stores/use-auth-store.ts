import { create } from "zustand";
import type { AuthSession, AuthUser } from "../types/auth";
import { setCsrfToken } from "~/shared/lib/http/api-client";

interface AuthState {
  user: AuthUser | null;
  status: "checking" | "authenticated" | "anonymous";
  expiresAt: number | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, status: "checking", expiresAt: null,
  setSession: ({ user, expiresIn, csrfToken }) => {
    setCsrfToken(csrfToken);
    set({ user, status: "authenticated", expiresAt: Date.now() + expiresIn * 1000 });
  },
  clearSession: () => {
    setCsrfToken(null);
    set({ user: null, status: "anonymous", expiresAt: null });
  },
}));
