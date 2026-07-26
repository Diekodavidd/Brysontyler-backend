const mongoose = require("mongoose");

const PayoutSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },

    method: {
      type: String,
      enum: [
        "bank_transfer",
        "paypal",
        "crypto",
        "other",
      ],
      required: true,
    },

    accountDetails: {
      type: Object,
      default: {},
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "processing",
        "paid",
        "declined",
        "cancelled",
      ],
      default: "pending",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    adminNote: {
      type: String,
      default: "",
    },

    transactionId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Payout",
  PayoutSchema
);