import mongoose from "mongoose";
import { SpendingPattern, Report, ExpenseByCategory } from "../models/Reports.dto";
import Transaction, { TransactionFilters } from "../models/Transaction";
import FinancialGoalModel from "../models/financialGoalModel";

class ReportService {
  static async getReport(
    userId: string,
    filters: TransactionFilters,
    groupBy: "day" | "week" | "month" = "week",
  ): Promise<any> {
    const [totalIncome, totalExpenses, totalGoalSavings, expenseByCategory, incomeByCategory, spendingPattern, transactions] =
      await Promise.all([
        this.totalIncome(userId, filters),
        this.totalExpenses(userId, filters),
        this.totalGoalSavings(userId),
        this.expenseByCategory(userId, filters),
        this.incomeByCategory(userId, filters),
        this.spendingPattern(userId, filters, groupBy),
        Transaction.fetchTransactions(userId, filters)
      ]);

    return {
      summary: {
        totalIncome,
        totalExpenses,
        totalGoalSavings,
        netBalance: totalIncome - totalExpenses - totalGoalSavings,
      },
      spendingByCategory: expenseByCategory.map((c) => ({
        category: c.categoryName,
        total: c.totalAmount,
      })),
      incomeByCategory: incomeByCategory.map((c) => ({
        category: c.categoryName,
        total: c.totalAmount,
      })),
      spendingPattern,
      transactions: transactions.map(t => ({
        id: t._id,
        amount: t.amount,
        type: t.type,
        date: t.date,
        description: t.description,
        category: (t as any).category
      }))
    };
  }

  static async spendingPattern(
    userId: string,
    filters: TransactionFilters = {},
    groupBy: "day" | "week" | "month" = "day",
  ): Promise<SpendingPattern[]> {
    const isValidDate = (d: any) => d && d !== 'undefined' && d !== 'null';
    const dateFilter =
      isValidDate(filters.startDate) || isValidDate(filters.endDate)
        ? {
            date: {
              ...(isValidDate(filters.startDate) && { $gte: new Date(filters.startDate as string) }),
              ...(isValidDate(filters.endDate) && { $lte: new Date(filters.endDate as string) }),
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
    } else if (groupBy === "week") {
      groupStage = {
        year: { $year: "$date" },
        week: { $isoWeek: "$date" },
      };
    } else if (groupBy === "month") {
      groupStage = {
        year: { $year: "$date" },
        month: { $month: "$date" },
      };
    }

    const pattern: SpendingPattern[] = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "Expense",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: groupStage,
          totalSpent: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          period: "$_id",
          totalSpent: 1,
        },
      },
    ]);

    return pattern;
  }

  static async totalIncome(userId: string, filters: TransactionFilters): Promise<number> {
    const isValidDate = (d: any) => d && d !== 'undefined' && d !== 'null';
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "Income",
          ...(isValidDate(filters.startDate) || isValidDate(filters.endDate)
            ? {
                date: {
                  ...(isValidDate(filters.startDate) ? { $gte: new Date(filters.startDate as string) } : {}),
                  ...(isValidDate(filters.endDate) ? { $lte: new Date(filters.endDate as string) } : {}),
                },
              }
            : {}),
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$amount" },
        },
      },
    ]);
    return result[0]?.totalIncome || 0;
  }

  static async totalExpenses(userId: string, filters: TransactionFilters): Promise<number> {
    const isValidDate = (d: any) => d && d !== 'undefined' && d !== 'null';
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "Expense",
          ...(isValidDate(filters.startDate) || isValidDate(filters.endDate)
            ? {
                date: {
                  ...(isValidDate(filters.startDate) ? { $gte: new Date(filters.startDate as string) } : {}),
                  ...(isValidDate(filters.endDate) ? { $lte: new Date(filters.endDate as string) } : {}),
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

  static async totalGoalSavings(userId: string): Promise<number> {
    const result = await FinancialGoalModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalGoalSavings: { $sum: { $ifNull: ["$currentAmount", 0] } },
        },
      },
    ]);

    return result[0]?.totalGoalSavings || 0;
  }

  static async expenseByCategory(
    userId: string,
    filters: TransactionFilters = {},
  ): Promise<ExpenseByCategory[]> {
    const isValidDate = (d: any) => d && d !== 'undefined' && d !== 'null';
    const dateFilter =
      isValidDate(filters.startDate) || isValidDate(filters.endDate)
        ? {
            date: {
              ...(isValidDate(filters.startDate) && { $gte: new Date(filters.startDate as string) }),
              ...(isValidDate(filters.endDate) && { $lte: new Date(filters.endDate as string) }),
            },
          }
        : {};

    const result: ExpenseByCategory[] = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "Expense",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 0,
          categoryName: "$category.name",
          totalAmount: 1,
        },
      },
    ]);

    return result;
  }

  static async incomeByCategory(
    userId: string,
    filters: TransactionFilters = {},
  ): Promise<ExpenseByCategory[]> {
    const isValidDate = (d: any) => d && d !== 'undefined' && d !== 'null';
    const dateFilter =
      isValidDate(filters.startDate) || isValidDate(filters.endDate)
        ? {
            date: {
              ...(isValidDate(filters.startDate) && { $gte: new Date(filters.startDate as string) }),
              ...(isValidDate(filters.endDate) && { $lte: new Date(filters.endDate as string) }),
            },
          }
        : {};

    const result: ExpenseByCategory[] = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "Income",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          categoryName: { $ifNull: ["$category.name", "General Income"] },
          totalAmount: 1,
        },
      },
    ]);

    return result;
  }
}

export default ReportService;
