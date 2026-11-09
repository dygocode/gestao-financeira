import type { ApiErrorPayload } from "~/shared/types/api";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly details: unknown,
  ) {
    const payload = details as ApiErrorPayload | undefined;
    const rawMessage = payload?.message;
    const message = Array.isArray(rawMessage) ? rawMessage.join(". ") : rawMessage;
    super(message || `Falha na requisição (${status})`);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, { message: "Não foi possível conectar à API." });
  }

  const contentType = response.headers.get("content-type") ?? "";
  const hasJson = contentType.includes("application/json");
  let data: unknown;
  try {
    data = response.status === 204 ? undefined : hasJson ? await response.json() : await response.text();
  } catch {
    throw new ApiError(response.status, { message: "A API retornou uma resposta inválida." });
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("finance:session-expired"));
    }
    throw new ApiError(response.status, data);
  }
  return data as T;
}
