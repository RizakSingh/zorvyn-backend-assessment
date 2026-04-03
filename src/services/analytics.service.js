const Transaction = require("../models/Transaction");
const { ROLES, TRANSACTION_TYPES } = require("../config/constants");

/**
 * AnalyticsService: all aggregation logic for dashboard APIs.
 *
 * Scope rules:
 * - Admin → sees all transactions system-wide
 * - Analyst/Viewer → sees only their own data
 *
 * All calculations are done via MongoDB aggregation pipelines,
 * never by loading raw data into memory.
 */

// Base match stage: exclude deleted records, scope by user if needed
const buildBaseMatch = (requestingUser, extraFilters = {}) => {
  const match = { isDeleted: false, ...extraFilters };
  if (requestingUser.role !== ROLES.ADMIN) {
    match.userId = requestingUser._id;
  }
  return match;
};

// ---------------------------------------------------------------------------
// Summary: total income, total expenses, net balance
// ---------------------------------------------------------------------------
const getSummary = async (requestingUser) => {
  const match = buildBaseMatch(requestingUser);

  const result = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    incomeCount: 0,
    expenseCount: 0,
  };

  result.forEach(({ _id, total, count }) => {
    if (_id === TRANSACTION_TYPES.INCOME) {
      summary.totalIncome = total;
      summary.incomeCount = count;
    } else if (_id === TRANSACTION_TYPES.EXPENSE) {
      summary.totalExpenses = total;
      summary.expenseCount = count;
    }
  });

  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  return summary;
};

// ---------------------------------------------------------------------------
// Category-wise totals
// ---------------------------------------------------------------------------
const getCategoryTotals = async (requestingUser) => {
  const match = buildBaseMatch(requestingUser);

  const result = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  // Shape into { category, type, total, count }
  return result.map(({ _id, total, count }) => ({
    category: _id.category,
    type: _id.type,
    total,
    count,
  }));
};

// ---------------------------------------------------------------------------
// Monthly trends (last 12 months)
// ---------------------------------------------------------------------------
const getMonthlyTrends = async (requestingUser) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const match = buildBaseMatch(requestingUser, { date: { $gte: twelveMonthsAgo } });

  const result = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return result.map(({ _id, total, count }) => ({
    year: _id.year,
    month: _id.month,
    type: _id.type,
    total,
    count,
  }));
};

// ---------------------------------------------------------------------------
// Weekly trends (last 8 weeks)
// ---------------------------------------------------------------------------
const getWeeklyTrends = async (requestingUser) => {
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const match = buildBaseMatch(requestingUser, { date: { $gte: eightWeeksAgo } });

  const result = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: "$date" },
          week: { $isoWeek: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
  ]);

  return result.map(({ _id, total, count }) => ({
    year: _id.year,
    week: _id.week,
    type: _id.type,
    total,
    count,
  }));
};

// ---------------------------------------------------------------------------
// Recent activity (last N transactions)
// ---------------------------------------------------------------------------
const getRecentActivity = async (requestingUser, limit = 10) => {
  const match = buildBaseMatch(requestingUser);

  return Transaction.find(match)
    .sort({ date: -1 })
    .limit(Math.min(limit, 50))
    .populate("userId", "name email")
    .lean();
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
};
