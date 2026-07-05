const Content = require('../models_/content');
const User = require("../models_/user");
const Subscription = require("../models_/subscription");



exports.getDashboard = async (req, res) => {
    try {

        const totalContent = await Content.countDocuments({
            creatorId: req.user._id
        });

        const recentContent = await Content.find({
            creatorId: req.user._id
        })
        .sort({ createdAt: -1 })
        .limit(5);

        res.json({
            success: true,
            creator: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                coinBalance: req.user.coinBalance,
                isVerifiedCreator: req.user.isVerifiedCreator,
                isKYCVerified: req.user.isKYCVerified
            },
            totalContent,
            totalEarnings: 12450, // TODO: Replace with Payment aggregation
            recentContent
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getMyContent = async (req, res) => {
    try {

        const content = await Content.find({
            creatorId: req.user._id
        })
        .populate("taggedCreators", "name")
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: content.length,
            content
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getProfile = async (req, res) => {
    try {

        res.json({
            success: true,
            creator: req.user
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};


exports.updateProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        user.name = req.body.name ?? user.name;
        user.phoneNumber = req.body.phoneNumber ?? user.phoneNumber;
        user.bio = req.body.bio ?? user.bio;
        user.country = req.body.country ?? user.country;
        user.state = req.body.state ?? user.state;
        user.city = req.body.city ?? user.city;

        user.creatorVerification.stageName =
            req.body.stageName ??
            user.creatorVerification.stageName;

        user.creatorVerification.socialLinks =
            req.body.socialLinks ??
            user.creatorVerification.socialLinks;

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password");

        res.json({
            success: true,
            user: updatedUser
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};
exports.getAnalytics = async (req, res) => {
    try {

        const totalContent = await Content.countDocuments({
            creatorId: req.user._id
        });

        res.json({
            success: true,
            analytics: {
                totalContent,
                totalEarnings: 12450,
                coinBalance: req.user.coinBalance
            }
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

const Collaboration = require("../models_/collaboration");

exports.getCollaborations = async (req, res) => {
    try {

        const collaborations = await Collaboration.find({
            $or: [
                { senderId: req.user._id },
                { receiverId: req.user._id }
            ]
        })
        .populate("senderId", "name")
        .populate("receiverId", "name")
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            collaborations
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getAllCreators = async (req, res) => {
    try {

        const creators = await User.find({
            role: "creator",
            "creatorApproval.status": "approved",
        })

        .select("-password")

        .populate({
            path: "contents",

            match: {
                status: "published",
            },

            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });

        const creatorsWithStats = await Promise.all(

            creators.map(async (creator) => {

                const subscriberCount =
                    await Subscription.countDocuments({
                        creatorId: creator._id,
                        status: "active",
                    });

                return {

                    ...creator.toObject(),

                    subscriberCount,

                    contentCount:
                        creator.contents.length,

                };
            })

        );

        res.json({

            success: true,

            count: creators.length,

            creators: creatorsWithStats,

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};