const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");
const { validateBody } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const { registerSchema, loginSchema } = require("../validators/auth.validators");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
// POST /api/auth/register
router.post("/register", authLimiter, validateBody(registerSchema), authController.register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
// POST /api/auth/login
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 */
// GET /api/auth/me  (protected)
router.get("/me", authenticate, authController.getMe);

module.exports = router;
