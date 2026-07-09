const express = require("express");
const router = express.Router();

const auth = require("../middleware_/authMiddleware");
const canMessageCreator = require("../middleware_/canMessageCreator");
const multer = require("multer");

// const upload = require("../middleware_/upload"); // multer middleware
const upload = multer({
    dest: "uploads/",
});

const messageController = require("../controllers_/messageController");

/*
========================================
SEND MESSAGE
========================================
Fan must:
- Have VIP/ELITE membership
- Be subscribed to creator

Creators can always reply.
*/

router.post(
    "/send",
    auth,
        upload.single("attachment"),
    canMessageCreator,
    messageController.sendMessage
);

/*
========================================
GET ALL CONVERSATIONS
========================================
*/

router.get(
    "/conversations",
    auth,
    messageController.getConversations
);


router.get(
    "/subscribers",
    auth,
    messageController.getSubscribedFans
);
/*
========================================
GET MESSAGES
========================================
*/
router.get(
  "/discover",
  auth,
  messageController.getDiscoverCreators
);
router.get(
    "/conversation/:conversationId",
    auth,
    messageController.getConversationMessages
);

/*
========================================
MARK AS READ
========================================
*/

router.patch(
    "/conversation/:conversationId/read",
    auth,
    messageController.markConversationRead
);

/*
========================================
EDIT MESSAGE
========================================
*/

router.patch(
    "/:messageId",
    auth,
    messageController.editMessage
);

/*
========================================
DELETE MESSAGE
========================================
*/

router.delete(
    "/:messageId",
    auth,
    messageController.deleteMessage
);

module.exports = router;