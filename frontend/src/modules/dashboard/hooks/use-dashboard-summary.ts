import { useEffect, useState } from "react";
import { isAbortError } from "~/shared/lib/http/api-client";
import { dashboardService } from "../services/dashboard.service";
import type { DashboardSummary } from "../types/dashboard";

export function useDashboardSummary() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    dashboardService
      .getSummary(controller.signal)
      .then((summary) => {
        if (controller.signal.aborted) return;
        setData(summary);
        setError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error, controller.signal)) return;
        setError(
          error instanceof Error
            ? error.message
            : "Falha ao carregar indicadores.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [version]);

  return {
    data,
    loading,
    error,
    retry: () => {
      setLoading(true);
      setVersion((value) => value + 1);
    },
  };
}
