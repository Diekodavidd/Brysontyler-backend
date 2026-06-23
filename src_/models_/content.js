const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

       fileUrl: {
    type: String,
    required: true
},

cloudinaryId: {
    type: String,
    required: true
},

        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        taggedCreators: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        approvedCollaborators: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        protection: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Content", ContentSchema);