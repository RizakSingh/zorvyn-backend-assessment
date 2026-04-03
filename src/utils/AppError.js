/**
 * Custom application error class.
 * Carries an HTTP status code alongside the message so controllers
 * and the centralized error handler can respond consistently.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguish from unexpected system errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
