const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/transactions", require("./transaction.routes"));
router.use("/analytics", require("./analytics.routes"));
router.use("/users", require("./user.routes"));

// Health check
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Finance Dashboard API is running.", timestamp: new Date().toISOString() });
});

module.exports = router;
