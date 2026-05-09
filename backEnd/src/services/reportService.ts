import mongoose from "mongoose";
import {
  SpendingPattern,
  Report,
  ExpenseByCategory,
} from "../models/Reports.dto";
import Transaction, { TransactionFilters } from "../models/Transaction";

class ReportService {
  static async getReport(
    userId: string,
    filters: TransactionFilters,
    groupBy: "day" | "week" | "month" = "week",
  ): Promise<Report> {
    try {
      const [totalIncome, totalExpenses, expenseByCategory, spendingPattern] =
        await Promise.all([
          this.totalIncome({ filters, userId } as {
            filters: TransactionFilters;
            userId: string;
          }),
          this.totalExpenses({ filters, userId } as {
            filters: TransactionFilters;
            userId: string;
          }),
          this.expenseByCategory({ filters, userId } as {
            filters: TransactionFilters;
            userId: string;
          }),
          this.spendingPattern(
            { filters, userId } as {
              filters: TransactionFilters;
              userId: string;
            },
            groupBy,
          ),
        ]);
      const result: Report = {
        userId: userId,
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        expenseByCategory: expenseByCategory.map((c) => {
          const total = totalExpenses || 1; // avoid division by zero
          return {
            categoryName: c.categoryName,
            totalAmount: c.totalAmount,
            percentage: (c.totalAmount / total) * 100,
          };
        }),
        categoryChart: {
          labels: expenseByCategory.map((c) => c.categoryName),
          values: expenseByCategory.map((c) => c.totalAmount),
        },
        spendingPattern: spendingPattern,
      };
      return result;
    } catch (error) {
      console.error("Error generating report:", error);
      throw new Error("Failed to generate report");
    }
    return {} as Report;
  }
  // spending patterns
  static async spendingPattern(
    { filters, userId }: { filters: TransactionFilters; userId: string },
    groupBy: "day" | "week" | "month" = "week",
  ): Promise<SpendingPattern[]> {
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    const dateFilter =
      filters.startDate || filters.endDate
        ? {
            date: {
              ...(filters.startDate && {
                $gte: new Date(filters.startDate),
              }),

              ...(endDate && {
                $lte: endDate,
              }),
            },
          }
        : {};

    let groupStage: any = {};

    if (groupBy === "day") {
      groupStage = {
        year: { $year: "$date" },
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" },
      };
    }

    if (groupBy === "week") {
      groupStage = {
        year: { $year: "$date" },
        week: { $isoWeek: "$date" },
      };
    }

    if (groupBy === "month") {
      groupStage = {
        year: { $year: "$date" },
        month: { $month: "$date" },
      };
    }

    const pattern: SpendingPattern[] = await Transaction.aggregate([
      {
        $match: {
          type: "Expense",
          userId: new mongoose.Types.ObjectId(userId),
          ...dateFilter,
        },
      },
      {
        // group by the specified pattern and sum amounts
        $group: {
          _id: groupStage,
          totalSpent: { $sum: "$amount" },
        },
      },
      {
        // sort by date ascending
        $sort: { _id: 1 },
      },
      {
        // project the output to have a readable period format
        $project: {
          _id: 0,
          period: "$_id",
          totalSpent: 1,
        },
      },
    ]);

    return pattern;
  }
  // Calculate total income for a user with optional date filters
  static async totalIncome({
    filters,
    userId,
  }: {
    filters: TransactionFilters;
    userId: string;
  }): Promise<number> {
    const matchFilter = {
      type: "Income",
      userId: new mongoose.Types.ObjectId(userId),

      ...(filters.startDate || filters.endDate
        ? {
            date: {
              ...(filters.startDate
                ? { $gte: new Date(filters.startDate) }
                : {}),

              ...(filters.endDate
                ? {
                    $lte: (() => {
                      const end = new Date(filters.endDate);
                      end.setHours(23, 59, 59, 999);
                      return end;
                    })(),
                  }
                : {}),
            },
          }
        : {}),
    };
    const result = await Transaction.aggregate([
      {
        $match: matchFilter,
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$amount" },
        },
      },
    ]);
    // return total income or 0 if no income transactions found
    return result[0]?.totalIncome || 0;
  }

  // Calculate total expenses for a user with optional date filters
  static async totalExpenses({
    filters,
    userId,
  }: {
    filters: TransactionFilters;
    userId: string;
  }): Promise<number> {
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }
    const result = await Transaction.aggregate([
      {
        $match: {
          type: "Expense",

          userId: new mongoose.Types.ObjectId(userId),

          ...(filters.startDate || filters.endDate
            ? {
                date: {
                  ...(filters.startDate
                    ? { $gte: new Date(filters.startDate) }
                    : {}),

                  ...(endDate ? { $lte: endDate } : {}),
                },
              }
            : {}),
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
        },
      },
    ]);

    return result[0]?.totalExpenses || 0;
  }

  // Get expense breakdown by category for a user with optional date filters
  static async expenseByCategory({
    filters,
    userId,
  }: {
    filters: TransactionFilters;
    userId: string;
  }): Promise<ExpenseByCategory[]> {
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }
    const dateFilter =
      filters.startDate || filters.endDate
        ? {
            date: {
              ...(filters.startDate && {
                $gte: new Date(filters.startDate),
              }),

              ...(endDate && {
                $lte: endDate,
              }),
            },
          }
        : {};

    const result: ExpenseByCategory[] = await Transaction.aggregate([
      {
        // condition to match only expenses for the user and apply date filters if provided
        $match: {
          type: "Expense",
          userId: new mongoose.Types.ObjectId(userId),
          ...dateFilter,
        },
      },
      {
        // group by category and sum amounts
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        // join with categories collection to get category names
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        // flatten the category array to get category details
        $unwind: "$category",
      },
      {
        // project the final output with category name and total amount
        $project: {
          _id: 0,
          categoryName: "$category.name",
          totalAmount: 1,
        },
      },
    ]);

    return result;
  }
}

export default ReportService;
