const axios = require("axios");
const Payment = require("../models_/payment");
const User = require("../models_/user");
const Membership = require("../models_/membership");

exports.createMembership = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Membership plan is required.",
      });
    }

    const plans = {
      VIP: 14.99,
      ELITE: 29.99,
    };

    const amount = plans[plan];

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership plan.",
      });
    }

    const orderId = `membership_${req.user._id}_${Date.now()}`;

    const invoicePayload = {
      price_amount: amount,
      price_currency: "usd",

      order_id: orderId,

      order_description: `${plan} Membership`,

      success_url: `${process.env.FRONTEND_URL}/payment/success`,

      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,

      ipn_callback_url:
        `${process.env.BACKEND_URL}/payments/webhook`,
    };

    const { data } = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
      invoicePayload,
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    await Payment.create({
      userId: req.user._id,

      paymentType: "membership",

      membershipPlan: plan,

      amount,

      currency: "USD",

      paymentProvider: "NOWPayments",

      orderId,

      invoiceId: data.id,

      invoiceUrl: data.invoice_url,

      paymentStatus: "waiting",
    });

    res.json({
      success: true,
      payment: {
        invoiceId: data.id,
        invoiceUrl: data.invoice_url,
      },
    });
  } catch (err) {
    console.log(err.response?.data || err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getMembership = async (req, res) => {
  try {
    const membership = await Membership.findOne({
      userId: req.user._id,
    });

    res.json({
      success: true,
      membership,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

