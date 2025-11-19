const NDPS = require("../models/NDPS");
const User = require("../models/User");
const Certificate = require("../models/Certificate");
const Audit = require("../models/Audit");

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query missing" });
    }

    const keyword = new RegExp(q, "i");

    // ----------------------------------------------------
    // 1️⃣ SEARCH USERS
    // ----------------------------------------------------
    const users = await User.find({
      $or: [
        { name: keyword },
        { email: keyword },
        { districtId: keyword }
      ]
    }).select("-password");

    // ----------------------------------------------------
    // 2️⃣ SEARCH NDPS ENTRIES
    // ----------------------------------------------------
    const ndps = await NDPS.find({
      $or: [
        { firNumber: keyword },
        { remarks: keyword },
        { districtId: keyword }
      ]
    }).populate("officerId", "name email");

    // ----------------------------------------------------
    // 3️⃣ SEARCH CERTIFICATES
    // ----------------------------------------------------
    const certificates = await Certificate.find({
      certificateId: keyword
    }).populate("officerId", "name email");

    // ----------------------------------------------------
    // 4️⃣ SEARCH AUDIT LOGS
    // ----------------------------------------------------
    const logs = await Audit.find({
      action: keyword
    });

    return res.json({
      success: true,
      query: q,
      results: {
        users,
        ndps,
        certificates,
        logs
      }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
