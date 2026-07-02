const mongoose = require("mongoose");

const LiveSessionSchema = new mongoose.Schema(
{
    creatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    roomName:{
        type:String,
        required:true,
        unique:true
    },

    title:{
        type:String,
        default:"Untitled Live",
        trim:true
    },

    description:{
        type:String,
        default:""
    },

    category:{
        type:String,
        default:"General"
    },

    thumbnail:{
        type:String,
        default:""
    },

    /* ==========================
       STREAM ACCESS
    ========================== */

    visibility:{
        type:String,
        enum:[
            "public",
            "subscribers",
            "ppv",
            "members"
        ],
        default:"public"
    },

    price:{
        type:Number,
        default:0
    },

    /* ==========================
       STREAM STATUS
    ========================== */

    status:{
        type:String,
        enum:[
            "scheduled",
            "live",
            "ended",
            "cancelled"
        ],
        default:"live"
    },

    scheduled:{
        type:Boolean,
        default:false
    },

    scheduledDate:{
        type:Date,
        default:null
    },

    scheduledTime:{
        type:String,
        default:""
    },

    isLive:{
        type:Boolean,
        default:true
    },

    startedAt:{
        type:Date,
        default:Date.now
    },

    endedAt:{
        type:Date,
        default:null
    },

    /* ==========================
       VIEWER STATS
    ========================== */

    viewers:{
        type:Number,
        default:0
    },

    peakViewers:{
        type:Number,
        default:0
    },

    totalViewers:{
        type:Number,
        default:0
    },

    subscriberViewers:{
        type:Number,
        default:0
    },

    /* ==========================
       ENGAGEMENT
    ========================== */

    likes:{
        type:Number,
        default:0
    },

    comments:{
        type:Number,
        default:0
    },

    shares:{
        type:Number,
        default:0
    },

    /* ==========================
       MONETIZATION
    ========================== */

    tips:{
        type:Number,
        default:0
    },

    earnings:{
        type:Number,
        default:0
    },

    ppvPurchases:{
        type:Number,
        default:0
    },

    subscriberJoins:{
        type:Number,
        default:0
    },

    /* ==========================
       SETTINGS
    ========================== */

    allowChat:{
        type:Boolean,
        default:true
    },

    allowRecording:{
        type:Boolean,
        default:true
    },

    notifyFollowers:{
        type:Boolean,
        default:true
    },

    featured:{
        type:Boolean,
        default:false
    },

    tags:[
        {
            type:String,
            trim:true
        }
    ]
},
{
    timestamps:true
});

module.exports = mongoose.model(
    "LiveSession",
    LiveSessionSchema
);