const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: "",
  },

  fileUrl: {
    type: String,
    required: true,
  },

  thumbnail: {
    type: String,
    default: "",
  },
previewUrl: {
    type: String,
    default: "",
},

previewStorageKey: {
    type: String,
    default: "",
},
geoBlocking: {
    enabled: {
        type: Boolean,
        default: false,
    },

    blockedCountries: [{
        type: String,
    }],
},
ownerType: {
    type: String,
    enum: ["creator", "brand"],
    default: "creator",
},

mediaType: {
    type: String,
    enum: ["video", "image"],
    default: "video",
},

brandCollection: {
    type: String,
    default: "",
},

membership: {
    type: String,
    enum: ["free", "vip", "elite"],
    default: "free",
},

duration: {
    type: Number,
    default: 0,
},

views: {
    type: Number,
    default: 0,
},
  storageProvider:{
    type:String,
    default:"bunny"
},

storageKey:{
    type:String,
    required:true
},

  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  taggedCreators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
approvedCollaborators: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],

consentRequired: {
  type: Boolean,
  default: false,
},

participantConsentStatus: {
  type: String,
  enum: [
    "not_required",
    "pending",
    "under_review",
    "approved",
    "rejected",
  ],
  default: "not_required",
},
  category: {
    type: String,
    default: "General",
  },

  tags: [
    {
      type: String,
    },
  ],

  visibility: {
    type: String,
    enum: [
      "free",
      "subscribers",
      "ppv",
      "members_ppv",
    ],
    default: "free",
  },

  price: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: [
      "draft",
      "pending_review",
      "approved",
      "scheduled",
      "published",
      "rejected",
    ],
    default: "pending_review",
  },

  releaseDate: {
    type: Date,
  },

  featured: {
    type: Boolean,
    default: false,
  },

  allowComments: {
    type: Boolean,
    default: true,
  },
reviewComment: {
    type: String,
    default: "",
},

reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
},

reviewedAt: {
    type: Date,
    default: null,
},
  protection: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Content", ContentSchema);