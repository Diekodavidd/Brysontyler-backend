const Conversation = require("../models_/conversation");
const Message = require("../models_/message");
const subscription = require("../models_/subscription");
const User = require("../models_/user");
const { emitToUser } = require("../socket/socket");

const { containsRestrictedContent } = require("../utils_/chatFilter");

// Replace this with your own upload helper later.
const cloudinary =
  require("../utils_/cloudinary");

/*
==========================================
HELPER
==========================================
*/

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",

  "video/mp4",
  "video/webm",
  "video/quicktime",
];

async function uploadAttachment(file) {
  if (!file) return null;

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(
      "Only images and videos are allowed."
    );
  }

  /*
  Replace with your own Cloudinary helper.
  */

  const uploaded =
    await cloudinary(file.path);

  return {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
    mimeType: file.mimetype,
    size: file.size,
  };
}



exports.sendMessage = async (
  req,
  res
) => {
  try {
    const senderId = req.user.id;
console.log("BODY:", req.body);
console.log("FILE:", req.file);
    const {
      creatorId,
      text = "",
    } = req.body;

    /*
    ----------------------------------
    Validation
    ----------------------------------
    */

    if (!creatorId) {
      return res.status(400).json({
        success: false,
        message:
          "Creator ID is required.",
      });
    }

    if (
      !text.trim() &&
      !req.file
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message cannot be empty.",
      });
    }

    /*
    ----------------------------------
    Prevent phone numbers,
    links etc.
    ----------------------------------
    */

    if (
      text &&
      containsRestrictedContent(text)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Messages cannot contain contact information.",
      });
    }

    /*
    ----------------------------------
    Sender
    ----------------------------------
    */

    const sender =
      await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message:
          "Sender not found.",
      });
    }

    /*
    ----------------------------------
    Receiver
    ----------------------------------
    */

    let receiverId;

    /*
    Fan sending
    */

    if (
      sender.role === "fan"
    ) {
      receiverId =
        creatorId;
    }

    /*
    Creator replying
    */

    else {

      receiverId =
        req.body.fanId;

      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message:
            "Fan ID is required.",
        });
      }

    }

    /*
    ----------------------------------
    Prevent messaging yourself
    ----------------------------------
    */

    if (
      senderId.toString() ===
      receiverId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot message yourself.",
      });
    }

    /*
    ----------------------------------
    Conversation
    ----------------------------------
    */

    let conversation =
      await Conversation.findOne({
        fanId:
          sender.role === "fan"
            ? senderId
            : receiverId,

        creatorId:
          sender.role === "creator"
            ? senderId
            : creatorId,
      });

    /*
    Auto create
    */

    if (!conversation) {

      conversation =
        await Conversation.create({

          members: [
            sender.role === "fan"
              ? senderId
              : receiverId,

            sender.role === "creator"
              ? senderId
              : creatorId,
          ],

          fanId:
            sender.role === "fan"
              ? senderId
              : receiverId,

          creatorId:
            sender.role === "creator"
              ? senderId
              : creatorId,

          lastMessage: "",

          lastMessageAt:
            new Date(),

        });

    }

    /*
    ----------------------------------
    Upload attachment
    ----------------------------------
    */

    let attachment =
      null;

    let messageType =
      "text";

    if (req.file) {

      attachment =
        await uploadAttachment(
          req.file
        );

      if (
        attachment.mimeType.startsWith(
          "image"
        )
      ) {
        messageType =
          "image";
      }

      if (
        attachment.mimeType.startsWith(
          "video"
        )
      ) {
        messageType =
          "video";
      }

    }

    /*
    ----------------------------------
    Save message
    ----------------------------------
    */

    const message =
      await Message.create({

        conversationId:
          conversation._id,

        sender:
          senderId,

        receiver:
          receiverId,

        messageType,

        text,

        attachment,

      });
await message.populate(
    "sender",
    "_id name profileImage"
);
    /*
    ----------------------------------
    Update conversation
    ----------------------------------
    */

    conversation.lastSender =
      senderId;

    conversation.lastMessage =
      text ||
      (messageType === "image"
        ? "📷 Image"
        : "🎥 Video");

    conversation.lastMessageType =
      messageType;

    conversation.lastMessageAt =
      new Date();

    if (
      sender.role === "fan"
    ) {
      conversation.unreadCreator++;
    } else {
      conversation.unreadFan++;
    }

    await conversation.save();
