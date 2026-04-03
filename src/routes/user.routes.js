const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { validateBody } = require("../middleware/validate");
const { updateUserSchema } = require("../validators/user.validators");
const { ROLES } = require("../config/constants");

// All user management routes require admin role
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// GET /api/users
router.get("/", userController.getAllUsers);

// GET /api/users/:id
router.get("/:id", userController.getUserById);

// PATCH /api/users/:id  — update role, isActive, name
router.patch("/:id", validateBody(updateUserSchema), userController.updateUser);

// DELETE /api/users/:id
router.delete("/:id", userController.deleteUser);

module.exports = router;
