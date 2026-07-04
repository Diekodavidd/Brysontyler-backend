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


membership: {

    plan: {
        type: String,
        enum: ["FREE", "VIP", "Elite"],
        default: "FREE"
    },

    status: {
        type: String,
        default: "active"
    },

    startDate: Date,

    endDate: Date

},
    // ==========================
    // CREATOR
    // ==========================

   creatorApplication: {

    stageName: {
        type: String,
        default: "",
    },

    category: {
        type: String,
        default: "",
    },

    socialLinks: [
        {
            type: String,
        },
    ],

    submittedAt: Date,

},

creatorApproval: {

    status: {
        type: String,
        enum: [
            "not_submitted",
            "pending",
            "approved",
            "rejected",
        ],
        default: "not_submitted",
    },

    reviewedAt: Date,

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    rejectionReason: {
        type: String,
        default: "",
    },

},


    // ==========================
    // COINS
    // ==========================

    coinBalance: {
        type: Number,
        default: 0
    },


// ==========================
// FAN SETTINGS
// ==========================

preferences: {

    darkMode: {
        type: Boolean,
        default: true
    },

    autoplay: {
        type: Boolean,
        default: true
    },

    emailNotifications: {
        type: Boolean,
        default: true
    },

    pushNotifications: {
        type: Boolean,
        default: true
    }

},

paymentMethods: [

    {

        provider: String,

        accountName: String,

        accountNumber: String,

        walletAddress: String,

        isDefault: {
            type: Boolean,
            default: false
        }

    }

],
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