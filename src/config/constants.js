const ROLES = {
  VIEWER: "viewer",
  ANALYST: "analyst",
  ADMIN: "admin",
};

const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

// Role hierarchy: higher index = more permissions
const ROLE_HIERARCHY = [ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN];

module.exports = { ROLES, TRANSACTION_TYPES, ROLE_HIERARCHY };
