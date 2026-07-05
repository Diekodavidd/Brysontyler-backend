const express = require('express');
const router = express.Router();
const { createSubscription, getMyPayments, getPaymentById, cancelPayment, paymentWebhook, getPaymentByPaymentId, createSubscriptionPayment } = require('../controllers_/PaymentController');
const auth = require('../middleware_/authMiddleware');

router.post(
    "/create-subscription",
    auth,
    createSubscription
);

router.get(
    "/",
    auth,
    getMyPayments
);

router.get(
    "/:id",
    auth,
    getPaymentById
);

router.patch(
    "/cancel/:id",
    auth,
    cancelPayment
);

router.post(
    "/webhook",
    paymentWebhook
);
router.post(
    "/subscription",
    auth,
    createSubscriptionPayment
);
router.get(
    "/now/:paymentId",
    auth,
    getPaymentByPaymentId
);

module.exports = router;