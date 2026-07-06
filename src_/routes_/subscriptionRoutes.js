const express = require("express");

const router = express.Router();

const auth = require("../middleware_/authMiddleware");

const {
    subscribeToCreator,
    getMySubscriptions,
    getSubscriptionById,
    cancelSubscription,
    renewSubscription,
    getCreatorSubscribers,
    checkSubscription,
    updateSubscriptionPrice
} = require("../controllers_/subscriptionController");

router.post("/", auth, subscribeToCreator);

router.get("/my-subscriptions", auth, getMySubscriptions);

router.get("/:id", auth, getSubscriptionById);

router.patch("/cancel/:id", auth, cancelSubscription);

router.patch("/renew/:id", auth, renewSubscription);

router.get("/creator/subscribers", auth, getCreatorSubscribers);

router.get("/check/:creatorId", auth, checkSubscription);

router.put(
  "/creator/subscription-price",
  auth,
  updateSubscriptionPrice
);
module.exports = router;