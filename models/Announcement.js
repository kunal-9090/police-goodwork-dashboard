const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "LOW"
  },

  // Admin who sent the announcement
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Optional → target specific district
  targetDistrict: {
    type: String,
    default: null
  },

  // List of officers who marked this announcement as READ
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
