const Payment = require("../models_/payment");

const paymentService = require("./payment.service");

const {
    resolveProvider,
} = require("./providers/provider.factory");



/*
========================================
Universal Webhook
========================================
*/

exports.handleWebhook = async (
    req,
    res
) => {

    try {

        const providerName =
            req.params.provider;

        const provider =
            resolveProvider(
                providerName
            );



        /*
        ========================================
        Verify webhook
        ========================================
        */

        const verified =
            provider.verifyWebhook(

                req.body,

                req.headers[
                    "x-signature"
                ] ||

                req.headers[
                    "x-nowpayments-sig"
                ] ||

                ""

            );



        if (!verified) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid webhook signature.",

            });

        }



        /*
        ========================================
        Extract provider payload
        ========================================
        */

        let orderId;

        let paymentStatus;

        let amountReceived = 0;

        let transactionId = "";



        /*
        NOWPayments
        */

        if (
            providerName ===
            "nowpayments"
        ) {

            orderId =
                req.body.order_id;

            paymentStatus =
                req.body.payment_status;

            amountReceived =
                req.body.actually_paid || 0;

            transactionId =
                req.body.purchase_id || "";

        }



        /*
        Paxum
        */

        else if (
            providerName ===
            "paxum"
        ) {

            orderId =
                req.body.order_id;

            paymentStatus =
                req.body.status;

            amountReceived =
                req.body.amount || 0;

            transactionId =
                req.body.transaction_id || "";

        }



        const payment =
            await Payment.findOne({

                orderId,

            });

        if (!payment) {

            return res.sendStatus(
                404
            );

        }



        payment.paymentStatus =
            paymentStatus;

        payment.amountReceived =
            amountReceived;

        payment.txHash =
            transactionId;

        await payment.save();



        /*
        ========================================
        Not completed yet?
        ========================================
        */

        if (
            payment.completed
        ) {

            return res.sendStatus(
                200
            );

        }



        /*
        Only finalize successful payments.
        */

        const successStatuses = [

            "finished",

            "completed",

            "success",

            "paid",

        ];



        if (
            !successStatuses.includes(
                String(
                    paymentStatus
                ).toLowerCase()
            )
        ) {

            return res.sendStatus(
                200
            );

        }



        /*
        ========================================
        Complete Payment
        ========================================
        */

        await paymentService.completePayment(
            payment
        );



        return res.sendStatus(200);

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message:
                err.message,

        });

    }

};