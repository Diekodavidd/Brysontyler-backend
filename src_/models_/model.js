const mongoose = require("mongoose");

const ModelSchema = new mongoose.Schema(
    {
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        stageName: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        photos: {
            type: [String],
            default: []
        },

        verificationDocuments: {
            type: [String],
            default: []
        },

        consentFormUrl: String,

        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        approvedByModel: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Model", ModelSchema);