const express = require("express");
const router = express.Router();

const AuditLog = require("../models/AuditLog");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, role(["ADMIN"]), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("adminId", "name email role")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
