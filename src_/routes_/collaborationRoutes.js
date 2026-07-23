const express = require("express");
const router = express.Router();

const {
    sendCollaborationRequest,
    respondToCollaboration,
    tagCollaborator,
    getMyRequests,
    getIncomingRequests,
    getCollaborationById,
    cancelCollaborationRequest,
    discoverCreators,
} = require("../controllers_/collaborationController");

const auth = require("../middleware_/authMiddleware");
const role = require("../middleware_/roleMiddleware");


/* =====================================================
   DISCOVER CREATORS
   IMPORTANT:
   This MUST come before /:id
===================================================== */

router.get(
    "/discover",
    auth,
    role(["creator"]),
    discoverCreators
);


/* =====================================================
   COLLABORATION REQUESTS
===================================================== */

router.post(
    "/request",
    auth,
    role(["creator"]),
    sendCollaborationRequest
);

router.post(
    "/respond",
    auth,
    role(["creator"]),
    respondToCollaboration
);

router.post(
    "/tag",
    auth,
    role(["creator"]),
    tagCollaborator
);


/* =====================================================
   MY REQUESTS
===================================================== */

router.get(
    "/my-requests",
    auth,
    role(["creator"]),
    getMyRequests
);

router.get(
    "/incoming",
    auth,
    role(["creator"]),
    getIncomingRequests
);


/* =====================================================
   SINGLE COLLABORATION
   MUST BE AFTER STATIC ROUTES
===================================================== */

router.get(
    "/:id",
    auth,
    role(["creator"]),
    getCollaborationById
);

router.delete(
    "/:id",
    auth,
    role(["creator"]),
    cancelCollaborationRequest
);


module.exports = router;