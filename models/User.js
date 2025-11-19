const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ------------------------------------
    // BASIC USER DETAILS
    // ------------------------------------
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ------------------------------------
    // ROLE MANAGEMENT
    // ------------------------------------
    role: {
      type: String,
      enum: ["ADMIN", "OFFICER"],
      default: "OFFICER",
    },

    districtId: {
      type: String,
      default: null,
    },

    // ------------------------------------
    // PERFORMANCE & REWARD SYSTEM
    // ------------------------------------
    totalPoints: {
      type: Number,
      default: 0,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    // ------------------------------------
    // MODULE 11 → PUSH NOTIFICATION TOKENS
    // ------------------------------------
    deviceToken: {
      type: String,
      default: null, // FCM or OneSignal token
    },

    // ------------------------------------
    // MODULE 15 → PROFILE IMAGE
    // ------------------------------------
    profilePhoto: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png", 
      // Default avatar (fallback)
    },

    phone: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "Officer",
    },

    // ------------------------------------
    // MODULE 13 → ANNOUNCEMENT READ TRACKER
    // ------------------------------------
    announcementsRead: {
      type: [String], // Array of Announcement IDs
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
