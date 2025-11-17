const User = require("../models/User");
const NDPS = require("../models/NDPS");
const Certificate = require("../models/Certificate");
const Withdrawal = require("../models/Withdrawal");

// ------------------------------
// ADMIN: Get all officers
// ------------------------------
exports.getAllOfficers = async (req, res) => {
  try {
    const officers = await User.find({ role: "OFFICER" }).select("-password");
    res.json(officers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------
// ADMIN: Get officer by ID
// ------------------------------
exports.getOfficerById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Officer not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------
// ADMIN: Update officer details
// ------------------------------
exports.updateOfficer = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "Officer not found" });

    res.json({
      message: "Officer updated successfully",
      officer: updated
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------
// ADMIN: Delete Officer
// ------------------------------
exports.deleteOfficer = async (req, res) => {
  try {
    const officer = await User.findByIdAndDelete(req.params.id);
    if (!officer) return res.status(404).json({ message: "Officer not found" });

    res.json({ message: "Officer deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------
// ADMIN: Dashboard Stats
// ------------------------------
exports.getAdminStats = async (req, res) => {
  try {
    const totalOfficers = await User.countDocuments({ role: "OFFICER" });
    const totalNDPS = await NDPS.countDocuments();
    const approvedNDPS = await NDPS.countDocuments({ status: "APPROVED" });
    const rejectedNDPS = await NDPS.countDocuments({ status: "REJECTED" });
    const pendingNDPS = await NDPS.countDocuments({ status: "PENDING" });

    const totalCertificates = await Certificate.countDocuments();
    const totalWithdrawals = await Withdrawal.countDocuments();

    res.json({
      officers: totalOfficers,
      ndps: {
        total: totalNDPS,
        approved: approvedNDPS,
        rejected: rejectedNDPS,
        pending: pendingNDPS,
      },
      certificates: totalCertificates,
      withdrawals: totalWithdrawals,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------------------
// ADMIN: District-wise officer listing
// ------------------------------
exports.getDistrictOfficers = async (req, res) => {
  try {
    const { districtId } = req.params;

    const officers = await User.find({
      role: "OFFICER",
      districtId
    }).select("-password");

    res.json(officers);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
