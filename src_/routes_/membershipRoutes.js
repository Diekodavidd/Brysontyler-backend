const express = require("express");
const router = express.Router();

const auth = require("../middleware_/authMiddleware");

const {
    createMembership,
    getMembership,} = require("../controllers_/membershipController");

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





module.exports = router;