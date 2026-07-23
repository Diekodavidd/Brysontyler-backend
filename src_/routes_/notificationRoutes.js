const express = require("express");

const router = express.Router();

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers_/notificationController");

const auth = require("../middleware_/authMiddleware");

router.get(
  "/",
  auth,
  getMyNotifications
);

router.patch(
  "/:id/read",
  auth,
  markNotificationAsRead
);

router.patch(
  "/read-all",
  auth,
  markAllNotificationsAsRead
);

module.exports = router;