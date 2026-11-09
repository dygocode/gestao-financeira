import { apiFetch } from "~/shared/lib/http/api-client";
import type { AuthSession, LoginInput, RegisterInput } from "../types/auth";

export const authService = {
  login: (input: LoginInput, signal?: AbortSignal) => apiFetch<AuthSession>("/auth/login", { method: "POST", body: JSON.stringify(input), signal }),
  register: (input: RegisterInput, signal?: AbortSignal) => apiFetch<AuthSession>("/auth/register", { method: "POST", body: JSON.stringify(input), signal }),
  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),
};
