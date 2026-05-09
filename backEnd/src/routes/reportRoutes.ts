/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Financial reports and analytics
 *
 * /reports/generate:
 *   get:
 *     tags: [Reports]
 *     summary: Generate a financial report
 *     description: Returns a custom financial report based on filters (income, expenses, categories, patterns, etc.)
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                 totalExpenses:
 *                   type: number
 *                 expenseByCategory:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                 spendingPattern:
 *                   type: object
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */

import express from 'express';
import { reportController } from '../controllers/reportController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

// Route to generate a custom report
router.get('/generate', verifyToken, reportController.generateReport);

export default router;