const express = require("express");
const router = express.Router();

const {
    createLiveSession,
    getLiveSessions,
    getMySessions,
    getLiveSessionById,
    joinLiveSession,
    leaveLiveSession,
    endLiveSession,likeLive,tipLive,deleteLiveSession
} = require("../controllers_/liveController");

const auth = require("../middleware_/authMiddleware");
const role = require("../middleware_/roleMiddleware");

router.post(
    "/create",
    auth,
    role(["creator"]),
    createLiveSession
);

router.get(
    "/",
    auth,
    getLiveSessions
);

router.get(
    "/my-sessions",
    auth,
    role(["creator"]),
    getMySessions
);

router.get(
    "/:id",
    auth,
    getLiveSessionById
);

router.post(
    "/:id/join",
    auth,
    joinLiveSession
);

router.post(
    "/:id/leave",
    auth,
    leaveLiveSession
);

router.patch(
    "/end/:id",
    auth,
    role(["creator"]),
    endLiveSession
);

router.delete(
    "/delete/:id",
    auth,
    deleteLiveSession
);
router.post("/:id/like", auth, likeLive);

router.post("/:id/tip", auth, tipLive);
module.exports = router;