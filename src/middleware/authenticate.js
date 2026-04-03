const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

/**
 * Authentication middleware.
 * Verifies the JWT from the Authorization header and attaches
 * the full user document to req.user for downstream use.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Authentication required. Please log in.", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User belonging to this token no longer exists.", 401));
    }

    if (!user.isActive) {
      return next(new AppError("Your account has been deactivated. Contact an admin.", 403));
    }

    req.user = user;
    logger.debug(`Authenticated: ${user.email} [${user.role}]`);
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please log in again.", 401));
    }
    next(error);
  }
};

module.exports = authenticate;