emitToUser (receiverId, "new-message", {
    conversationId: conversation._id,
    message,
});

emitToUser(receiverId, "conversation-updated", conversation);
    /*
    Socket event
    will go here later.
    */

    return res.status(201).json({

      success: true,

      message:
        "Message sent successfully.",

      data: message,

      conversation,

    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      success: false,

      message:
        err.message ||
        "Failed to send message.",

    });

  }
};

exports.getConversations = async (req, res) => {

    try {

        const user = req.user;

        const query =
            user.role === "creator"
                ? { creatorId: user._id }
                : { fanId: user._id };

        const conversations =
            await Conversation.find(query)

                .populate(
                    "fanId",
                    "_id name profileImage"
                )

                .populate(
                    "creatorId",
                    "_id name stageName profileImage"
                )

                .sort({
                    lastMessageAt: -1,
                });

        return res.json({

            success: true,

            conversations,

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

exports.getConversationMessages = async (
    req,
    res
) => {
console.log(req.user);
    try {

        

        const conversation =
            await Conversation.findById(
                req.params.conversationId
            );

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message:
                    "Conversation not found.",

            });

        }

        if (
            !conversation.members.some(
                member =>
                    member.toString() ===
                    req.user._id.toString()
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Unauthorized.",

            });

        }

        const messages =
            await Message.find({

                conversationId:
                    conversation._id,

            })

                .populate(
                    "sender",
                    "_id name profileImage"
                )

                .populate(
                    "receiver",
                    "_id name profileImage"
                )

                .sort({

                    createdAt: 1,

                });

        return res.json({

            success: true,

            messages,

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

exports.markConversationRead = async (
    req,
    res
) => {

    try {

       

        const conversation =
            await Conversation.findById(
                req.params.conversationId
            );

        if (!conversation) {

            return res.status(404).json({

                success: false,

                message:
                    "Conversation not found.",

            });

        }

        await Message.updateMany(

            {

                conversationId:
                    conversation._id,

                receiver:
                    req.user._id,

                read: false,

            },

            {

                $set: {

                    read: true,

                },

            }

        );

        if (req.user.role === "fan") {

            conversation.unreadFan = 0;

        } else {

            conversation.unreadCreator = 0;

        }

        await conversation.save();

        return res.json({

            success: true,

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

exports.editMessage = async (
    req,
    res
) => {

    try {

   

        const { text } = req.body;

        const message =
            await Message.findById(
                req.params.messageId
            );

        if (!message) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found.",

            });

        }

        if (
            message.sender.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Unauthorized.",

            });

        }

        message.text = text;

        message.edited = true;

        await message.save();

        return res.json({

            success: true,

            message,

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

exports.deleteMessage = async (
    req,
    res
) => {

    try {

        

        const message =
            await Message.findById(
                req.params.messageId
            );

        if (!message) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found.",

            });

        }

        if (
            message.sender.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Unauthorized.",

            });

        }

        message.deleted = true;

        message.text = "";

        message.attachment = undefined;

        await message.save();

        return res.json({

            success: true,

            message:
                "Message deleted.",

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

exports.getDiscoverCreators = async (req, res) => {
  try {

    const creators = await User.find({
      role: "creator",
      "creatorApproval.status": "approved",
    }).select(
      "name profileImage bio creatorApplication.stageName"
    );

    const subscriptions = await subscription.find({
      fanId: req.user._id,
      status: "active",
      endDate: { $gt: new Date() },
    }).select("creatorId");

    const subscribedIds = subscriptions.map((s) =>
      s.creatorId.toString()
    );

    const result = creators.map((creator) => ({
      ...creator.toObject(),
      subscribed: subscribedIds.includes(
        creator._id.toString()
      ),
    }));

    res.json({
      success: true,
      creators: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getSubscribedFans = async (req, res) => {
    try {
        const creatorId = req.user._id;

        const subscriptions = await subscription.find({
            creatorId,
            status: "active",
        }).populate(
            "fanId",
            "_id name profileImage username creatorApplication"
        );

        const fans = subscriptions
            .map(sub => sub.fanId)
            .filter(Boolean);

        res.json({
            success: true,
            fans,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};