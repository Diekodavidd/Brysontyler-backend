const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messageType: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
      ],
      default: "text",
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    attachment: {
      url: String,
      publicId: String,
      mimeType: String,
      size: Number,
    },

    read: {
      type: Boolean,
      default: false,
    },

    edited: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
MessageSchema.index({
    sender: 1,
});

MessageSchema.index({
    receiver: 1,
});
MessageSchema.index({
    conversationId: 1,
    createdAt: 1,
});
MessageSchema.index({
    createdAt: -1,
});
module.exports = mongoose.model(
  "Message",
  MessageSchema
);