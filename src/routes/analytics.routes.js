const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analytics.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { ROLES } = require("../config/constants");

// All analytics routes require at least analyst role
router.use(authenticate);
router.use(authorize(ROLES.ANALYST));

// GET /api/analytics/summary
router.get("/summary", analyticsController.getSummary);

// GET /api/analytics/categories
router.get("/categories", analyticsController.getCategoryTotals);

// GET /api/analytics/trends/monthly
router.get("/trends/monthly", analyticsController.getMonthlyTrends);

// GET /api/analytics/trends/weekly
router.get("/trends/weekly", analyticsController.getWeeklyTrends);

// GET /api/analytics/recent
router.get("/recent", analyticsController.getRecentActivity);

module.exports = router;
