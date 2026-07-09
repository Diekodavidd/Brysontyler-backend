const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // ==========================
    // BASIC ACCOUNT
    // ==========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["fan", "creator", "admin"],
      default: "fan",
    },

    // ==========================
    // PROFILE
    // ==========================

    phoneNumber: String,

    dateOfBirth: Date,

    gender: String,

    country: String,

    state: String,

    city: String,

    bio: String,

    profileImage: String,

    coverImage: String,

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // ==========================
    // MEMBERSHIP
    // ==========================

    membership: {
      plan: {
        type: String,
        enum: ["FREE", "VIP", "ELITE"],
        default: "FREE",
      },

      status: {
        type: String,
        enum: [
          "inactive",
          "pending",
          "active",
          "expired",
          "cancelled",
        ],
        default: "inactive",
      },

      startDate: Date,

      endDate: Date,
    },

    // ==========================
    // CREATOR
    // ==========================

    creatorApplication: {
      stageName: {
        type: String,
        default: "",
      },

      category: {
        type: String,
        default: "",
      },

      socialLinks: [
        {
          type: String,
        },
      ],

      submittedAt: Date,
    },

    creatorApproval: {
      status: {
        type: String,
        enum: [
          "not_submitted",
          "pending",
          "approved",
          "rejected",
        ],
        default: "not_submitted",
      },

      reviewedAt: Date,

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      rejectionReason: {
        type: String,
        default: "",
      },
    },

    // ==========================
    // CREATOR SETTINGS
    // ==========================

    subscriptionPrice: {
      type: Number,
      default: 0,
    },

    // ==========================
    // WALLET
    // ==========================

    walletBalance: {
      type: Number,
      default: 0,
    },

    coinBalances: {
      gold: {
        type: Number,
        default: 0,
      },

      silver: {
        type: Number,
        default: 0,
      },

      ruby: {
        type: Number,
        default: 0,
      },
    },

    // ==========================
    // FAN SETTINGS
    // ==========================

    preferences: {
      darkMode: {
        type: Boolean,
        default: true,
      },

      autoplay: {
        type: Boolean,
        default: true,
      },

      emailNotifications: {
        type: Boolean,
        default: true,
      },

      pushNotifications: {
        type: Boolean,
        default: true,
      },
    },

    // ==========================
    // PAYMENT METHODS
    // ==========================

    paymentMethods: [
      {
        provider: String,

        accountName: String,

        accountNumber: String,

        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // ==========================
    // LEGACY KYC
    // ==========================

    isKYCVerified: {
      type: Boolean,
      default: false,
    },

    kycStatus: {
      type: String,
      enum: [
        "not_started",
        "pending",
        "approved",
        "rejected",
      ],
      default: "not_started",
    },

    kycVerifiedAt: Date,

    // ==========================
    // DIDIT
    // ==========================

    didit: {
      workflowId: String,

      sessionId: String,

      sessionToken: String,

      verificationUrl: String,

      status: {
        type: String,
        default: "not_started",
      },

      verifiedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================
// ENABLE VIRTUALS
// =========================================

UserSchema.set("toJSON", {
  virtuals: true,
});

UserSchema.set("toObject", {
  virtuals: true,
});

// =========================================
// VIRTUAL POPULATE
// =========================================

UserSchema.virtual("contents", {
  ref: "Content",
  localField: "_id",
  foreignField: "creatorId",
});

module.exports = mongoose.model("User", UserSchema);