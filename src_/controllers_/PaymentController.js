const axios = require('axios');

const Payment = require("../models_/payment");
const User = require("../models_/user");

exports.createSubscription = async (req, res) => {

    try {

        const { amount, creatorId } = req.body;

        if (!amount || amount <= 0 || !creatorId) {
            return res.status(400).json({
                error: "Amount and creator are required."
            });
        }

        if (creatorId === req.user._id.toString()) {
            return res.status(400).json({
                error: "You cannot subscribe to yourself."
            });
        }

        const creator = await User.findById(creatorId);

        if (!creator) {
            return res.status(404).json({
                error: "Creator not found."
            });
        }

        if (creator.role !== "creator") {
            return res.status(400).json({
                error: "Selected user is not a creator."
            });
        }

        const orderId =
            `bt_${req.user._id}_${creatorId}_${Date.now()}`;

        const paymentData = {

            price_amount: amount,

            price_currency: "usd",

            pay_currency: "usdt",

            order_id: orderId,

            order_description: "Creator Subscription",

            ipn_callback_url:
                `${process.env.BACKEND_URL}/webhooks/nowpayments`

        };

        const response = await axios.post(

            "https://api.nowpayments.io/v1/payment",

            paymentData,

            {
                headers: {
                    "x-api-key": process.env.NOWPAYMENTS_API_KEY
                }
            }

        );

        await Payment.create({

            userId: req.user._id,

            creatorId,

            amount,

            orderId,

            paymentId: response.data.payment_id,

            paymentStatus: "pending",

            paymentType: "subscription"

        });

        res.json({

            success: true,

            payment: response.data

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};

exports.getMyPayments = async (req, res) => {

    try {

        const payments = await Payment.find({

            userId: req.user._id

        })

        .populate("creatorId", "name")

        .sort({

            createdAt: -1

        });

        res.json({

            success: true,

            count: payments.length,

            payments

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};

exports.getPaymentById = async (req, res) => {

    try {

        const payment = await Payment.findById(req.params.id);

        if (!payment) {

            return res.status(404).json({

                error: "Payment not found."

            });

        }

        if (payment.userId.toString() !== req.user._id.toString()) {

            return res.status(403).json({

                error: "Unauthorized."

            });

        }

        res.json({

            success: true,

            payment

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};

exports.cancelPayment = async (req, res) => {

    try {

        const payment = await Payment.findById(req.params.id);

        if (!payment) {

            return res.status(404).json({

                error: "Payment not found."

            });

        }

        if (payment.userId.toString() !== req.user._id.toString()) {

            return res.status(403).json({

                error: "Unauthorized."

            });

        }

        payment.paymentStatus = "cancelled";

        await payment.save();

        res.json({

            success: true,

            message: "Payment cancelled."

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};

exports.paymentWebhook = async (req, res) => {

    try {

        const {

            order_id,

            payment_status,

            payment_id

        } = req.body;

        const payment = await Payment.findOne({

            orderId: order_id

        });

        if (!payment) {

            return res.sendStatus(404);

        }

        payment.paymentStatus = payment_status;

        payment.paymentId = payment_id;

        await payment.save();

        res.sendStatus(200);

    }

    catch (error) {

        res.sendStatus(500);

    }

};