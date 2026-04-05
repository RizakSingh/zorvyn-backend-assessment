const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analytics.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { ROLES } = require("../config/constants");

// All analytics routes require at least analyst role
router.use(authenticate);
router.use(authorize(ROLES.ANALYST));

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get financial summary (income, expenses, balance)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary data
 */
router.get("/summary", analyticsController.getSummary);

/**
 * @swagger
 * /api/analytics/categories:
 *   get:
 *     summary: Get totals grouped by category
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category-wise totals
 */
router.get("/categories", analyticsController.getCategoryTotals);

/**
 * @swagger
 * /api/analytics/trends/monthly:
 *   get:
 *     summary: Get monthly trends (last 12 months)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trends
 */
router.get("/trends/monthly", analyticsController.getMonthlyTrends);

/**
 * @swagger
 * /api/analytics/trends/weekly:
 *   get:
 *     summary: Get weekly trends (last 8 weeks)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly trends
 */
router.get("/trends/weekly", analyticsController.getWeeklyTrends);

/**
 * @swagger
 * /api/analytics/recent:
 *   get:
 *     summary: Get recent transactions
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity
 */
router.get("/recent", analyticsController.getRecentActivity);

module.exports = router;