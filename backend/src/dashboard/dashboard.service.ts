import { Inject, Injectable } from '@nestjs/common';
import type { PrismaDb } from '../prisma/db.js';
import { PRISMA_DB } from '../prisma/prisma.constants.js';

interface ExpenseCategorySummary {
  categoryId: number;
  categoryName: string;
  total: bigint;
}

@Injectable()
export class DashboardService {
  constructor(@Inject(PRISMA_DB) private readonly prisma: PrismaDb) {}

  async getSummary(userId: number) {
    const transactions = await this.prisma.orm.public.Transaction.where({
      userId,
    })
      .select('amount', 'type', 'categoryId')
      .include('category', (category) => category.select('name'))
      .all();

    let totalIncome = 0n;
    let totalExpenses = 0n;
    const expensesByCategory = new Map<number, ExpenseCategorySummary>();

    for (const transaction of transactions) {
      const amount = this.decimalToCents(transaction.amount);

      if (transaction.type === 'INCOME') {
        totalIncome += amount;
        continue;
      }

      totalExpenses += amount;
      const current = expensesByCategory.get(transaction.categoryId);
      expensesByCategory.set(transaction.categoryId, {
        categoryId: transaction.categoryId,
        categoryName:
          transaction.category?.name ?? 'Categoria não identificada',
        total: (current?.total ?? 0n) + amount,
      });
    }

    const topExpenseCategories = [...expensesByCategory.values()]
      .sort(
        (left, right) =>
          this.compareAmountsDescending(left.total, right.total) ||
          left.categoryName.localeCompare(right.categoryName, 'pt-BR'),
      )
      .slice(0, 3)
      .map(({ categoryId, categoryName, total }) => ({
        categoryId,
        categoryName,
        total: this.centsToDecimal(total),
      }));

    return {
      balance: this.centsToDecimal(totalIncome - totalExpenses),
      totalIncome: this.centsToDecimal(totalIncome),
      totalExpenses: this.centsToDecimal(totalExpenses),
      topExpenseCategories,
    };
  }

  private decimalToCents(value: string) {
    const [whole, fraction = ''] = value.split('.');
    const normalizedFraction = fraction.padEnd(2, '0').slice(0, 2);
    return BigInt(whole) * 100n + BigInt(normalizedFraction);
  }

  private centsToDecimal(value: bigint) {
    const sign = value < 0n ? '-' : '';
    const absoluteValue = value < 0n ? -value : value;
    const whole = absoluteValue / 100n;
    const fraction = (absoluteValue % 100n).toString().padStart(2, '0');
    return `${sign}${whole}.${fraction}`;
  }

  private compareAmountsDescending(left: bigint, right: bigint) {
    if (left === right) return 0;
    return left > right ? -1 : 1;
  }
}
