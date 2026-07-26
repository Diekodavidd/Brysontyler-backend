const User = require("../models_/user");
const Content = require("../models_/content");
const Subscription = require("../models_/subscription");
const Payment = require("../models_/payment");
const Membership = require("../models_/membership");
const Payout = require("../models_/payouts");

const createNotification = require("../utils_/createNotification");

const {
  getCache,
  setCache,
  deleteCacheByPattern,
} = require("../utils_/cache");

const {
  creatorApprovedEmail,
  creatorRejectedEmail,
} = require("../services/emailService");


// ============================================================
// CACHE KEYS
// ============================================================

const CACHE_KEYS = {
  STATS: "admin:stats",
  USERS: "admin:users",
  CONTENT: "admin:content",
  PENDING_CONTENT: "admin:content:pending",
  REVIEWED_CONTENT: "admin:content:reviewed",
  PENDING_CREATORS: "admin:creators:pending",
  FANS: "admin:fans",
  CREATORS: "admin:creators",
  MEMBERSHIPS: "admin:memberships",
};


// ============================================================
// CACHE TTL
// ============================================================

const CACHE_TTL = {
  STATS: 30,
  LISTS: 60,
  PENDING: 30,
};


// ============================================================
// INVALIDATE ADMIN CACHE
// ============================================================

const invalidateAdminCache = async () => {
  try {
    await deleteCacheByPattern("admin:*");

    console.log("✅ Admin cache invalidated");
  } catch (error) {
    console.error(
      "❌ Failed to invalidate admin cache:",
      error.message
    );
  }
};


// ============================================================
// GET ADMIN STATS
// ============================================================

