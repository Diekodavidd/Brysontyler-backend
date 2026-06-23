const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getMyContent,
    getProfile,
    updateProfile,
    getAnalytics,
    getCollaborations
} = require("../controllers_/creatorController");
const auth = require('../middleware_/authMiddleware');
const role = require('../middleware_/roleMiddleware');

router.get("/dashboard", auth, role(["creator"]), getDashboard);

router.get("/my-content", auth, role(["creator"]), getMyContent);

router.get("/profile", auth, role(["creator"]), getProfile);

router.patch("/profile", auth, role(["creator"]), updateProfile);

router.get("/analytics", auth, role(["creator"]), getAnalytics);

router.get("/collaborations", auth, role(["creator"]), getCollaborations);

module.exports = router;