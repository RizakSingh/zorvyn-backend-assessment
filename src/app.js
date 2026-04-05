require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { defaultLimiter } = require("./middleware/rateLimiter");
const logger = require("./utils/logger");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const cors = require("cors");
const app = express();


// ── Body parsing
app.use(express.json({ limit: "10kb" }));

// ── Security headers
app.use(helmet());
app.use(mongoSanitize({
  replaceWith: "_"
}));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



// ── Global rate limiter
app.use(defaultLimiter);

// ── Request logging (dev)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });
}
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ── Routes 
app.use("/api", routes);


// ── 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Centralized error handler (must be last)
app.use(errorHandler);

// ── Start
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
});

module.exports = app;
