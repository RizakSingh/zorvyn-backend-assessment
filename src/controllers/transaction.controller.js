const transactionService = require("../services/transaction.service");
const { sendSuccess } = require("../utils/response");

/**
 * TransactionController: thin — passes req data to service, sends response.
 */

const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(req.body, req.user);
    sendSuccess(res, 201, "Transaction created.", { transaction });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const result = await transactionService.getTransactions(req.query, req.user);
    sendSuccess(res, 200, "Transactions retrieved.", result);
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id, req.user);
    sendSuccess(res, 200, "Transaction retrieved.", { transaction });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.updateTransaction(req.params.id, req.body, req.user);
    sendSuccess(res, 200, "Transaction updated.", { transaction });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.params.id, req.user);
    sendSuccess(res, 200, "Transaction deleted.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
