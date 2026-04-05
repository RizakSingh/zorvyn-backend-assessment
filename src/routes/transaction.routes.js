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

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions (with filters & pagination)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 */
// GET /api/transactions
router.get(
  "/",
  authorize(ROLES.VIEWER),
  validateQuery(transactionQuerySchema),
  transactionController.getTransactions
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction data
 */
// GET /api/transactions/:id
router.get(
  "/:id",
  authorize(ROLES.VIEWER),
  transactionController.getTransactionById
);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a transaction (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 */
// POST /api/transactions
router.post(
  "/",
  authorize(ROLES.ADMIN),
  validateBody(createTransactionSchema),
  transactionController.createTransaction
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   patch:
 *     summary: Update transaction (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 */
// PATCH /api/transactions/:id
router.patch(
  "/:id",
  authorize(ROLES.ADMIN),
  validateBody(updateTransactionSchema),
  transactionController.updateTransaction
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete transaction (soft delete, Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
// DELETE /api/transactions/:id
router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  transactionController.deleteTransaction
);

module.exports = router;