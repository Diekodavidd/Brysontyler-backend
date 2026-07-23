const User = require("../models_/user");
const Content = require("../models_/content");
const Subscription = require("../models_/subscription");
const Payment = require("../models_/payment");
const createNotification = require("../utils_/createNotification");

exports.getStats = async (req, res) => {
  try {
    // =========================================
    // BASIC STATS
    // =========================================

    const totalFans = await User.countDocuments({
      role: "fan",
    });

    const totalCreators = await User.countDocuments({
      role: "creator",
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
      ownerType: "brand",
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


    // =========================================
    // PENDING CREATORS
    // =========================================

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


    // =========================================
    // LATEST USERS
    // =========================================

    const latestUsers = await User.find()
      .select("name role createdAt")
      .sort({ createdAt: -1 })
      .limit(6);


    // =========================================
    // NOTIFICATIONS
    // =========================================

    const notifications = [];


    // -----------------------------------------
    // NEW USER SIGNUPS
    // -----------------------------------------

    const newUsers = await User.find()
      .select("name role createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    newUsers.forEach((user) => {
      notifications.push({
        id: `signup-${user._id}`,
        type: "signup",
        title: "New User Registered",
        message: `${user.name} joined as a ${user.role}.`,
        userId: user._id,
        userName: user.name,
        createdAt: user.createdAt,
        unread: true,
      });
    });


    // -----------------------------------------
    // CREATOR APPLICATIONS
    // -----------------------------------------

    const creatorApplications = await User.find({
      role: "creator",
      "creatorApproval.status": {
        $in: ["pending", "approved", "rejected"],
      },
    })
      .select(
        "name creatorApplication creatorApproval createdAt"
      )
      .sort({
        "creatorApplication.submittedAt": -1,
      })
      .limit(20);

    creatorApplications.forEach((creator) => {
      const submittedAt =
        creator.creatorApplication?.submittedAt ||
        creator.createdAt;

      notifications.push({
        id: `creator-${creator._id}`,
        type: "creator",
        title: "Creator Application Submitted",
        message: `${creator.name} submitted a creator application for approval.`,
        userId: creator._id,
        userName: creator.name,
        createdAt: submittedAt,
        unread: true,
      });
    });


    // -----------------------------------------
    // CREATOR CONTENT UPLOADS
    // -----------------------------------------

    const latestContent = await Content.find({
      ownerType: "creator",
    })
      .populate("creatorId", "name")
      .select(
        "title creatorId status createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(20);

    latestContent.forEach((content) => {
      notifications.push({
        id: `content-${content._id}`,
        type: "gallery",
        title: "New Creator Content",
        message: `${content.creatorId?.name || "A creator"} uploaded "${content.title}".`,
        userId: content.creatorId?._id || null,
        userName: content.creatorId?.name || "Unknown Creator",
        contentId: content._id,
        createdAt: content.createdAt,
        unread: true,
      });
    });


    // -----------------------------------------
    // MEMBERSHIP UPGRADES
    // -----------------------------------------

    const membershipUsers = await User.find({
      "membership.plan": {
        $in: ["VIP", "ELITE"],
      },
      "membership.startDate": {
        $exists: true,
      },
    })
      .select(
        "name membership"
      )
      .sort({
        "membership.startDate": -1,
      })
      .limit(20);

    membershipUsers.forEach((user) => {
      notifications.push({
        id: `membership-${user._id}`,
        type: "membership",
        title: "Membership Upgrade",
        message: `${user.name} upgraded to ${user.membership.plan} membership.`,
        userId: user._id,
        userName: user.name,
        plan: user.membership.plan,
        createdAt:
          user.membership.startDate ||
          user.updatedAt,
        unread: true,
      });
    });


    // -----------------------------------------
    // FAN CREATOR SUBSCRIPTIONS
    // -----------------------------------------

    const subscriptions = await Subscription.find()
      .populate("fanId", "name")
      .populate("creatorId", "name")
      .sort({
        createdAt: -1,
      })
      .limit(20);

    subscriptions.forEach((subscription) => {
      notifications.push({
        id: `subscription-${subscription._id}`,
        type: "subscription",
        title: "New Creator Subscription",
        message: `${subscription.fanId?.name || "A fan"} subscribed to ${subscription.creatorId?.name || "a creator"}.`,
        userId: subscription.fanId?._id || null,
        userName: subscription.fanId?.name || "Unknown Fan",
        creatorId: subscription.creatorId?._id || null,
        creatorName:
          subscription.creatorId?.name ||
          "Unknown Creator",
        amount: subscription.amount || 0,
        createdAt: subscription.createdAt,
        unread: true,
      });
    });


    // =========================================
    // SORT ALL NOTIFICATIONS
    // =========================================

    notifications.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );


    // =========================================
    // RESPONSE
    // =========================================

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

      notifications: notifications.slice(0, 50),
    });

  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);

    res.status(500).json({
      success: false,
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



exports.approveContent = async (req, res) => {
    try {

        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                error: "Content not found.",
            });
        }
if (content.status !== "pending_review") {
    return res.status(400).json({
        success: false,
        message: "Only pending review content can be approved."
    });
}
        content.status = "scheduled";
        content.reviewedBy = req.user._id;
        content.reviewedAt = new Date();

        await content.save();
await createNotification({
  recipient: creator._id,
  sender: req.user?._id || null,
  type: "creator_content_approved",
  title: "Content Approved",
  message:
    "Your content has been approved and is now scheduled for publication.",
  link: "/dashboard/content",
});
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
console.log("==============");
console.log("CONTENT STATUS:", content?.status);
console.log("REQUEST BODY:", req.body);
        if (!content) {
            return res.status(404).json({
                error: "Content not found.",
            });
        }
if (content.status !== "pending_review") {
    return res.status(400).json({
        success: false,
        message: "Only pending review content can be approved."
    });
}
        content.status = "rejected";
        content.reviewComment = req.body.comment || "";
        content.reviewedBy = req.user._id;
        content.reviewedAt = new Date();

        await content.save();
await createNotification({
  recipient: creator._id,
  sender: req.user?._id || null,
  type: "creator_content_rejected",
  title: "Content Rejected",
  message: content.reviewComment
    ? `Your content was rejected. Reason: ${content.reviewComment}`
    : "Your content was rejected. Please review the feedback.",
  link: "/dashboard/content",
});
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

exports.getPendingContent = async (req, res) => {

    try {

        const content = await Content.find({
  status: {
    $in: ["pending_review", "pending"],
  },
})
        .populate(
            "creatorId",
            "name email profileImage creatorApplication"
        )

        .sort({
            createdAt: -1
        });

        res.json({
            success: true,
            content
        });

    } catch(err){

        res.status(500).json({
            success:false,
            error:err.message
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
const {
  creatorApprovedEmail,
} = require("../services/emailService");
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

        await createNotification({
  recipient: user._id,
  sender: req.user?._id || null,
  type: "creator_application_approved",
  title: "Creator Application Approved",
  message:
    "Congratulations! Your creator application has been approved.",
  link: "/dashboard",
});

await creatorApprovedEmail(user);

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
const {
  creatorRejectedEmail,
} = require("../services/emailService");


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

        await createNotification({
  recipient: user._id,
  sender: req.user?._id || null,
  type: "creator_application_rejected",
  title: "Creator Application Rejected",
  message: rejectionReason
    ? `Your creator application was rejected. Reason: ${rejectionReason}`
    : "Your creator application was rejected.",
  link: "/dashboard",
});
await creatorRejectedEmail(
    user,
    rejectionReason
);
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

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    await User.findByIdAndDelete(id);

    res.json({
        success: true,
        message: "User deleted successfully",
    });
};

exports.getReviewedContent = async (req, res) => {
  try {

    const content = await Content.find({
      status: {
        $in: [
          "scheduled",
          "published",
          "rejected",
          "changes_requested",
        ],
      },
    })
      .populate(
        "creatorId",
        "name creatorApplication profileImage"
      )
      .sort({
        reviewedAt: -1,
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