const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["ADMIN", "OFFICER"],
    default: "OFFICER"
  },

  districtId: {
    type: String,
    default: null
  },

  // 🔥 Total Points for Leaderboard + Officer Ranking
  totalPoints: {
    type: Number,
    default: 0
  },

  // 💰 Wallet balance (money in rupees after withdrawals)
  walletBalance: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
