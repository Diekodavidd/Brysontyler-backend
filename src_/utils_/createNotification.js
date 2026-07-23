const Notification = require("../models_/Notification");

const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
}) => {
  try {
    if (!recipient) {
      console.log("No notification recipient provided");
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
    });

    return notification;
  } catch (error) {
    console.error(
      "Create notification error:",
      error.message
    );

    return null;
  }
};

module.exports = createNotification;