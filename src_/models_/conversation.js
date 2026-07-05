const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
{
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    fanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    lastMessage: String,

    lastMessageAt: Date,

    lastSender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    unreadCreator:{
        type:Number,
        default:0,
    },

    unreadFan:{
        type:Number,
        default:0,
    }

},
{
timestamps:true
});

module.exports =
mongoose.model("Conversation", ConversationSchema);