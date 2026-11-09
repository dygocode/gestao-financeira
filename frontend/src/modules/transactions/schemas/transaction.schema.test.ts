import { transactionSchema } from "./transaction.schema";

const valid = { name: "Serviço de nuvem", description: "Infraestrutura", amount: "149.90", categoryId: 2, date: "2026-11-09", type: "EXPENSE" };
describe("transactionSchema", () => {
  it("aceita uma transação financeira válida", () => expect(transactionSchema.safeParse(valid).success).toBe(true));
  it.each(["0", "-10", "10.999"])("rejeita o valor monetário inválido %s", (amount) => expect(transactionSchema.safeParse({ ...valid, amount }).success).toBe(false));
  it("exige categoria, data e tipo", () => expect(transactionSchema.safeParse({ name: "Incompleta", amount: "20" }).success).toBe(false));
});
