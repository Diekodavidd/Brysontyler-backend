const User = require("../models_/user");
const Content = require("../models_/content");

exports.getStats = async (req, res) => {
    try {

        const totalFans = await User.countDocuments({
    role: "fan",
});

const totalCreators = await User.countDocuments({
    role: "creator",
});

console.log({
    totalFans,
    totalCreators,
});
        
        const pendingApplications = await User.countDocuments({
    role: "creator",
    "creatorApproval.status": "pending",
});

        const vipMembers = await User.countDocuments({
            "membership.plan": "VIP",
        });

        const eliteMembers = await User.countDocuments({
            "membership.plan": "ELITE",
        });

        const freeMembers = await User.countDocuments({
            "membership.plan": "FREE",
        });

        const totalBrandVideos = await Content.countDocuments({
            type: "brand",
        });

        const pendingContent = await Content.countDocuments({
            status: "pending_review",
        });

        const publishedVideos = await Content.countDocuments({
            status: "published",
        });

        const featuredVideos = await Content.countDocuments({
            featured: true,
        });

        const draftVideos = await Content.countDocuments({
            status: "draft",
        });

        const scheduledVideos = await Content.countDocuments({
            status: "scheduled",
        });

        const pendingCreators = await User.find({
    role: "creator",
    "creatorApproval.status": "pending",
})
    .select(`
        name
        profileImage
        creatorApplication
        creatorApproval
        createdAt
    `)
    .sort({ createdAt: -1 })
    .limit(5);

        const latestUsers = await User.find()
            .select("name role createdAt")
            .sort({ createdAt: -1 })
            .limit(6);

        res.json({
            success: true,

            stats: {
                totalFans,
                totalCreators,
                pendingApplications,
                vipMembers,
                eliteMembers,
                freeMembers,
                totalBrandVideos,
                pendingContent,
                publishedVideos,
                featuredVideos,
                draftVideos,
                scheduledVideos,

                totalRevenue: 0,
                pendingPayouts: 0,
                todaysRevenue: 0,
            },

            pendingCreators,
            latestUsers,
        });
        const users = await User.find().select("name role membership");

console.log(users);

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

exports.approveCreator = async (req, res) => {
    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: "Creator not found.",
            });
        }

        if (user.role !== "creator") {
            return res.status(400).json({
                error: "User is not a creator.",
            });
        }

        if (!user.creatorApproval) {
            user.creatorApproval = {};
        }

        user.creatorApproval.status = "approved";
        user.creatorApproval.reviewedAt = new Date();

        console.log("REQ.USER =", req.user);
console.log("CREATOR =", user.creatorApproval);
        // user.creatorApproval.reviewedBy = req.user._id;
        user.creatorApproval.rejectionReason = "";

        await user.save();

        res.json({
            success: true,
            message: "Creator approved successfully.",
            creatorApproval: user.creatorApproval,
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.rejectCreator = async (req, res) => {
    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: "Creator not found.",
            });
        }

        if (user.role !== "creator") {
            return res.status(400).json({
                error: "User is not a creator.",
            });
        }

        if (!user.creatorApproval) {
            user.creatorApproval = {};
        }

        user.creatorApproval.status = "rejected";
        user.creatorApproval.reviewedAt = new Date();
        // user.creatorApproval.reviewedBy = req.user._id;
        user.creatorApproval.rejectionReason =
            req.body.reason || "";

        await user.save();

        res.json({
            success: true,
            message: "Creator rejected successfully.",
            creatorApproval: user.creatorApproval,
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.getPendingCreators = async (req, res) => {
    try {

        const creators = await User.find({
            role: "creator",
            "creatorApproval.status": "pending",
        })
            .select(
                `
                name
                email
                profileImage
                country
                state
                city
                bio
                createdAt
                didit
                isKYCVerified
                kycStatus
                creatorApplication
                creatorApproval
                `
            )
            .sort({
                "creatorApplication.submittedAt": -1,
            });

        res.json({
            success: true,
            count: creators.length,
            creators,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.getAllFans = async (req, res) => {
    try {

        const fans = await User.find({
            role: "fan",
        })
        .select("-password")
        .sort({
            createdAt: -1,
        });

        res.json({
            success: true,
            fans,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.getAllCreators = async (req, res) => {
    try {

        const creators = await User.find({
            role: "creator",
        })
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            creators,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};


exports.getMemberships = async (req, res) => {
    try {

        const members = await User.find({
            role: "fan",
        })
            .select("-password")
            .sort({
                createdAt: -1,
            });

        const stats = {
            total: members.length,

            free: members.filter(
                (m) => m.membership?.plan === "FREE"
            ).length,

            vip: members.filter(
                (m) => m.membership?.plan === "VIP"
            ).length,

            elite: members.filter(
                (m) => m.membership?.plan === "Elite"
            ).length,

            active: members.filter(
                (m) => m.membership?.status === "active"
            ).length,

            expired: members.filter(
                (m) => m.membership?.status === "expired"
            ).length,
        };

        res.json({
            success: true,
            members,
            stats,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};