const express = require("express");

const router = express.Router();

const auth = require("../middleware_/authMiddleware");

const {
  getWallet,
  depositToWallet,
  buyCoins,
} = require("../controllers_/walletController");

router.get("/", auth, getWallet);

router.post("/deposit", auth, depositToWallet);

router.post("/buy-coins", auth, buyCoins);

module.exports = router;