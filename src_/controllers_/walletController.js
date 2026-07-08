const axios = require("axios");

const Payment = require("../models_/payment");
const User = require("../models_/user");

exports.depositToWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid amount is required.",
      });
    }

    const orderId = `wallet_${req.user._id}_${Date.now()}`;

    const paymentData = {
      price_amount: Number(amount),
      price_currency: "usd",

      order_id: orderId,

      order_description: "Wallet Deposit",

      ipn_callback_url: `${process.env.BACKEND_URL}/payments/webhook`,

      success_url: `${process.env.FRONTEND_URL}/payment/success`,

      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
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

      paymentType: "wallet",

      amount: Number(amount),

      walletAmount: Number(amount),

      currency: "USD",

      paymentProvider: "NOWPayments",

      orderId,

      paymentId:
        invoice.payment_id,

    invoiceId:
        invoice.payment_id,

    payAddress:
        invoice.pay_address,

    payAmount:
        invoice.pay_amount,

    payCurrency:
        invoice.pay_currency,

    network:
        invoice.network,

    validUntil:
        invoice.valid_until,

    paymentStatus:
        invoice.payment_status || "waiting",

      orderDescription: "Wallet Deposit",
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


exports.buyCoins = async (req, res) => {
  try {
    const { coinType, quantity } = req.body;

    if (!coinType || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Coin type and quantity are required.",
      });
    }

    const prices = {
      gold: 5,
      silver: 2,
      ruby: 1,
    };

    const pricePerCoin = prices[coinType];

    if (!pricePerCoin) {
      return res.status(400).json({
        success: false,
        message: "Invalid coin type.",
      });
    }

    const amount = Number(quantity) * pricePerCoin;

    const orderId = `coins_${req.user._id}_${Date.now()}`;

    const paymentData = {
      price_amount: amount,
      price_currency: "usd",

      order_id: orderId,

      order_description: `${quantity} ${coinType} coins`,

      ipn_callback_url: `${process.env.BACKEND_URL}/payments/webhook`,

      success_url: `${process.env.FRONTEND_URL}/payment/success`,

      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
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

      paymentType: "coins",

      amount,

      currency: "USD",

      paymentProvider: "NOWPayments",

      orderId,

      paymentId:
        invoice.payment_id,

    invoiceId:
        invoice.payment_id,

    payAddress:
        invoice.pay_address,

    payAmount:
        invoice.pay_amount,

    payCurrency:
        invoice.pay_currency,

    network:
        invoice.network,

    validUntil:
        invoice.valid_until,

    paymentStatus:
        invoice.payment_status || "waiting",

      orderDescription: `${quantity} ${coinType} coins`,

      coinPurchase: {
        coinType,
        quantity: Number(quantity),
        pricePerCoin,
      },
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

exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "walletBalance coinBalances membership"
    );

    const payments = await Payment.find({
      userId: req.user._id,
    })
      .populate("creatorId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      wallet: {
        balance: user.walletBalance || 0,
        coinBalances: user.coinBalances,
        membership: user.membership,
        payments,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Failed to load wallet.",
    });
  }
};