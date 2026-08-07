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

    membershipPlan: {
      type: String,
      enum: ["VIP", "ELITE"],
      default: null,
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

    completed: {
      type: Boolean,
      default: false,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },
bankTransfer: {

    bankName: String,

    accountName: String,

    accountNumber: String,

    reference: String,

    amountUsd: Number,

    amountNaira: Number,

    exchangeRate: Number,

    receiptUrl: String,

    receiptStatus: {
        type: String,
        enum: [
            "not_uploaded",
            "uploaded",
            "approved",
            "rejected",
        ],
        default: "not_uploaded",
    },

    uploadedAt: Date,

    verifiedAt: Date,

    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    rejectionReason: String,

},
   paymentProvider: {
    type: String,
    enum: [
        "nowpayments",
        "paxum",
        "bank_transfer",
        "stripe",
        "flutterwave",
        "paystack",
    ],
    default: "nowpayments",
},

    orderId: {
      type: String,
      unique: true,
      required: true,
    },

    invoiceId: String,

    invoiceUrl: String,

    paymentStatus: {
    type: String,
    enum: [

"waiting",             // crypto waiting

"pending",             // bank transfer created

"receipt_uploaded",

"pending_verification",

"finished",

"failed",

"cancelled",

"rejected",

],
    default: "waiting",
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
paymentId: String,

payAddress: String,

payAmount: Number,

payCurrency: String,

network: String,

validUntil: Date,
    amountReceived: {
      type: Number,
      default: 0,
    },
    

    txHash: String,

    orderDescription: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Payment",
  PaymentSchema
);