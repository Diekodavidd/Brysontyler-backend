const express = require('express');
const router = express.Router();
const {
    sendCollaborationRequest,
    respondToCollaboration,
    tagCollaborator,
    getMyRequests,
    getIncomingRequests,
    getCollaborationById,
    cancelCollaborationRequest
} = require("../controllers_/collaborationController");
const auth = require('../middleware_/authMiddleware');
const role = require('../middleware_/roleMiddleware');

router.post("/request", auth, role(["creator"]), sendCollaborationRequest);

router.post("/respond", auth, role(["creator"]), respondToCollaboration);

router.post("/tag", auth, role(["creator"]), tagCollaborator);

router.get("/my-requests", auth, role(["creator"]), getMyRequests);

router.get("/incoming", auth, role(["creator"]), getIncomingRequests);

router.get("/:id", auth, role(["creator"]), getCollaborationById);

router.delete("/:id", auth, role(["creator"]), cancelCollaborationRequest);

module.exports = router;