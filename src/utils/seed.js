/**
 * Seed script for development.
 * Creates one user of each role + 50 sample transactions.
 * Run with: node src/utils/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const logger = require("./logger");

const CATEGORIES = ["Salary", "Freelance", "Rent", "Food", "Transport", "Utilities", "Entertainment", "Healthcare", "Shopping", "Investment"];
const NOTES = ["Monthly payment", "One-time purchase", "Recurring expense", "Bonus", null];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomAmount = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const randomDate = (daysBack) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d;
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info("Connected to MongoDB for seeding...");

  // Wipe existing data
  await User.deleteMany({});
  await Transaction.deleteMany({});
  logger.info("Cleared existing data.");

  // Create users
  const users = await User.create([
    { name: "Admin User", email: "admin@example.com", password: "password123", role: "admin" },
    { name: "Analyst User", email: "analyst@example.com", password: "password123", role: "analyst" },
    { name: "Viewer User", email: "viewer@example.com", password: "password123", role: "viewer" },
  ]);
  logger.info(`Created ${users.length} users.`);

  // Create transactions for admin user (50 records)
  const adminUser = users.find((u) => u.role === "admin");
  const analystUser = users.find((u) => u.role === "analyst");

  const transactions = [];

  for (let i = 0; i < 35; i++) {
    transactions.push({
      amount: randomAmount(10, 5000),
      type: i % 3 === 0 ? "income" : "expense",
      category: randomItem(CATEGORIES),
      date: randomDate(365),
      notes: randomItem(NOTES),
      userId: adminUser._id,
    });
  }

  for (let i = 0; i < 15; i++) {
    transactions.push({
      amount: randomAmount(10, 2000),
      type: i % 2 === 0 ? "income" : "expense",
      category: randomItem(CATEGORIES),
      date: randomDate(180),
      notes: randomItem(NOTES),
      userId: analystUser._id,
    });
  }

  await Transaction.insertMany(transactions);
  logger.info(`Created ${transactions.length} transactions.`);

  logger.info("\n✅ Seed complete. Test credentials:");
  logger.info("  admin@example.com    / password123 (admin)");
  logger.info("  analyst@example.com  / password123 (analyst)");
  logger.info("  viewer@example.com   / password123 (viewer)");

  await mongoose.disconnect();
}

seed().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
