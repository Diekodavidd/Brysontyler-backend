const Content = require('../models_/content');

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

        if (req.body.name) {
            user.name = req.body.name.trim();
        }

        await user.save();

        res.json({
            success: true,
            user
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

