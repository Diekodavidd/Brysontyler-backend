const axios = require("axios");
const Membership = require("../models_/membership");

exports.createMembership = async (req, res) => {
  try {

 console.log("BODY:", req.body);
        console.log("PLAN:", req.body.plan);

        const { plan } = req.body;
    if (!["VIP", "Elite"].includes(plan)) {
      return res.status(400).json({
        error: "Invalid membership plan.",
      });
    }

    const amount =
      plan === "VIP" ? 14.99 : 29.99;

    const orderId =
      `membership_${req.user._id}_${Date.now()}`;

    const payment = await axios.post(

      "https://api.nowpayments.io/v1/payment",

      {
        price_amount: amount,
        price_currency: "usd",
        // pay_currency: "usdt",

        order_id: orderId,

        order_description:
          `${plan} Membership`,

        ipn_callback_url:
          `${process.env.BACKEND_URL}/webhooks/nowpayments`,
      },

      {
        headers: {
          "x-api-key":
            process.env.NOWPAYMENTS_API_KEY,
        },
      }

    );

    await Membership.create({

      userId: req.user._id,

      plan,

      amount,

      orderId,

      paymentId: payment.data.payment_id,

      status: "pending",

    });

    res.json({

      success: true,

      payment: payment.data,

    });

  } catch (err) {

    console.log("========== ERROR ==========");
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
    console.log("MESSAGE:", err.message);

    return res.status(
        err.response?.status || 500
    ).json({
        error: err.response?.data || err.message,
    });

}
};

exports.getMembership = async (req, res) => {

  const membership =
    await Membership.findOne({

      userId: req.user._id,

    });

  res.json({

    success: true,

    membership,

  });

};