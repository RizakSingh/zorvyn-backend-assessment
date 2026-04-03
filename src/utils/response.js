/**
 * Standardized JSON response helpers.
 * All API responses go through these to ensure a consistent shape:
 * { success, message, data } or { success, message, error }
 */

const sendSuccess = (res, statusCode = 200, message = "Success", data = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

const sendError = (res, statusCode = 500, message = "Internal server error") => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
