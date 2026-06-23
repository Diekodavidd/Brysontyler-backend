const Subscription = require('../models_/subscription');
const User = require("../models_/user");

exports.subscribeToCreator = async (req,res)=>{

    try{

        const { creatorId, amount } = req.body;

        if(!creatorId || !amount || amount <=0){

            return res.status(400).json({
                error:"Creator and amount are required."
            });

        }

        if(creatorId === req.user._id.toString()){

            return res.status(400).json({
                error:"You cannot subscribe to yourself."
            });

        }

        const creator = await User.findById(creatorId);

        if(!creator){

            return res.status(404).json({
                error:"Creator not found."
            });

        }

        if(creator.role !== "creator"){

            return res.status(400).json({
                error:"User is not a creator."
            });

        }

        const existingSubscription = await Subscription.findOne({

            fanId:req.user._id,

            creatorId,

            status:"active"

        });

        if(existingSubscription){

            return res.status(400).json({
                error:"You are already subscribed."
            });

        }

        const subscription = await Subscription.create({

            fanId:req.user._id,

            creatorId,

            amount,

            status:"active",

            endDate:new Date(
                Date.now() + 30*24*60*60*1000
            )

        });

        res.status(201).json({

            success:true,

            subscription

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

exports.getMySubscriptions = async (req,res)=>{

    try{

        const subscriptions = await Subscription.find({

            fanId:req.user._id

        })

        .populate("creatorId","name")

        .sort({

            createdAt:-1

        });

        res.json({

            success:true,

            count:subscriptions.length,

            subscriptions

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

exports.getSubscriptionById = async (req,res)=>{

    try{

        const subscription = await Subscription.findById(req.params.id)
        .populate("creatorId","name");

        if(!subscription){

            return res.status(404).json({
                error:"Subscription not found."
            });

        }

        if(subscription.fanId.toString() !== req.user._id.toString()){

            return res.status(403).json({
                error:"Unauthorized."
            });

        }

        res.json({

            success:true,

            subscription

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

exports.cancelSubscription = async (req,res)=>{

    try{

        const subscription = await Subscription.findById(req.params.id);

        if(!subscription){

            return res.status(404).json({
                error:"Subscription not found."
            });

        }

        if(subscription.fanId.toString() !== req.user._id.toString()){

            return res.status(403).json({
                error:"Unauthorized."
            });

        }

        subscription.status="cancelled";

        await subscription.save();

        res.json({

            success:true,

            message:"Subscription cancelled."

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

exports.renewSubscription = async (req,res)=>{

    try{

        const subscription = await Subscription.findById(req.params.id);

        if(!subscription){

            return res.status(404).json({
                error:"Subscription not found."
            });

        }

        if(subscription.fanId.toString() !== req.user._id.toString()){

            return res.status(403).json({
                error:"Unauthorized."
            });

        }

        subscription.status="active";

        subscription.endDate = new Date(

            Date.now() + 30*24*60*60*1000

        );

        await subscription.save();

        res.json({

            success:true,

            subscription

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

exports.checkSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            fanId: req.user._id,
            creatorId: req.params.creatorId,
            status: "active"
        });

        res.json({
            success: true,
            subscribed: !!subscription,
            subscription
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getCreatorSubscribers = async (req,res)=>{

    try{

        const subscribers = await Subscription.find({

            creatorId:req.user._id,

            status:"active"

        })

        .populate("fanId","name email")

        .sort({

            createdAt:-1

        });

        res.json({

            success:true,

            count:subscribers.length,

            subscribers

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};