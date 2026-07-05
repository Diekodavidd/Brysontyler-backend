const express = require("express");
const router = express.Router();

const auth = require("../middleware_/authMiddleware");

const {
    createMembership,
    getMembership,
    membershipWebhook,
} = require("../controllers_/membershipController");

router.post(
    "/create",
    auth,
    createMembership
);

router.get(
    "/me",
    auth,
    getMembership
);

router.post(
    "/webhook",
    membershipWebhook
);



module.exports = router;