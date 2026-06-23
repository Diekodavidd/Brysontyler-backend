const User = require('../models_/user');
const axios = require('axios');

exports.purchaseCoins = async (req, res) => {
    try {

        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: "Invalid amount."
            });
        }

        if (!process.env.NOWPAYMENTS_API_KEY) {
            return res.status(500).json({
                error: "Payment gateway not configured."
            });
        }

        const paymentData = {
            price_amount: amount,
            price_currency: "usd",
            pay_currency: "usdt",
            order_id: `coin_${req.user._id}_${Date.now()}`,
            ipn_callback_url: `${process.env.BACKEND_URL}/api/webhooks/nowpayments`
        };

        const response = await axios.post(
            "https://api.nowpayments.io/v1/payment",
            paymentData,
            {
                headers: {
                    "x-api-key": process.env.NOWPAYMENTS_API_KEY
                },
                timeout: 10000
            }
        );

        res.json(response.data);

    } catch (err) {

        res.status(500).json({
            error: err.response?.data || err.message
        });

    }
};

exports.tipCreator = async (req, res) => {
    try {

        const { creatorId, coins } = req.body;

        // Validate request
        if (!creatorId || !coins || coins <= 0) {
            return res.status(400).json({
                error: "Invalid tip request."
            });
        }

        // Prevent users from tipping themselves
        if (creatorId === req.user._id.toString()) {
            return res.status(400).json({
                error: "You cannot tip yourself."
            });
        }

        // Get fan and creator
        const fan = await User.findById(req.user._id);
        const creator = await User.findById(creatorId);

        // Check fan exists
        if (!fan) {
            return res.status(404).json({
                error: "User not found."
            });
        }

        // Check creator exists
        if (!creator) {
            return res.status(404).json({
                error: "Creator not found."
            });
        }

        // Ensure recipient is actually a creator
        if (creator.role !== "creator") {
            return res.status(400).json({
                error: "User is not a creator."
            });
        }

        // Check fan has enough coins
        if (fan.coinBalance < coins) {
            return res.status(400).json({
                error: "Insufficient coins."
            });
        }

        // Transfer coins
        fan.coinBalance -= coins;

        // Platform keeps 20%
        creator.coinBalance += Math.floor(coins * 0.8);

        await fan.save();
        await creator.save();

        res.json({
            success: true,
            message: "Tip sent successfully."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getBalance = async (req, res) => {
    res.json({
        coinBalance: req.user.coinBalance
    });
};