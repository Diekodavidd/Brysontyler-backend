const Notification = require("../models_/notification");

const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
}) => {
  try {
    return await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
    });
  } catch (error) {
    console.error("NOTIFICATION ERROR:", error);
    return null;
  }
};

module.exports = createNotification;