const mongoose = require("mongoose");

const ContentParticipantSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    participantType: {
      type: String,
      enum: [
        "platform_creator",
        "external_model",
      ],
      required: true,
    },

    consentStatus: {
      type: String,
      enum: [
        "not_required",
        "pending",
        "uploaded",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    // Cloudinary URL
    consentDocumentUrl: {
      type: String,
      default: "",
    },

    // Cloudinary public_id
    consentCloudinaryId: {
      type: String,
      default: "",
    },

    consentDocumentName: {
      type: String,
      default: "",
    },

    consentUploadedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ContentParticipant",
  ContentParticipantSchema
);