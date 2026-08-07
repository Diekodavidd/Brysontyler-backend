const express = require("express");
const router = express.Router();
const uploadReceipt = require("../middleware_/uploadReceipt");
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
    getSubscriptions,getCreatorById,uploadBankReceipt
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

router.get(
  "/creator/:id",
  getCreatorById
);

router.patch(
  "/payments/:paymentId/receipt",
  auth,
  uploadReceipt.single("receipt"),
  uploadBankReceipt
);
module.exports = router;