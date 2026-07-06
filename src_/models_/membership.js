const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    plan: {
      type: String,
      enum: ["VIP", "ELITE"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    provider: {
      type: String,
      default: "NOWPayments",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "active",
        "expired",
        "cancelled",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      default: "waiting",
    },

    orderId: {
      type: String,
      unique: true,
    },

    invoiceId: {
      type: String,
    },

    invoiceUrl: {
      type: String,
    },

    startDate: Date,

    endDate: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Membership",
  MembershipSchema
);