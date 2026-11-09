import { transactionService } from "./transaction.service";
import type { Transaction } from "../types/transaction";

const transactions: Transaction[] = [
  { id: 1, name: "Salário", description: null, amount: "5000.00", categoryId: 1, date: "2026-11-05T12:00:00.000Z", type: "INCOME", userId: 1, createdAt: "", updatedAt: "", category: { id: 1, name: "Receitas" } },
  { id: 2, name: "Servidor", description: null, amount: "300.00", categoryId: 2, date: "2026-11-08T12:00:00.000Z", type: "EXPENSE", userId: 1, createdAt: "", updatedAt: "", category: { id: 2, name: "Infraestrutura" } },
];
describe("transactionService.list", () => {
  it("envia filtros na URL e adapta a resposta legada do backend", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(transactions), { status: 200, headers: { "Content-Type": "application/json" } }));
    const result = await transactionService.list({ filterType: "EXPENSE", categoryId: "2", startDate: "2026-11-01", endDate: "2026-11-30", page: 1, limit: 10 });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("filterType=EXPENSE");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Servidor");
    expect(result.total).toBe(1);
  });
});
