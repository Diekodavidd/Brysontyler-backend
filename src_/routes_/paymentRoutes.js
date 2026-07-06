const express = require('express');
const router = express.Router();
const { createSubscription, getMyPayments, cancelPayment, paymentWebhook, getPaymentByInvoiceId, createSubscriptionPayment } = require('../controllers_/PaymentController');
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
    "/invoice/:invoiceId",
    auth,
    getPaymentByInvoiceId
);
module.exports = router;