const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "USD"
        },

        paymentProvider: {
            type: String,
            default: "NowPayments"
        },

        paymentId: String,

        orderId: {
            type: String,
            required: true,
            unique: true
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "failed",
                "cancelled"
            ],
            default: "pending"
        },

        paymentType: {
            type: String,
            enum: [
                "subscription",
                "tip",
                "coin_purchase"
            ],
            default: "subscription"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", PaymentSchema);