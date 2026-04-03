const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");
const { validateBody } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const { registerSchema, loginSchema } = require("../validators/auth.validators");

// POST /api/auth/register
router.post("/register", authLimiter, validateBody(registerSchema), authController.register);

// POST /api/auth/login
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);

// GET /api/auth/me  (protected)
router.get("/me", authenticate, authController.getMe);

module.exports = router;
