require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { defaultLimiter } = require("./middleware/rateLimiter");
const logger = require("./utils/logger");

const app = express();

// ── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));

// ── Global rate limiter ──────────────────────────────────────────────────────
app.use(defaultLimiter);

// ── Request logging (dev) ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", routes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Centralized error handler (must be last) ─────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
});

module.exports = app;
