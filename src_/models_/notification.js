const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        // Account
        "signup",

        // Creator
        "creator_application_submitted",
        "creator_application_approved",
        "creator_application_rejected",
        "creator_content_uploaded",
        "creator_content_approved",
"creator_content_rejected",

        // Fan
        "membership_upgraded",
        "membership_expired",

        // Subscriptions
        "new_subscriber",
        "subscription_started",
        "subscription_cancelled",

        // Payments
        "payment_successful",
        "payment_failed",

        // System
        "system",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    link: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  NotificationSchema
);