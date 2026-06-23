const express = require("express");

const router = express.Router();

const auth = require("../middleware_/authMiddleware");

const {

    shareContent,

    shareProfile,

    shareCreator,

    shareLiveSession,

    shareModel

} = require("../controllers_/twitterController");

router.post(
    "/share",
    auth,
    shareContent
);

router.get(
    "/profile",
    auth,
    shareProfile
);

router.get(
    "/creator/:creatorId",
    auth,
    shareCreator
);

router.get(
    "/live/:id",
    auth,
    shareLiveSession
);

router.get(
    "/model/:id",
    auth,
    shareModel
);

module.exports = router;