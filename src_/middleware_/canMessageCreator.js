const Subscription = require("../models/Subscription");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const fanId = req.user.id;
    const { creatorId } = req.body;

    if (!creatorId) {
      return res.status(400).json({
        success: false,
        message: "Creator ID is required.",
      });
    }

    const fan = await User.findById(fanId);

    if (!fan) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Membership must be VIP or Elite
    if (!["VIP", "Elite"].includes(fan.membership.plan)) {
      return res.status(403).json({
        success: false,
        message:
          "Upgrade to VIP or Elite to message creators.",
      });
    }

    // Membership must still be active
    if (
      fan.membership.endDate &&
      fan.membership.endDate < new Date()
    ) {
      return res.status(403).json({
        success: false,
        message: "Your membership has expired.",
      });
    }

    // Must have an active subscription
    const subscription = await Subscription.findOne({
      fanId,
      creatorId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message:
          "Subscribe to this creator before sending messages.",
      });
    }

    next();
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Permission check failed.",
    });
  }
};