import { useEffect, useState } from "react";
import { transactionService } from "../services/transaction.service";
import { useTransactionFiltersStore } from "../stores/use-transaction-filters-store";
import type { TransactionFilters, TransactionPage } from "../types/transaction";

export function useTransactions() {
  const { filterType, categoryId, startDate, endDate, page, limit } = useTransactionFiltersStore();
  const [data, setData] = useState<TransactionPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const filters: TransactionFilters = { filterType, categoryId, startDate, endDate, page, limit };
    transactionService.list(filters, controller.signal).then((result) => { setData(result); setError(null); }).catch((error) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setError(error instanceof Error ? error.message : "Falha ao carregar transações.");
    }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [filterType, categoryId, startDate, endDate, page, limit, version]);
  return { data, loading, error, reload: () => { setLoading(true); setVersion((value) => value + 1); } };
}
