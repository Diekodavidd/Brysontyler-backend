const mongoose = require("mongoose");

const LiveSessionSchema = new mongoose.Schema({

    creatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    roomName:{
        type:String,
        required:true
    },

    title:{
        type:String,
        default:"Untitled Live"
    },

    isLive:{
        type:Boolean,
        default:true
    },

    viewers:{
        type:Number,
        default:0
    }

},{
    timestamps:true
});

module.exports = mongoose.model(
    "LiveSession",
    LiveSessionSchema
);