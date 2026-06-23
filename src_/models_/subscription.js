const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
{
    fanId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    creatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    amount:{
        type:Number,
        required:true,
        min:0
    },

    status:{
        type:String,
        enum:[
            "active",
            "expired",
            "cancelled"
        ],
        default:"active"
    },

    startDate:{
        type:Date,
        default:Date.now
    },

    endDate:{
        type:Date,
        required:true
    }

},
{
    timestamps:true
});

SubscriptionSchema.index(
{
    fanId:1,
    creatorId:1
});

module.exports = mongoose.model(
    "Subscription",
    SubscriptionSchema
);