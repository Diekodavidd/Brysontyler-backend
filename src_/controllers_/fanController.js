const User = require("../models_/user");
const Subscription = require("../models_/subscription");
const Payment = require("../models_/payment");


// ==============================
// Dashboard
// ==============================

exports.getDashboard = async (req, res) => {
    try {

        const totalSubscriptions = await Subscription.countDocuments({
            fanId: req.user._id,
            status: "active"
        });

        const totalPayments = await Payment.countDocuments({
            userId: req.user._id
        });

        const recentPayments = await Payment.find({
            userId: req.user._id
        })
            .populate("creatorId", "name profilePic")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,

            fan: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
profileImage: req.user.profileImage,
                coinBalance: req.user.coinBalance
            },

            stats: {
                totalSubscriptions,
                totalPayments
            },

            recentPayments
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};



// ==============================
// Profile
// ==============================

exports.getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

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



// ==============================
// Update Profile
// ==============================

exports.updateProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({
                error: "User not found."
            });

        }

        if (req.body.name) {
            user.name = req.body.name.trim();
        }

        if (req.body.email) {
            user.email = req.body.email.trim().toLowerCase();
        }

       if (req.body.profileImage) {
    user.profileImage = req.body.profileImage;
}

        await user.save();

        res.json({

            success: true,

            user

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};



// ==============================
// Wallet
// ==============================

exports.getWallet = async (req, res) => {

    try {

        const payments = await Payment.find({

            userId: req.user._id

        })
            .populate("creatorId", "name")
            .sort({ createdAt: -1 });

        res.json({

            success: true,

            wallet: {

                balance: req.user.coinBalance,

                payments

            }

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};



// ==============================
// History
// ==============================

exports.getHistory = async (req, res) => {

    try {

        const subscriptions = await Subscription.find({

            fanId: req.user._id

        })
.populate("creatorId", "name profileImage")
            .sort({ createdAt: -1 });

        const payments = await Payment.find({

            userId: req.user._id

        })
.populate("creatorId", "name profileImage")
            .sort({ createdAt: -1 });


        res.json({

            success: true,

            history: {

                subscriptions,

                payments

            }

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};



// ==============================
// Preferences
// ==============================

exports.getPreferences = async (req, res) => {

    try {

        res.json({

            success: true,

            preferences: req.user.preferences || {}

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};





exports.updatePreferences = async (req, res) => {

    try {

        const user = await User.findById(req.user._id);

        user.preferences = req.body;

        await user.save();

        res.json({

            success: true,

            preferences: user.preferences

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};



// ==============================
// Payment Methods
// ==============================

exports.getPaymentMethods = async (req, res) => {

    try {

        res.json({

            success: true,

            paymentMethods: req.user.paymentMethods || []

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};





exports.savePaymentMethod = async (req, res) => {

    try {

        const user = await User.findById(req.user._id);

        if (!user.paymentMethods) {

            user.paymentMethods = [];

        }

        user.paymentMethods.push(req.body);

        await user.save();

        res.json({

            success: true,

            paymentMethods: user.paymentMethods

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};


const Subscription = require("../models_/subscription");

exports.getActivity = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user._id,
    })
      .populate("creatorId", "name")
      .sort({ createdAt: -1 });

    const subscriptions = await Subscription.find({
      fanId: req.user._id,
    })
      .populate("creatorId", "name")
      .sort({ createdAt: -1 });

    const activity = [
      ...payments.map((payment) => ({
        _id: payment._id,
        type: "payment",
        creator: payment.creatorId,
        amount: payment.amount,
        status: payment.paymentStatus,
        paymentType: payment.paymentType,
        createdAt: payment.createdAt,
      })),

      ...subscriptions.map((subscription) => ({
        _id: subscription._id,
        type: "subscription",
        creator: subscription.creatorId,
        amount: subscription.amount,
        status: subscription.status,
        endDate: subscription.endDate,
        createdAt: subscription.createdAt,
      })),
    ].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      payments: payments.length,
      subscriptions: subscriptions.length,
      activity,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};