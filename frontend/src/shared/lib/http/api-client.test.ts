import { apiFetch, isAbortError } from "./api-client";

describe("apiFetch", () => {
  it("envia cookies e trata respostas 204", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiFetch<void>("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/auth/logout"), expect.objectContaining({ credentials: "include" }));
  });

  it("normaliza mensagens de erro da API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ message: ["E-mail inválido", "Senha obrigatória"] }), { status: 400, headers: { "Content-Type": "application/json" } }));
    await expect(apiFetch("/auth/login")).rejects.toEqual(expect.objectContaining({ status: 400, message: "E-mail inválido. Senha obrigatória" }));
  });

  it("reconhece cancelamento pelo signal em diferentes runtimes", () => {
    const controller = new AbortController();
    controller.abort();

    expect(
      isAbortError(
        new TypeError("signal is aborted without reason"),
        controller.signal,
      ),
    ).toBe(true);
    expect(isAbortError({ name: "AbortError" })).toBe(true);
  });

  it("não converte cancelamento em erro de rede", async () => {
    const controller = new AbortController();
    const abortError = new TypeError("signal is aborted without reason");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(abortError);
    controller.abort();

    await expect(
      apiFetch("/categories", { signal: controller.signal }),
    ).rejects.toBe(abortError);
  });
});
