const User = require("../models_/user");
const Subscription = require("../models_/subscription");

module.exports = async (req, res, next) => {
  console.log("===== canMessageCreator =====");
  console.log("BODY:", req.body);
  console.log("QUERY:", req.query);

  try {
    const sender = req.user;

    /*
    Creators can always reply.
    */

    if (sender.role === "creator") {
      return next();
    }

    const { creatorId } = req.body;
console.log("creatorId:", creatorId);
    if (!creatorId) {
      return res.status(400).json({
        success: false,
        message: "Creator ID is required.",
      });
    }

    const fan = await User.findById(
      sender.id
    );

    if (!fan) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /*
    Membership check
    */

  if (!["VIP", "ELITE"].includes(fan.membership.plan)) {
    return res.status(403).json({
        success: false,
        message: "Upgrade to VIP or ELITE to message creators.",
    });
}
    /*
    Membership expiry
    */

  if (fan.membership.status !== "active") {
    return res.status(403).json({
        success: false,
        message: "Membership is not active.",
    });
}

if (
    fan.membership.endDate &&
    fan.membership.endDate < new Date()
) {
    return res.status(403).json({
        success: false,
        message: "Membership has expired.",
    });
}
    /*
    Active subscription
    */

    const subscription =
      await Subscription.findOne({
        fanId: sender.id,
        creatorId,
        status: "active",
        endDate: {
          $gt: new Date(),
        },
      });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message:
          "Subscribe to this creator first.",
      });
    }

    next();
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message:
        "Permission check failed.",
    });
  }
};