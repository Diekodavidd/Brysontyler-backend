const User = require("../models_/user");
const Content = require("../models_/content");

exports.getStats = async (req, res) => {
    try {

        const totalUsers = await User.countDocuments();

        const totalCreators = await User.countDocuments({
            role: "creator",
        });

        const totalContent = await Content.countDocuments();

        const pendingContent = await Content.countDocuments({
            status: "pending_review",
        });

        const publishedContent = await Content.countDocuments({
            status: "published",
        });

        res.json({
            success: true,
            totalUsers,
            totalCreators,
            totalContent,
            pendingContent,
            publishedContent,
            totalRevenue: 124500, // TODO: Replace with Payment aggregation
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.getAllUsers = async (req, res) => {
    try {

        const users = await User.find()
            .select("-password")
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            users,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.getAllContent = async (req, res) => {
    try {

        const content = await Content.find()
            .populate("creatorId", "name email profileImage")
            .populate("approvedCollaborators", "name")
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            content,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.getPendingContent = async (req, res) => {
    try {

        const content = await Content.find({
            status: "pending_review",
        })
            .populate("creatorId", "name email profileImage")
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            count: content.length,
            content,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.approveContent = async (req, res) => {
    try {

        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                error: "Content not found.",
            });
        }

        content.status = "scheduled";
        content.reviewedBy = req.user._id;
        content.reviewedAt = new Date();

        await content.save();

        res.json({
            success: true,
            message: "Content approved successfully.",
            content,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.rejectContent = async (req, res) => {
    try {

        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                error: "Content not found.",
            });
        }

        content.status = "rejected";
        content.reviewComment = req.body.comment || "";
        content.reviewedBy = req.user._id;
        content.reviewedAt = new Date();

        await content.save();

        res.json({
            success: true,
            message: "Content rejected.",
            content,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.requestChanges = async (req, res) => {
    try {

        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                error: "Content not found.",
            });
        }

        content.status = "changes_requested";
        content.reviewComment = req.body.comment || "";
        content.reviewedBy = req.user._id;
        content.reviewedAt = new Date();

        await content.save();

        res.json({
            success: true,
            message: "Changes requested.",
            content,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.publishScheduledContent = async (req, res) => {
    try {

        const contents = await Content.find({
            status: "scheduled",
            releaseDate: {
                $lte: new Date(),
            },
        });

        for (const content of contents) {
            content.status = "published";
            await content.save();
        }

        res.json({
            success: true,
            published: contents.length,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};