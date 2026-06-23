const express = require('express');
const router = express.Router();
const { startKYC, diditWebhook, getKYCStatus, restartKYC } = require('../controllers_/kycController');
const auth = require('../middleware_/authMiddleware');

router.post("/start", auth, startKYC);

router.get("/status", auth, getKYCStatus);

router.post("/restart", auth, restartKYC);

router.post("/webhook", diditWebhook);

module.exports = router;