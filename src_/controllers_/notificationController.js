const Notification = require("../models_/notification");

/*
========================================
GET MY NOTIFICATIONS
========================================
*/

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("sender", "name profileImage")
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/*
========================================
MARK ONE NOTIFICATION AS READ
========================================
*/

exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (err) {
    console.error("MARK NOTIFICATION ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/*
========================================
MARK ALL NOTIFICATIONS AS READ
========================================
*/

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (err) {
    console.error("MARK ALL NOTIFICATIONS ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};