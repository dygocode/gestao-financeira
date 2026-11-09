export interface DashboardSummary {
  balance: string; totalIncome: string; totalExpenses: string;
  topExpenseCategories: Array<{ categoryId: number; categoryName: string; total: string }>;
}
