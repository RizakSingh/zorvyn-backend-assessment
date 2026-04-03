const AppError = require("../utils/AppError");
const { ROLE_HIERARCHY } = require("../config/constants");

/**
 * Role-based authorization middleware factory.
 * Usage: authorize("admin") or authorize("analyst", "admin")
 *
 * Checks if the authenticated user's role meets the minimum required role,
 * using the ROLE_HIERARCHY array for ordered comparison.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    const userRoleIndex = ROLE_HIERARCHY.indexOf(req.user.role);
    const hasAccess = allowedRoles.some(
      (role) => ROLE_HIERARCHY.indexOf(role) <= userRoleIndex
    );

    if (!hasAccess) {
      return next(
        new AppError(
          `Access denied. Required role: [${allowedRoles.join(", ")}]. Your role: ${req.user.role}.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = authorize;
