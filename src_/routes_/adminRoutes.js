const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, getAllContent } = require('../controllers_/adminController');
const auth = require('../middleware_/authMiddleware');
const role = require('../middleware_/roleMiddleware');

router.get('/stats', auth, role(['admin']), getStats);
router.get('/users', auth, role(['admin']), getAllUsers);
router.get('/content', auth, role(['admin']), getAllContent);

module.exports = router;