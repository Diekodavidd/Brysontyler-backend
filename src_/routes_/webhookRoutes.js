const express = require('express');
const router = express.Router();

const {
    nowPaymentsWebhook,
    diditWebhook,
    getPaymentStatus,
    verifySubscription
} = require("../controllers_/webhookController");

const auth = require("../middleware_/authMiddleware");

// Webhooks (called by external services)
router.post("/nowpayments", nowPaymentsWebhook);
router.post("/didit", diditWebhook);

// User endpoints
router.get(
    "/payment-status/:id",
    auth,
    getPaymentStatus
);

router.get(
    "/verify-subscription/:creatorId",
    auth,
    verifySubscription
);

module.exports = router;
