const express = require("express");
const router = express.Router();

const auth = require("../middleware_/authMiddleware");

const {
    getDashboard,
    getProfile,
    updateProfile,
    getWallet,
    getHistory,
    getPreferences,
    updatePreferences,
    getPaymentMethods,
    savePaymentMethod,
    getActivity,
    getSubscriptions
} = require("../controllers_/fanController");

router.get("/dashboard", auth, getDashboard);

router.get("/profile", auth, getProfile);

router.patch("/profile", auth, updateProfile);

router.get("/wallet", auth, getWallet);

router.get("/history", auth, getHistory);

router.get("/preferences", auth, getPreferences);

router.patch("/preferences", auth, updatePreferences);

router.get("/payment-methods", auth, getPaymentMethods);

router.post("/payment-methods", auth, savePaymentMethod);

router.get(
  "/activity",
  auth,
  getActivity
);

router.get(
  "/subscriptions",
  auth,
  getSubscriptions
);
module.exports = router;