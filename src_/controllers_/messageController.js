const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

const { containsRestrictedContent } = require("../utils/chatFilter");

// Replace this with your own upload helper later.
const uploadToCloudinary =
  require("../utils/uploadToCloudinary");

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
    await uploadToCloudinary(file.path);

  return {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
    mimeType: file.mimetype,
    size: file.size,
  };
}

/*
==========================================
SEND MESSAGE
==========================================
*/

exports.sendMessage = async (
  req,
  res
) => {
  try {
    const senderId = req.user.id;

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