exports.getStats = async (req, res) => {
  try {

    // --------------------------------------------------------
    // CHECK REDIS CACHE
    // --------------------------------------------------------

    const cachedStats = await getCache(CACHE_KEYS.STATS);

    if (cachedStats) {

      console.log("⚡ Admin stats served from Redis");

      return res.json(cachedStats);

    }


    // --------------------------------------------------------
    // BASIC STATS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // PENDING CREATORS
    // --------------------------------------------------------

    const pendingCreators = await User.find({
      role: "creator",
      "creatorApproval.status": "pending",
    })
      .select(
        "name profileImage creatorApplication creatorApproval createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();


    // --------------------------------------------------------
    // LATEST USERS
    // --------------------------------------------------------

    const latestUsers = await User.find()
      .select("name role createdAt")
      .sort({
        createdAt: -1,
      })
      .limit(6)
      .lean();


    // --------------------------------------------------------
    // NOTIFICATIONS
    // --------------------------------------------------------

    const notifications = [];


    // --------------------------------------------------------
    // NEW USER SIGNUPS
    // --------------------------------------------------------

    const newUsers = await User.find()
      .select("name role createdAt")
      .sort({
        createdAt: -1,
      })
      .limit(20)
      .lean();


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


    // --------------------------------------------------------
    // CREATOR APPLICATIONS
    // --------------------------------------------------------

    const creatorApplications = await User.find({
      role: "creator",
      "creatorApproval.status": {
        $in: [
          "pending",
          "approved",
          "rejected",
        ],
      },
    })
      .select(
        "name creatorApplication creatorApproval createdAt"
      )
      .sort({
        "creatorApplication.submittedAt": -1,
      })
      .limit(20)
      .lean();


    creatorApplications.forEach((creator) => {

      const submittedAt =
        creator.creatorApplication?.submittedAt ||
        creator.createdAt;


      notifications.push({
        id: `creator-${creator._id}`,
        type: "creator",
        title: "Creator Application Submitted",
        message:
          `${creator.name} submitted a creator application for approval.`,
        userId: creator._id,
        userName: creator.name,
        createdAt: submittedAt,
        unread: true,
      });

    });


    // --------------------------------------------------------
    // CREATOR CONTENT UPLOADS
    // --------------------------------------------------------

    const latestContent = await Content.find({
      ownerType: "creator",
    })
      .populate(
        "creatorId",
        "name"
      )
      .select(
        "title creatorId status createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(20)
      .lean();


    latestContent.forEach((content) => {

      notifications.push({
        id: `content-${content._id}`,
        type: "gallery",
        title: "New Creator Content",
        message:
          `${content.creatorId?.name || "A creator"} uploaded "${content.title}".`,
        userId:
          content.creatorId?._id || null,
        userName:
          content.creatorId?.name ||
          "Unknown Creator",
        contentId: content._id,
        createdAt: content.createdAt,
        unread: true,
      });

    });


    // --------------------------------------------------------
    // MEMBERSHIP UPGRADES
    // --------------------------------------------------------

    const membershipUsers = await User.find({
      "membership.plan": {
        $in: [
          "VIP",
          "ELITE",
        ],
      },
      "membership.startDate": {
        $exists: true,
      },
    })
      .select(
        "name membership updatedAt"
      )
      .sort({
        "membership.startDate": -1,
      })
      .limit(20)
      .lean();


    membershipUsers.forEach((user) => {

      notifications.push({
        id: `membership-${user._id}`,
        type: "membership",
        title: "Membership Upgrade",
        message:
          `${user.name} upgraded to ${user.membership.plan} membership.`,
        userId: user._id,
        userName: user.name,
        plan: user.membership.plan,
        createdAt:
          user.membership.startDate ||
          user.updatedAt,
        unread: true,
      });

    });


    // --------------------------------------------------------
    // FAN CREATOR SUBSCRIPTIONS
    // --------------------------------------------------------

    const subscriptions = await Subscription.find()
      .populate(
        "fanId",
        "name"
      )
      .populate(
        "creatorId",
        "name"
      )
      .sort({
        createdAt: -1,
      })
      .limit(20)
      .lean();


    subscriptions.forEach((subscription) => {

      notifications.push({
        id: `subscription-${subscription._id}`,
        type: "subscription",
        title: "New Creator Subscription",
        message:
          `${subscription.fanId?.name || "A fan"} subscribed to ${subscription.creatorId?.name || "a creator"}.`,
        userId:
          subscription.fanId?._id || null,
        userName:
          subscription.fanId?.name ||
          "Unknown Fan",
        creatorId:
          subscription.creatorId?._id ||
          null,
        creatorName:
          subscription.creatorId?.name ||
          "Unknown Creator",
        amount:
          subscription.amount ||
          0,
        createdAt:
          subscription.createdAt,
        unread: true,
      });

    });


    // --------------------------------------------------------
    // SORT NOTIFICATIONS
    // --------------------------------------------------------

    notifications.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    const responseData = {

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

      notifications:
        notifications.slice(0, 50),

    };


    // --------------------------------------------------------
    // SAVE TO REDIS
    // --------------------------------------------------------

    await setCache(
      CACHE_KEYS.STATS,
      responseData,
      CACHE_TTL.STATS
    );


    console.log(
      "💾 Admin stats saved to Redis"
    );


    return res.json(
      responseData
    );

  } catch (err) {

    console.error(
      "ADMIN STATS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }
};


// ============================================================
// GET ALL USERS
// ============================================================

exports.getAllUsers = async (req, res) => {

  try {

    const cachedUsers =
      await getCache(
        CACHE_KEYS.USERS
      );


    if (cachedUsers) {

      console.log(
        "⚡ Admin users served from Redis"
      );

      return res.json(
        cachedUsers
      );

    }


    const users =
      await User.find()
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .lean();


    const responseData = {

      success: true,

      users,

    };


    await setCache(
      CACHE_KEYS.USERS,
      responseData,
      CACHE_TTL.LISTS
    );


    return res.json(
      responseData
    );

  } catch (err) {

    console.error(
      "GET ALL USERS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// GET ALL CONTENT
// ============================================================

exports.getAllContent = async (req, res) => {

  try {

    const cachedContent =
      await getCache(
        CACHE_KEYS.CONTENT
      );


    if (cachedContent) {

      console.log(
        "⚡ Admin content served from Redis"
      );

      return res.json(
        cachedContent
      );

    }


    const content =
      await Content.find()
        .populate(
          "creatorId",
          "name email profileImage"
        )
        .populate(
          "approvedCollaborators",
          "name"
        )
        .sort({
          createdAt: -1,
        })
        .lean();


    const responseData = {

      success: true,

      content,

    };


    await setCache(
      CACHE_KEYS.CONTENT,
      responseData,
      CACHE_TTL.LISTS
    );


    return res.json(
      responseData
    );

  } catch (err) {

    console.error(
      "GET ALL CONTENT ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// APPROVE CONTENT
// ============================================================

exports.approveContent = async (req, res) => {

  try {

    const content =
      await Content.findById(
        req.params.id
      );


    if (!content) {

      return res.status(404).json({

        success: false,

        error:
          "Content not found.",

      });

    }


    if (
      content.status !==
      "pending_review"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Only pending review content can be approved.",

      });

    }


    content.status =
      "scheduled";

    content.reviewedBy =
      req.user._id;

    content.reviewedAt =
      new Date();


    await content.save();


    // Get creator
    const creator =
      await User.findById(
        content.creatorId
      );


    // Create notification
    if (creator) {

      await createNotification({

        recipient:
          creator._id,

        sender:
          req.user?._id ||
          null,

        type:
          "creator_content_approved",

        title:
          "Content Approved",

        message:
          "Your content has been approved and is now scheduled for publication.",

        link:
          "/dashboard/content",

      });

    }


    // Invalidate cache
    await invalidateAdminCache();


    return res.json({

      success: true,

      message:
        "Content approved successfully.",

      content,

    });

  } catch (err) {

    console.error(
      "APPROVE CONTENT ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// REJECT CONTENT
// ============================================================

exports.rejectContent = async (req, res) => {

  try {

    const content =
      await Content.findById(
        req.params.id
      );


    if (!content) {

      return res.status(404).json({

        success: false,

        error:
          "Content not found.",

      });

    }


    if (
      content.status !==
      "pending_review"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Only pending review content can be rejected.",

      });

    }


    content.status =
      "rejected";

    content.reviewComment =
      req.body.comment || "";

    content.reviewedBy =
      req.user._id;

    content.reviewedAt =
      new Date();


    await content.save();


    // Get creator
    const creator =
      await User.findById(
        content.creatorId
      );


    // Create notification
    if (creator) {

      await createNotification({

        recipient:
          creator._id,

        sender:
          req.user?._id ||
          null,

        type:
          "creator_content_rejected",

        title:
          "Content Rejected",

        message:
          content.reviewComment

            ? `Your content was rejected. Reason: ${content.reviewComment}`

            : "Your content was rejected. Please review the feedback.",

        link:
          "/dashboard/content",

      });

    }


    // Invalidate cache
    await invalidateAdminCache();


    return res.json({

      success: true,

      message:
        "Content rejected.",

      content,

    });

  } catch (err) {

    console.error(
      "REJECT CONTENT ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// GET PENDING CONTENT
// ============================================================

exports.getPendingContent = async (req, res) => {

  try {

    const cachedContent =
      await getCache(
        CACHE_KEYS.PENDING_CONTENT
      );


    if (cachedContent) {

      console.log(
        "⚡ Pending content served from Redis"
      );

      return res.json(
        cachedContent
      );

    }


    const content =
      await Content.find({

        status: {

          $in: [
            "pending_review",
            "pending",
          ],

        },

      })
        .populate(
          "creatorId",
          "name email profileImage creatorApplication"
        )
        .sort({
          createdAt: -1,
        })
        .lean();


    const responseData = {

      success: true,

      content,

    };


    await setCache(

      CACHE_KEYS.PENDING_CONTENT,

      responseData,

      CACHE_TTL.PENDING

    );


    return res.json(
      responseData
    );

  } catch (err) {

    console.error(
      "GET PENDING CONTENT ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// REQUEST CONTENT CHANGES
// ============================================================

exports.requestChanges = async (req, res) => {

  try {

    const content =
      await Content.findById(
        req.params.id
      );


    if (!content) {

      return res.status(404).json({

        success: false,

        error:
          "Content not found.",

      });

    }


    content.status =
      "changes_requested";

    content.reviewComment =
      req.body.comment || "";

    content.reviewedBy =
      req.user._id;

    content.reviewedAt =
      new Date();


    await content.save();


    await invalidateAdminCache();


    return res.json({

      success: true,

      message:
        "Changes requested.",

      content,

    });

  } catch (err) {

    console.error(
      "REQUEST CHANGES ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// PUBLISH SCHEDULED CONTENT
// ============================================================

exports.publishScheduledContent = async (req, res) => {

  try {

    const contents =
      await Content.find({

        status:
          "scheduled",

        releaseDate: {

          $lte:
            new Date(),

        },

      });


    for (
      const content of contents
    ) {

      content.status =
        "published";

      await content.save();

    }


    await invalidateAdminCache();


    return res.json({

      success: true,

      published:
        contents.length,

    });

  } catch (err) {

    console.error(
      "PUBLISH SCHEDULED CONTENT ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// APPROVE CREATOR
// ============================================================

exports.approveCreator = async (req, res) => {

  try {

    const user =
      await User.findById(
        req.params.id
      );


    if (!user) {

      return res.status(404).json({

        success: false,

        error:
          "Creator not found.",

      });

    }


    if (
      user.role !==
      "creator"
    ) {

      return res.status(400).json({

        success: false,

        error:
          "User is not a creator.",

      });

    }


    if (
      !user.creatorApproval
    ) {

      user.creatorApproval = {};

    }


    user.creatorApproval.status =
      "approved";

    user.creatorApproval.reviewedAt =
      new Date();

    user.creatorApproval.rejectionReason =
      "";


    await user.save();


    await createNotification({

      recipient:
        user._id,

      sender:
        req.user?._id ||
        null,

      type:
        "creator_application_approved",

      title:
        "Creator Application Approved",

      message:
        "Congratulations! Your creator application has been approved.",

      link:
        "/dashboard",

    });


    await creatorApprovedEmail(
      user
    );


    await invalidateAdminCache();


    return res.json({

      success: true,

      message:
        "Creator approved successfully.",

      creatorApproval:
        user.creatorApproval,

    });

  } catch (err) {

    console.error(
      "APPROVE CREATOR ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// REJECT CREATOR
// ============================================================

exports.rejectCreator = async (req, res) => {

  try {

    const user =
      await User.findById(
        req.params.id
      );


    if (!user) {

      return res.status(404).json({

        success: false,

        error:
          "Creator not found.",

      });

    }


    if (
      user.role !==
      "creator"
    ) {

      return res.status(400).json({

        success: false,

        error:
          "User is not a creator.",

      });

    }


    const rejectionReason =
      req.body.reason || "";


    if (
      !user.creatorApproval
    ) {

      user.creatorApproval = {};

    }


    user.creatorApproval.status =
      "rejected";

    user.creatorApproval.reviewedAt =
      new Date();

    user.creatorApproval.rejectionReason =
      rejectionReason;


    await user.save();


    await createNotification({

      recipient:
        user._id,

      sender:
        req.user?._id ||
        null,

      type:
        "creator_application_rejected",

      title:
        "Creator Application Rejected",

      message:
        rejectionReason

          ? `Your creator application was rejected. Reason: ${rejectionReason}`

          : "Your creator application was rejected.",

      link:
        "/dashboard",

    });


    await creatorRejectedEmail(
      user,
      rejectionReason
    );


    await invalidateAdminCache();


    return res.json({

      success: true,

      message:
        "Creator rejected successfully.",

      creatorApproval:
        user.creatorApproval,

    });

  } catch (err) {

    console.error(
      "REJECT CREATOR ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// GET PENDING CREATORS
// ============================================================

exports.getPendingCreators = async (req, res) => {

  try {

    const cachedCreators =
      await getCache(
        CACHE_KEYS.PENDING_CREATORS
      );


    if (cachedCreators) {

      console.log(
        "⚡ Pending creators served from Redis"
      );

      return res.json(
        cachedCreators
      );

    }


    const creators =
      await User.find({

        role:
          "creator",

        "creatorApproval.status":
          "pending",

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

          "creatorApplication.submittedAt":
            -1,

        })
        .lean();


    const responseData = {

      success: true,

      count:
        creators.length,

      creators,

    };


    await setCache(

      CACHE_KEYS.PENDING_CREATORS,

      responseData,

      CACHE_TTL.PENDING

    );


    return res.json(
      responseData
    );

  } catch (err) {

    console.error(
      "GET PENDING CREATORS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// GET ALL FANS
// ============================================================

exports.getAllFans = async (req, res) => {

  try {

    const cachedFans =
      await getCache(
        CACHE_KEYS.FANS
      );


    if (cachedFans) {

      console.log(
        "⚡ Fans served from Redis"
      );

      return res.json(
        cachedFans
      );

    }


    const fans =
      await User.find({

        role:
          "fan",

      })
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .lean();


    const responseData = {

      success: true,

      fans,

    };


    await setCache(

      CACHE_KEYS.FANS,

      responseData,

      CACHE_TTL.LISTS

    );


    return res.json(
      responseData
    );

  } catch (err) {

    console.error(
      "GET ALL FANS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// GET ALL CREATORS
// ============================================================

exports.getAllCreators = async (req, res) => {

  try {

    const cachedCreators =
      await getCache(
        CACHE_KEYS.CREATORS
      );


    if (cachedCreators) {

      console.log(
        "⚡ Creators served from Redis"
      );

      return res.json(
        cachedCreators
      );

    }


    const creators =
      await User.find({

        role:
          "creator",

      })
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .lean();


    const responseData = {

      success: true,

      creators,

    };


    await setCache(

      CACHE_KEYS.CREATORS,

      responseData,

      CACHE_TTL.LISTS

    );


    return res.json(
      responseData
    );

  } catch (err) {

    console.error(
      "GET ALL CREATORS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// GET MEMBERSHIPS
// ============================================================

exports.getMemberships = async (req, res) => {

  try {

    const cachedMemberships =
      await getCache(
        CACHE_KEYS.MEMBERSHIPS
      );


    if (cachedMemberships) {

      console.log(
        "⚡ Memberships served from Redis"
      );

      return res.json(
        cachedMemberships
      );

    }


    const members =
      await User.find({

        role:
          "fan",

      })
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .lean();


    const stats = {

      total:
        members.length,

      free:
        members.filter(
          (m) =>
            m.membership?.plan ===
            "FREE"
        ).length,

      vip:
        members.filter(
          (m) =>
            m.membership?.plan ===
            "VIP"
        ).length,

      elite:
        members.filter(
          (m) =>
            m.membership?.plan ===
            "ELITE"
        ).length,

      active:
        members.filter(
          (m) =>
            m.membership?.status ===
            "active"
        ).length,

      expired:
        members.filter(
          (m) =>
            m.membership?.status ===
            "expired"
        ).length,

    };


    const responseData = {

      success: true,

      members,

      stats,

    };


    await setCache(

      CACHE_KEYS.MEMBERSHIPS,

      responseData,

      CACHE_TTL.LISTS

    );


    return res.json(
      responseData
    );

  } catch (err) {

    console.error(
      "GET MEMBERSHIPS ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// DELETE USER
// ============================================================

exports.deleteUser = async (req, res) => {

  try {

    const {
      id,
    } = req.params;


    const user =
      await User.findById(
        id
      );


    if (!user) {

      return res.status(404).json({

        success: false,

        message:
          "User not found",

      });

    }


    await User.findByIdAndDelete(
      id
    );


    await invalidateAdminCache();


    return res.json({

      success: true,

      message:
        "User deleted successfully",

    });

  } catch (err) {

    console.error(
      "DELETE USER ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};


// ============================================================
// GET REVIEWED CONTENT
// ============================================================

exports.getReviewedContent = async (req, res) => {

  try {

    const cachedContent =
      await getCache(
        CACHE_KEYS.REVIEWED_CONTENT
      );


    if (cachedContent) {

      console.log(
        "⚡ Reviewed content served from Redis"
      );

      return res.json(
        cachedContent
      );

    }


    const content =
      await Content.find({

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

          reviewedAt:
            -1,

        })
        .lean();


    const responseData = {

      success: true,

      content,

    };


    await setCache(

      CACHE_KEYS.REVIEWED_CONTENT,

      responseData,

      CACHE_TTL.LISTS

    );


    return res.json(
      responseData
    );

  } catch (err) {

    console.error(
      "GET REVIEWED CONTENT ERROR:",
      err
    );

    return res.status(500).json({

      success: false,

      error: err.message,

    });

  }

};

// ============================================================
// GET ALL PAYOUT REQUESTS
// ============================================================

exports.getAllPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate(
        "creatorId",
        "name email profileImage"
      )
      .populate(
        "processedBy",
        "name email"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.json({
      success: true,
      count: payouts.length,
      payouts,
    });

  } catch (err) {
    console.error(
      "GET ALL PAYOUTS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ============================================================
// GET PAYOUT STATS
// ============================================================

exports.getPayoutStats = async (req, res) => {
  try {
    const [
      totalRequests,
      pending,
      approved,
      processing,
      paid,
      declined,
    ] = await Promise.all([
      Payout.countDocuments(),

      Payout.countDocuments({
        status: "pending",
      }),

      Payout.countDocuments({
        status: "approved",
      }),

      Payout.countDocuments({
        status: "processing",
      }),

      Payout.countDocuments({
        status: "paid",
      }),

      Payout.countDocuments({
        status: "declined",
      }),
    ]);

    const amountStats =
      await Payout.aggregate([
        {
          $group: {
            _id: null,

            totalRequested: {
              $sum: "$amount",
            },

            totalPaid: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "paid",
                    ],
                  },
                  "$amount",
                  0,
                ],
              },
            },

            totalPending: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "pending",
                    ],
                  },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const amounts =
      amountStats[0] || {
        totalRequested: 0,
        totalPaid: 0,
        totalPending: 0,
      };

    return res.json({
      success: true,

      stats: {
        totalRequests,
        pending,
        approved,
        processing,
        paid,
        declined,

        totalRequested:
          amounts.totalRequested,

        totalPaid:
          amounts.totalPaid,

        totalPending:
          amounts.totalPending,
      },
    });

  } catch (err) {
    console.error(
      "GET PAYOUT STATS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ============================================================
// APPROVE PAYOUT
// ============================================================

exports.approvePayout = async (req, res) => {
  try {
    const payout =
      await Payout.findById(
        req.params.id
      );

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: "Payout request not found.",
      });
    }

    if (
      payout.status !== "pending"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Only pending payouts can be approved.",
      });
    }

    payout.status = "approved";

    payout.processedBy =
      req.user?._id || null;

    payout.processedAt =
      new Date();

    await payout.save();

    return res.json({
      success: true,
      message:
        "Payout approved successfully.",
      payout,
    });

  } catch (err) {
    console.error(
      "APPROVE PAYOUT ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ============================================================
// DECLINE PAYOUT
// ============================================================

exports.declinePayout = async (req, res) => {
  try {
    const payout =
      await Payout.findById(
        req.params.id
      );

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: "Payout request not found.",
      });
    }

    if (
      payout.status !== "pending"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Only pending payouts can be declined.",
      });
    }

    const reason =
      req.body.reason || "";

    payout.status = "declined";

    payout.rejectionReason =
      reason;

    payout.processedBy =
      req.user?._id || null;

    payout.processedAt =
      new Date();

    await payout.save();

    return res.json({
      success: true,
      message:
        "Payout declined successfully.",
      payout,
    });

  } catch (err) {
    console.error(
      "DECLINE PAYOUT ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ============================================================
// MARK PAYOUT AS PROCESSING
// ============================================================

exports.processPayout = async (req, res) => {
  try {
    const payout =
      await Payout.findById(
        req.params.id
      );

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: "Payout request not found.",
      });
    }

    if (
      payout.status !== "approved"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Only approved payouts can be processed.",
      });
    }

    payout.status =
      "processing";

    await payout.save();

    return res.json({
      success: true,
      message:
        "Payout is now being processed.",
      payout,
    });

  } catch (err) {
    console.error(
      "PROCESS PAYOUT ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ============================================================
// MARK PAYOUT AS PAID
// ============================================================

exports.completePayout = async (req, res) => {
  try {
    const payout =
      await Payout.findById(
        req.params.id
      );

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: "Payout request not found.",
      });
    }

    if (
      ![
        "approved",
        "processing",
      ].includes(payout.status)
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Only approved or processing payouts can be marked as paid.",
      });
    }

    payout.status = "paid";

    payout.transactionId =
      req.body.transactionId ||
      payout.transactionId ||
      "";

    payout.processedBy =
      req.user?._id || null;

    payout.processedAt =
      new Date();

    await payout.save();

    return res.json({
      success: true,
      message:
        "Payout marked as paid.",
      payout,
    });

  } catch (err) {
    console.error(
      "COMPLETE PAYOUT ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ============================================================
// GET ADMIN REPORTS
// ============================================================


exports.getAdminReports = async (req, res) => {
  try {
    const range = Math.max(
      Number(req.query.range) || 30,
      1
    );

    const now = new Date();

    const startDate = new Date(now);

    if (range === 365) {
      startDate.setFullYear(
        now.getFullYear() - 1
      );
    } else {
      startDate.setDate(
        now.getDate() - range
      );
    }

    // Previous period
    const previousStartDate = new Date(
      startDate
    );

    previousStartDate.setDate(
      previousStartDate.getDate() - range
    );

    // ============================================================
    // BASIC COUNTS
    // ============================================================

    const [
      totalUsers,
      totalCreators,
      totalFans,
      publishedVideos,
      totalVideoViews,
      newUsers,
      newPublishedVideos,
      activeMemberships,
    ] = await Promise.all([

      User.countDocuments(),

      User.countDocuments({
        role: "creator",
      }),

      User.countDocuments({
        role: "fan",
      }),

      Content.countDocuments({
        status: "published",
        mediaType: "video",
      }),

      Content.aggregate([
        {
          $match: {
            mediaType: "video",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$views",
            },
          },
        },
      ]),

      User.countDocuments({
        createdAt: {
          $gte: startDate,
        },
      }),

      Content.countDocuments({
        status: "published",
        mediaType: "video",
        createdAt: {
          $gte: startDate,
        },
      }),

      Membership.countDocuments({
        status: "active",
      }),

    ]);

    // ============================================================
    // REVENUE
    // ============================================================

    const revenueResult =
      await Payment.aggregate([
        {
          $match: {
            completed: true,

            createdAt: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const platformRevenue =
      revenueResult[0]?.total || 0;

    // ============================================================
    // PREVIOUS PERIOD REVENUE
    // ============================================================

    const previousRevenueResult =
      await Payment.aggregate([
        {
          $match: {
            completed: true,

            createdAt: {
              $gte: previousStartDate,
              $lt: startDate,
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const previousRevenue =
      previousRevenueResult[0]?.total || 0;

    let revenueChange = 0;

    if (previousRevenue > 0) {
      revenueChange =
        (
          (
            platformRevenue -
            previousRevenue
          ) /
          previousRevenue
        ) *
        100;
    }

    revenueChange =
      Number(
        revenueChange.toFixed(1)
      );

    // ============================================================
    // VIDEO VIEWS
    // ============================================================

    const videoViews =
      totalVideoViews[0]?.total || 0;

    // ============================================================
    // TOP CREATORS
    // ============================================================

    const topCreators =
      await Content.aggregate([

        {
          $match: {
            ownerType: "creator",
            status: "published",
          },
        },

        {
          $group: {
            _id: "$creatorId",

            videos: {
              $sum: 1,
            },

            views: {
              $sum: "$views",
            },
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "creator",
          },
        },

        {
          $unwind: {
            path: "$creator",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 0,

            name: {
              $ifNull: [
                "$creator.name",
                "Unknown Creator",
              ],
            },

            videos: 1,

            views: 1,
          },
        },

        {
          $sort: {
            views: -1,
          },
        },

        {
          $limit: 10,
        },

      ]);

    // ============================================================
    // REVENUE CHART
    // ============================================================

    const revenueChart =
      await Payment.aggregate([

        {
          $match: {
            completed: true,

            createdAt: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },

            revenue: {
              $sum: "$amount",
            },
          },
        },

        {
          $sort: {
            "_id": 1,
          },
        },

      ]);

    // ============================================================
    // MEMBERSHIP GROWTH
    // ============================================================

    const membershipGrowth =
      await Membership.aggregate([

        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },

            memberships: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id": 1,
          },
        },

      ]);

    // ============================================================
    // RESPONSE
    // ============================================================

    return res.json({

      success: true,

      range,

      stats: {

        platformRevenue,

        revenueChange,

        totalUsers,

        totalCreators,

        totalFans,

        newUsers,

        videoViews,

        publishedVideos,

        newPublishedVideos,

        activeMemberships,

      },

      topCreators,

      revenueChart,

      membershipGrowth,

    });

  } catch (error) {

    console.error(
      "GET ADMIN REPORTS ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      error: error.message,

    });

  }
};