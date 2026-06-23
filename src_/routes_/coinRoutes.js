const express = require('express');
const router = express.Router();
const { purchaseCoins, tipCreator } = require('../controllers_/coinController');
const auth = require('../middleware_/authMiddleware');
const { getBalance } = require('../controllers_/coinController');

router.post('/purchase', auth, purchaseCoins);
router.post('/tip', auth, tipCreator);
router.get('/balance', auth, getBalance);


module.exports = router;
