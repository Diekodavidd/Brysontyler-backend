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
      enum: ["VIP", "Elite"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },

    paymentId: String,

    orderId: {
      type: String,
      unique: true,
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