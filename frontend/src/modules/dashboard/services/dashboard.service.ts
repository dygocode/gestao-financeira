import { apiFetch } from "~/shared/lib/http/api-client"; import type { DashboardSummary } from "../types/dashboard";
export const dashboardService = { getSummary: (signal?: AbortSignal) => apiFetch<DashboardSummary>("/dashboard/summary", { signal }) };
