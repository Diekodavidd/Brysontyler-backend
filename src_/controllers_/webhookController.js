const User = require('../models_/user');
const Subscription = require('../models_/subscription');
const crypto = require("crypto");
const Payment = require("../models_/payment");


exports.nowPaymentsWebhook = async (req, res) => {

    try {

        // Verify webhook signature
        const signature = req.headers["x-nowpayments-sig"];

        if (!signature) {
            return res.status(401).json({
                error: "Missing webhook signature."
            });
        }

        // NOTE:
        // Replace this with NOWPayments' official signature verification
        // using your IPN secret from their documentation.

        const {

            payment_status,

            order_id,

            payment_id,

            price_amount

        } = req.body;

        if (!order_id) {

            return res.status(400).json({
                error: "Missing order ID."
            });

        }

        const payment = await Payment.findOne({

            orderId: order_id

        });

        if (!payment) {

            return res.status(404).json({
                error: "Payment not found."
            });

        }

        // Prevent duplicate processing

        if (payment.paymentStatus === "confirmed") {

            return res.sendStatus(200);

        }

        payment.paymentId = payment_id;

        payment.paymentStatus = payment_status;

        await payment.save();

        if (payment_status !== "finished") {

            return res.sendStatus(200);

        }

        // Subscription purchase

        if (payment.paymentType === "subscription") {

            await Subscription.findOneAndUpdate(

                {

                    fanId: payment.userId,

                    creatorId: payment.creatorId

                },

                {

                    status: "active",

                    amount: payment.amount,

                    startDate: new Date(),

                    endDate: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    )

                },

                {

                    upsert: true,

                    new: true

                }

            );

        }

        // Coin purchase

        if (payment.paymentType === "coin_purchase") {

            const coins = Math.floor(price_amount * 10);

            await User.findByIdAndUpdate(

                payment.userId,

                {

                    $inc: {

                        coinBalance: coins

                    }

                }

            );

        }

        res.sendStatus(200);

    }

    catch (error) {

        console.error(error);

        res.sendStatus(500);

    }

};




exports.getPaymentStatus = async (req,res)=>{

    try{

        const payment = await Payment.findById(req.params.id);

        if(!payment){

            return res.status(404).json({

                error:"Payment not found."

            });

        }

        res.json({

            success:true,

            status:payment.paymentStatus

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

exports.verifySubscription = async (req,res)=>{

    try{

        const subscription = await Subscription.findOne({

            fanId:req.user._id,

            creatorId:req.params.creatorId,

            status:"active",

            endDate:{

                $gt:new Date()

            }

        });

        res.json({

            active:!!subscription

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

