const express = require('express');
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    changePassword, 
    getMe
} = require('../controllers_/authController');
const auth = require('../middleware_/authMiddleware');
// const { getMe } = require('../controllers_/authController'?);

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', auth, changePassword);
router.get('/me', auth, getMe)

module.exports = router;