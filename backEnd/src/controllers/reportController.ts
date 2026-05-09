import { Request, Response } from "express";
import ReportService from "../services/reportService";
import { TransactionFilters } from "../models/Transaction";

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, pattern } = req.query;
    
    const filters: TransactionFilters = {
      ...(startDate ? { startDate: String(startDate) } : {}),
      ...(endDate ? { endDate: String(endDate) } : {}),
    }
    const report = await ReportService.getReport(
      (req as any).user.id,
      filters,
      (pattern as "day" | "week" | "month") || "week"
    );

    res.status(200).json({ data: report });

  } catch (err: any) {
    console.log(err.message);
    res.status(400).json({ error: err.message });
  }
};

export const reportController = {
  generateReport,
};