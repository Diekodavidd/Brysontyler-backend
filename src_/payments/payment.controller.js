const paymentService = require("./payment.service");

/*
========================================
MEMBERSHIP
========================================
*/

exports.createMembership = async (req, res) => {

    try {

        const {
            plan,
            provider = "nowpayments",
        } = req.body;

        const result =
            await paymentService.createMembershipPayment({

                user: req.user,

                plan,

                providerName: provider,

            });

      return res.json({
    success: true,
    payment: result.payment,
    checkout: result.invoice,
});
    }

    catch (err) {

    console.error(err);

    return res.status(500).json({
        success: false,
        message: err.message,
    });

}

};



/*
========================================
CREATOR SUBSCRIPTION
========================================
*/

exports.createSubscription = async (req, res) => {

    try {

        const {

            creatorId,

            provider = "nowpayments",

        } = req.body;

        const result =
            await paymentService.createSubscriptionPayment({

                user: req.user,

                creatorId,

                providerName: provider,

            });

        return res.json({
    success: true,
    payment: result.payment,
    checkout: result.invoice,
});

    }

  catch (err) {
    console.error("SUBSCRIPTION ERROR:", err);

    return res.status(500).json({
        success: false,
        message: err.message,
        stack: err.stack,
    });
}
};



/*
========================================
WALLET
========================================
*/

exports.depositWallet = async (req, res) => {
    try {
        console.log("BODY:", req.body);

        const { amount, provider = "nowpayments" } = req.body;

        const result = await paymentService.depositWallet({
            user: req.user,
            amount,
            providerName: provider,
        });

        return res.json({
            success: true,
            payment: result.payment,
            checkout: result.invoice,
        });

    } catch (err) {
        console.error("DEPOSIT ERROR:", err);

        return res.status(500).json({
            success: false,
            message: err.message,
            stack: err.stack,
        });
    }
};



/*
========================================
BUY COINS
========================================
*/

exports.buyCoins = async (req, res) => {

    try {

        const {

            coinType,

            quantity,

            provider = "nowpayments",

        } = req.body;

        const result =
            await paymentService.buyCoins({

                user: req.user,

                coinType,

                quantity,

                providerName: provider,

            });

        return res.json({
    success: true,
    payment: result.payment,
    checkout: result.invoice,
});

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};



/*
========================================
PAYMENT HISTORY
========================================
*/

exports.getPayments = async (req, res) => {

    try {

        const Payment =
            require("../models_/payment");

        const payments =
            await Payment.find({

                userId: req.user._id,

            })

            .populate(
                "creatorId",
                "name stageName"
            )

            .sort({

                createdAt: -1,

            });

        return res.json({

            success: true,

            payments,

        });

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};



/*
========================================
GET SINGLE PAYMENT
========================================
*/

exports.getPayment = async (req, res) => {

    try {

        const Payment =
            require("../models_/payment");

        const payment =
            await Payment.findById(
                req.params.id
            );

        if (!payment) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment not found.",

            });

        }

        if (
            payment.userId.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Unauthorized.",

            });

        }

        return res.json({

            success: true,

            payment,

        });

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};



/*
========================================
CANCEL PAYMENT
========================================
*/

exports.cancelPayment = async (req, res) => {

    try {

        const Payment =
            require("../models_/payment");

        const payment =
            await Payment.findById(
                req.params.id
            );

        if (!payment) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment not found.",

            });

        }

        if (
            payment.userId.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Unauthorized.",

            });

        }

        payment.paymentStatus =
            "cancelled";

        await payment.save();

        return res.json({

            success: true,

            message:
                "Payment cancelled.",

        });

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};