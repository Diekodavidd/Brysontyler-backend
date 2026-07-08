// const express = require('express');
// const router = express.Router();
// const { createSubscription, getMyPayments, cancelPayment, paymentWebhook, getPaymentByInvoiceId, createSubscriptionPayment } = require('../controllers_/PaymentController');
// const auth = require('../middleware_/authMiddleware');

// router.post(
//     "/create-subscription",
//     auth,
//     createSubscription
// );

// router.get(
//     "/",
//     auth,
//     getMyPayments
// );



// router.patch(
//     "/cancel/:id",
//     auth,
//     cancelPayment
// );

// router.post(
//     "/webhook",
//     paymentWebhook
// );
// router.post(
//     "/subscription",
//     auth,
//     createSubscriptionPayment
// );
// router.get(
//     "/invoice/:invoiceId",
//     auth,
//     getPaymentByInvoiceId
// );
// module.exports = router;


const express = require("express");

const router = express.Router();

const auth = require("../middleware_/authMiddleware");

const paymentController = require("../payments/payment.controller");

const webhookController = require("../payments/webhook.controller");



/*
=====================================
Membership
=====================================
*/

router.post(
    "/membership",
    auth,
    paymentController.createMembership
);



/*
=====================================
Creator Subscription
=====================================
*/

router.post(
    "/subscription",
    auth,
    paymentController.createSubscription
);



/*
=====================================
Wallet Deposit
=====================================
*/

router.post(
    "/wallet/deposit",
    auth,
    paymentController.depositWallet
);



/*
=====================================
Buy Coins
=====================================
*/

router.post(
    "/wallet/coins",
    auth,
    paymentController.buyCoins
);



/*
=====================================
Payment History
=====================================
*/

router.get(
    "/",
    auth,
    paymentController.getPayments
);



/*
=====================================
Single Payment
=====================================
*/

router.get(
    "/:id",
    auth,
    paymentController.getPayment
);



/*
=====================================
Cancel Payment
=====================================
*/

router.patch(
    "/:id/cancel",
    auth,
    paymentController.cancelPayment
);



/*
=====================================
Universal Webhooks
=====================================
*/

router.post(
    "/webhook/:provider",
    webhookController.handleWebhook
);

module.exports = router;