const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    fanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },

    lastSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lastMessageAt: Date,

    unreadFan: {
      type: Number,
      default: 0,
    },

    unreadCreator: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
Only ONE conversation
between a fan and creator.
*/

ConversationSchema.index(
  {
    fanId: 1,
    creatorId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Conversation",
  ConversationSchema
);