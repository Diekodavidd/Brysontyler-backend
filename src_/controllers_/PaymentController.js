const axios = require('axios');

const Payment = require("../models_/payment");
const User = require("../models_/user");
const subscription = require('../models_/subscription');

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
console.log(paymentData);
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


exports.createSubscriptionPayment = async (req, res) => {
     console.log("SUBSCRIPTION CONTROLLER RUNNING");
  try {
    const { creatorId } = req.body;

    if (!creatorId) {
      return res.status(400).json({
        success: false,
        message: "Creator is required.",
      });
    }

    const creator = await User.findById(creatorId);

    if (!creator || creator.role !== "creator") {
      return res.status(404).json({
        success: false,
        message: "Creator not found.",
      });
    }

    const amount = creator.subscriptionPrice || 9.99;

    const orderId = `subscription_${req.user._id}_${creator._id}_${Date.now()}`;

    const paymentData = {
      price_amount: amount,
      price_currency: "usd",
      pay_currency: "usdttrc20",
      order_id: orderId,
      order_description: `Subscription to ${
        creator.stageName || creator.name
      }`,
      ipn_callback_url: `${process.env.BACKEND_URL}/payments/webhook`,
    };

    const { data } = await axios.post(
      "https://api.nowpayments.io/v1/payment",
      paymentData,
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    await Payment.create({
      userId: req.user._id,
      creatorId: creator._id,

      paymentType: "subscription",

      amount,

      currency: "USD",
      paymentProvider: "NowPayments",

      paymentId: data.payment_id,
      orderId,

      paymentStatus: data.payment_status || "waiting",

      payAddress: data.pay_address,
      payAmount: data.pay_amount,
      payCurrency: data.pay_currency,
      network: data.network,
      validUntil: data.valid_until,
    });

    return res.json({
      success: true,
      payment: data,
    });
  } catch (err) {
    console.log(err.response?.data || err);

    return res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
};

exports.paymentWebhook = async (req, res) => {
  try {
    const {
      order_id,
      payment_status,
      payment_id,
      actually_paid,
      pay_amount,
      outcome_amount,
    } = req.body;

    const payment = await Payment.findOne({
      orderId: order_id,
    });

    if (!payment) {
      return res.sendStatus(404);
    }

    // Update payment details
    payment.paymentStatus = payment_status;
    payment.paymentId = payment_id || payment.paymentId;
    payment.amountReceived = actually_paid || pay_amount || 0;
    payment.actuallyPaid =
      outcome_amount || actually_paid || 0;

    await payment.save();

    const successfulStatuses = [
      "confirmed",
      "finished",
      "sending",
      "partially_paid",
    ];

    if (
      successfulStatuses.includes(payment_status) &&
      !payment.completed
    ) {
      payment.completed = true;

      const user = await User.findById(payment.userId);

      if (!user) {
        return res.sendStatus(404);
      }

      switch (payment.paymentType) {
        // ===========================================
        // Wallet Deposit
        // ===========================================
        case "wallet":
          user.walletBalance =
            (user.walletBalance || 0) +
            payment.walletAmount;
          break;

        // ===========================================
        // Coin Purchase
        // ===========================================
        case "coins":
          if (
            payment.coinPurchase?.coinType &&
            payment.coinPurchase?.quantity
          ) {
            user.coinBalances[
              payment.coinPurchase.coinType
            ] =
              (user.coinBalances[
                payment.coinPurchase.coinType
              ] || 0) +
              payment.coinPurchase.quantity;
          }
          break;

        // ===========================================
        // Membership Upgrade
        // ===========================================
        case "membership":
          user.membership.plan =
            payment.membershipPlan;

          user.membership.status = "active";

          user.membership.startDate =
            new Date();

          user.membership.endDate =
            new Date(
              Date.now() +
                30 * 24 * 60 * 60 * 1000
            );
            

          break;

        // ===========================================
        // Creator Subscription
        // ===========================================
        case "subscription": {
          let existing =
            await subscription.findOne({
              fanId: payment.userId,
              creatorId: payment.creatorId,
            });

          if (existing) {
            existing.status = "active";
            existing.amount = payment.amount;
            existing.startDate = new Date();
            existing.endDate = new Date(
              Date.now() +
                30 * 24 * 60 * 60 * 1000
            );

            await existing.save();
          } else {
            await subscription.create({
              fanId: payment.userId,
              creatorId: payment.creatorId,
              amount: payment.amount,
              status: "active",
              startDate: new Date(),
              endDate: new Date(
                Date.now() +
                  30 * 24 * 60 * 60 * 1000
              ),
            });
          }

          break;
        }

        // ===========================================
        // Tips
        // ===========================================
        case "tip":
          // We'll credit creator earnings later.
          break;

        default:
          break;
      }

      await user.save();
      await payment.save();
    }

    return res.sendStatus(200);
  } catch (err) {
  console.error(err);

  console.dir(err.errorResponse?.errInfo, {
    depth: null,
  });

  return res.sendStatus(500);
}
};

exports.getPaymentByPaymentId = async (req, res) => {

    try {

        const payment = await Payment.findOne({

            paymentId: req.params.paymentId,

        });

        if (!payment) {

            return res.status(404).json({

                success: false,
                message: "Payment not found."

            });

        }

        if (payment.userId.toString() !== req.user._id.toString()) {

            return res.status(403).json({

                success: false,
                message: "Unauthorized."

            });

        }

        res.json({

            success: true,
            payment,

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,
            message: err.message,

        });

    }

};