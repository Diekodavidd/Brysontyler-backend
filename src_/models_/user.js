const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

    // ==========================
    // BASIC ACCOUNT
    // ==========================

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["fan", "creator", "admin"],
        default: "fan"
    },

    createdAt: {
        type: Date,
        default: Date.now
    },



    // ==========================
    // PROFILE
    // ==========================

    phoneNumber: String,

    dateOfBirth: Date,

    gender: String,

    country: String,

    state: String,

    city: String,

    bio: String,

    profileImage: String,

    coverImage: String,

    profileCompleted: {
        type: Boolean,
        default: false
    },



    // ==========================
    // CREATOR
    // ==========================

    creatorVerification: {

        stageName: String,

        category: String,

        socialLinks: [String],

        verified: {
            type: Boolean,
            default: false
        }

    },

    isVerifiedCreator: {
        type: Boolean,
        default: false
    },



    // ==========================
    // COINS
    // ==========================

    coinBalance: {
        type: Number,
        default: 0
    },



    // ==========================
    // KYC
    // (KEEP THESE FOR OLD CONTROLLERS)
    // ==========================

    isKYCVerified: {
        type: Boolean,
        default: false
    },

    kycStatus: {
        type: String,
        enum: [
            "not_started",
            "pending",
            "approved",
            "rejected"
        ],
        default: "not_started"
    },

    kycVerifiedAt: Date,



    // ==========================
    // DIDIT
    // (NEW)
    // ==========================

    didit: {

        workflowId: String,

        sessionId: String,

        sessionToken: String,

        verificationUrl: String,

        status: {
            type: String,
            default: "not_started"
        },

        verifiedAt: Date

    }

});

module.exports = mongoose.model("User", UserSchema);