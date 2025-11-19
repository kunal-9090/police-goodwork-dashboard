const Notification = require("../models/Notification");

async function sendNotification(userId, title, message, link = null) {
  await Notification.create({
    userId,
    title,
    message,
    link,
  });
}

module.exports = sendNotification;
