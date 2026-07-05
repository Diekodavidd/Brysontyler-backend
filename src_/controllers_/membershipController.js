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

    const paymentData = {
      price_amount: amount,
      price_currency: "usd",
      pay_currency: "usdttrc20",
      order_id: orderId,
      order_description: `${plan} Membership`,
      ipn_callback_url: `${process.env.BACKEND_URL}/membership/webhook`,
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

    // Save Payment History
    await Payment.create({
      userId: req.user._id,
      creatorId: null,
      membershipPlan: plan,
      amount,
      currency: "USD",
      paymentProvider: "NowPayments",
      paymentId: data.payment_id,
      orderId,
      paymentStatus: data.payment_status || "waiting",
      paymentType: "membership",
      payAddress: data.pay_address,
      payAmount: data.pay_amount,
      payCurrency: data.pay_currency,
      network: data.network,
      validUntil: data.valid_until,
    });

    // Save / Update Membership
    // await Membership.findOneAndUpdate(
    //   {
    //     userId: req.user._id,
    //   },
    //   {
    //     userId: req.user._id,
    //     plan,
    //     amount,
    //     status: "pending",
    //     paymentStatus: data.payment_status || "waiting",
    //     paymentId: data.payment_id,
    //     orderId,
    //     payAddress: data.pay_address,
    //     payAmount: data.pay_amount,
    //     payCurrency: data.pay_currency,
    //   },
    //   {
    //     new: true,
    //     upsert: true,
    //   }
    // );

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

exports.getMembership = async (req, res) => {
  try {
    const membership = await Membership.findOne({
      userId: req.user._id,
    });

    return res.json({
      success: true,
      membership,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.membershipWebhook = async (req, res) => {
  try {
    const {
      order_id,
      payment_status,
      payment_id,
      pay_amount,
      pay_currency,
      purchase_id,
    } = req.body;

    // ----------------------------------
    // Find Payment
    // ----------------------------------

    const payment = await Payment.findOne({
      orderId: order_id,
    });

    if (!payment) {
      return res.sendStatus(404);
    }

    // ----------------------------------
    // Update Payment
    // ----------------------------------

    payment.paymentId = payment_id;
    payment.payAmount = pay_amount;
    payment.payCurrency = pay_currency;

    if (purchase_id) {
      payment.txHash = purchase_id;
    }

    switch (payment_status) {
      case "finished":
        payment.paymentStatus = "confirmed";
        break;

      case "failed":
      case "expired":
        payment.paymentStatus = "failed";
        break;

      default:
        payment.paymentStatus = payment_status;
    }

    await payment.save();

    // ----------------------------------
    // Payment not completed yet
    // ----------------------------------

    if (payment_status !== "finished") {
      return res.sendStatus(200);
    }

    // ----------------------------------
    // Activate Membership
    // ----------------------------------

    const startDate = new Date();

    const endDate = new Date(
      startDate.getTime() +
        30 * 24 * 60 * 60 * 1000
    );

    const membership =
      await Membership.findOneAndUpdate(
        {
          userId: payment.userId,
        },
        {
          userId: payment.userId,
          plan: payment.membershipPlan,
          amount: payment.amount,
          status: "active",
          paymentStatus: "confirmed",
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          payAmount: payment.payAmount,
          payCurrency: payment.payCurrency,
          startDate,
          endDate,
        },
        {
          new: true,
          upsert: true,
        }
      );

    // ----------------------------------
    // Update User
    // ----------------------------------

    await User.findByIdAndUpdate(payment.userId, {
      membership: {
        plan: membership.plan,
        status: membership.status,
        startDate: membership.startDate,
        endDate: membership.endDate,
      },
    });

    return res.sendStatus(200);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};