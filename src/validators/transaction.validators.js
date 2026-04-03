const { z } = require("zod");
const { TRANSACTION_TYPES } = require("../config/constants");

const createTransactionSchema = z.object({
  amount: z.number({ invalid_type_error: "Amount must be a number" }).positive("Amount must be positive"),
  type: z.enum(Object.values(TRANSACTION_TYPES), { errorMap: () => ({ message: "Type must be 'income' or 'expense'" }) }),
  category: z.string().min(1, "Category is required").max(50),
  date: z.string().datetime({ message: "Invalid date format. Use ISO 8601." }).optional(),
  notes: z.string().max(500).optional(),
});

const updateTransactionSchema = createTransactionSchema.partial();

const transactionQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  type: z.enum(Object.values(TRANSACTION_TYPES)).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

module.exports = { createTransactionSchema, updateTransactionSchema, transactionQuerySchema };
