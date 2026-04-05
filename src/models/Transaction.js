const mongoose = require("mongoose");
const { TRANSACTION_TYPES } = require("../config/constants");

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: [true, "Transaction type is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for efficient user + date queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, isDeleted: 1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ notes: "text", category: "text" });
module.exports = mongoose.model("Transaction", transactionSchema);
