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
      default: "NowPayments",
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

    paymentId: String,

    orderId: {
      type: String,
      unique: true,
    },

    invoiceUrl: String,

    payAddress: String,

    payCurrency: String,

    payAmount: Number,

    txHash: String,

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