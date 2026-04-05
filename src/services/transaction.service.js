const Transaction = require("../models/Transaction");
const AppError = require("../utils/AppError");
const { ROLES } = require("../config/constants");

/**
 * TransactionService: all business logic for financial records.
 *
 * Policy rules enforced here (service layer):
 * - Admins can see/modify ALL transactions
 * - Analysts and Viewers can only see their OWN transactions
 * - Only the owner (or admin) can update/delete a transaction
 */

// Helpers
const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Build a MongoDB filter object from query params.
 * Admins see everything; others are scoped to their userId.
 */
const buildFilter = (query, requestingUser) => {
  const filter = { isDeleted: false };

  // Scope non-admins to their own data
  if (requestingUser.role !== ROLES.ADMIN) {
    filter.userId = requestingUser._id;
  }

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = new RegExp(query.category, "i");

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  // Search in category or notes
 if (query.search) {
  const safeSearch = escapeRegex(query.search);
  filter.$or = [
    { category: new RegExp(safeSearch, "i") },
    { notes: new RegExp(safeSearch, "i") },
  ];
}

  return filter;
};

// ---------------------------------------------------------------------------
// CRUD Operations
// ---------------------------------------------------------------------------

const createTransaction = async (data, requestingUser) => {
  const transaction = await Transaction.create({
    ...data,
    userId: requestingUser._id,
  });
  return transaction;
};

const getTransactions = async (query, requestingUser) => {
const page = parseInt(query.page) || 1;
const limit = Math.min(parseInt(query.limit) || 20, 100); // cap at 100
  const skip = (page - 1) * limit;

  const filter = buildFilter(query, requestingUser);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email"),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getTransactionById = async (id, requestingUser) => {
  const transaction = await Transaction.findOne({
    _id: id,
    isDeleted: false,
  }).populate("userId", "name email");

  if (!transaction) {
    throw new AppError("Transaction not found.", 404);
  }

  // Ownership check: non-admins can only read their own
  if (
    requestingUser.role !== ROLES.ADMIN &&
    transaction.userId._id.toString() !== requestingUser._id.toString()
  ) {
    throw new AppError("You do not have permission to access this transaction.", 403);
  }

  return transaction;
};

const updateTransaction = async (id, data, requestingUser) => {
  const transaction = await Transaction.findOne({ _id: id, isDeleted: false });

  if (!transaction) {
    throw new AppError("Transaction not found.", 404);
  }

  // Only owner or admin can update
  if (
    requestingUser.role !== ROLES.ADMIN &&
    transaction.userId.toString() !== requestingUser._id.toString()
  ) {
    throw new AppError("You can only update your own transactions.", 403);
  }

  const allowedFields = ["amount", "type", "category", "date", "notes"];

allowedFields.forEach((field) => {
  if (data[field] !== undefined) {
    transaction[field] = data[field];
  }
});
  await transaction.save();

  return transaction;
};

const deleteTransaction = async (id, requestingUser) => {
  const transaction = await Transaction.findOne({ _id: id, isDeleted: false });

  if (!transaction) {
    throw new AppError("Transaction not found.", 404);
  }

  // Only owner or admin can delete
  if (
    requestingUser.role !== ROLES.ADMIN &&
    transaction.userId.toString() !== requestingUser._id.toString()
  ) {
    throw new AppError("You can only delete your own transactions.", 403);
  }

  // Soft delete
  transaction.isDeleted = true;
  await transaction.save();
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
