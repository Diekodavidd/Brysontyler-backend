const express = require('express');
const router = express.Router();
const { addModel, getMyModels,getModelById,updateModel, deleteModel, sendModelApprovalLink, approveModel, rejectModel } = require('../controllers_/modelController');
const auth = require('../middleware_/authMiddleware');
const role = require('../middleware_/roleMiddleware');

router.post("/", auth, role(["creator"]), addModel);

router.get("/my-models", auth, role(["creator"]), getMyModels);

router.get("/:id", auth, role(["creator"]), getModelById);

router.patch("/:id", auth, role(["creator"]), updateModel);

router.delete("/:id", auth, role(["creator"]), deleteModel);

router.post("/send-approval-link", auth, role(["creator"]), sendModelApprovalLink);

router.get("/approve/:modelId", approveModel);

router.get("/reject/:modelId", rejectModel);

module.exports = router;