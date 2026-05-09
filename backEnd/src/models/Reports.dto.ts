export interface SpendingPattern {
  period: {
    year: number;
    month?: number;
    day?: number;
  };
  totalSpent: number;
}

export interface Report {
  userId: string;
  totalIncome: number;
  totalExpenses: number;
  expenseByCategory: ExpenseByCategory[];
  categoryChart: CategoryChart;
  spendingPattern: SpendingPattern[];
}

export interface ExpenseByCategory {
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

export interface CategoryChart {
  labels: string[];
  values: number[];
}