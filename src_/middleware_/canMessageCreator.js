const User = require("../models/User");
const Subscription = require("../models/Subscription");

module.exports = async (
  req,
  res,
  next
) => {
  try {
    const sender = req.user;

    /*
    Creators can always reply.
    */

    if (sender.role === "creator") {
      return next();
    }

    const { creatorId } = req.body;

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

    if (
      !["VIP", "Elite"].includes(
        fan.membership.plan
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Upgrade to VIP to message creators.",
      });
    }

    /*
    Membership expiry
    */

    if (
      fan.membership.endDate &&
      fan.membership.endDate <
        new Date()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Membership has expired.",
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