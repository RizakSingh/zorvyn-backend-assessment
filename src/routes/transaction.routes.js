const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transaction.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { validateBody, validateQuery } = require("../middleware/validate");
const {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} = require("../validators/transaction.validators");
const { ROLES } = require("../config/constants");

// All transaction routes require authentication
router.use(authenticate);

// GET /api/transactions  — viewer, analyst, admin
router.get(
  "/",
  authorize(ROLES.VIEWER),
  validateQuery(transactionQuerySchema),
  transactionController.getTransactions
);

// GET /api/transactions/:id  — viewer, analyst, admin
router.get(
  "/:id",
  authorize(ROLES.VIEWER),
  transactionController.getTransactionById
);

// POST /api/transactions  — admin only
// (Analysts and Viewers are read-only for transactions)
router.post(
  "/",
  authorize(ROLES.ADMIN),
  validateBody(createTransactionSchema),
  transactionController.createTransaction
);

// PATCH /api/transactions/:id  — admin only
router.patch(
  "/:id",
  authorize(ROLES.ADMIN),
  validateBody(updateTransactionSchema),
  transactionController.updateTransaction
);

// DELETE /api/transactions/:id  — admin only
router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  transactionController.deleteTransaction
);

module.exports = router;
