const express = require('express');
const router = express.Router();

const {
    nowPaymentsWebhook,
    getPaymentStatus,
    verifySubscription
} = require("../controllers_/webhookController");

const auth = require("../middleware_/authMiddleware");

// Webhooks (called by external services)
router.post("/nowpayments", nowPaymentsWebhook);

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
