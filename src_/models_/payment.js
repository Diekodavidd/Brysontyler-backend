const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
completed: {
  type: Boolean,
  default: false,
},
    membershipPlan: {
      type: String,
      enum: ["VIP", "ELITE"],
      default: null,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    paymentProvider: {
      type: String,
      default: "NowPayments",
    },

    // NOWPayments IDs
    paymentId: {
      type: String,
      unique: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentStatus: {
      type: String,
      default: "waiting",
    },

   paymentType: {
  type: String,
  enum: [
    "membership",
    "wallet",
    "coins",
    "subscription",
    "tip",
  ],
  required: true,
},

walletAmount: {
  type: Number,
  default: 0,
},

coinPurchase: {
    coinType: {
        type: String,
        enum: [
            "gold",
            "silver",
            "ruby",
        ],
    },

    quantity: {
        type: Number,
        default: 0,
    },

    pricePerCoin: Number,
},

    // Payment Details
    payAddress: String,

    payAmount: Number,

    payCurrency: String,

    network: String,

    validUntil: Date,

    orderDescription: String,

    amountReceived: {
      type: Number,
      default: 0,
    },
txHash: String,
    actuallyPaid: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", PaymentSchema);