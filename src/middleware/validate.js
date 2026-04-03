const { sendError } = require("../utils/response");

/**
 * Zod validation middleware factory.
 * Validates req.body against a Zod schema.
 * On failure, returns 400 with the first validation error message.
 */
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstError = result.error.errors[0];
    return sendError(res, 400, `Validation error: ${firstError.path.join(".")} — ${firstError.message}`);
  }

  req.body = result.data; // replace with parsed/transformed data
  next();
};

/**
 * Validates req.query against a Zod schema.
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const firstError = result.error.errors[0];
    return sendError(res, 400, `Query error: ${firstError.path.join(".")} — ${firstError.message}`);
  }

  req.query = result.data;
  next();
};

module.exports = { validateBody, validateQuery };
