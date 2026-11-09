import { useCallback, useEffect, useState } from "react";
import { isAbortError } from "~/shared/lib/http/api-client";
import { categoryService } from "../services/category.service";
import type { Category } from "../types/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => {
    setLoading(true);
    setVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    categoryService
      .list(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setCategories(data);
        setError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error, controller.signal)) return;
        setError(
          error instanceof Error
            ? error.message
            : "Falha ao carregar categorias.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [version]);

  return { categories, loading, error, reload };
}
