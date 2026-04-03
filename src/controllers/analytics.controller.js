const analyticsService = require("../services/analytics.service");
const { sendSuccess } = require("../utils/response");

const getSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getSummary(req.user);
    sendSuccess(res, 200, "Summary retrieved.", { summary });
  } catch (error) {
    next(error);
  }
};

const getCategoryTotals = async (req, res, next) => {
  try {
    const categories = await analyticsService.getCategoryTotals(req.user);
    sendSuccess(res, 200, "Category totals retrieved.", { categories });
  } catch (error) {
    next(error);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await analyticsService.getMonthlyTrends(req.user);
    sendSuccess(res, 200, "Monthly trends retrieved.", { trends });
  } catch (error) {
    next(error);
  }
};

const getWeeklyTrends = async (req, res, next) => {
  try {
    const trends = await analyticsService.getWeeklyTrends(req.user);
    sendSuccess(res, 200, "Weekly trends retrieved.", { trends });
  } catch (error) {
    next(error);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activity = await analyticsService.getRecentActivity(req.user, limit);
    sendSuccess(res, 200, "Recent activity retrieved.", { activity });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
};
