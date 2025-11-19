const NDPS = require("../models/NDPS");
const User = require("../models/User");
const Certificate = require("../models/Certificate");

const generateCertificate = require("../utils/generateCertificate");
const sendNotification = require("../utils/sendNotification");
const logAction = require("../utils/auditLogger"); // ⭐ Module 16 — Audit Logs

// ======================================================
// AUTO POINT CALCULATION
// ======================================================
function calculatePoints(data) {
  let points = 0;

  points += (data.casesRegistered || 0) * 10;
  points += (data.personsArrested || 0) * 5;

  points += (data.ganjaSeizedKg || 0) * 2;
  points += (data.brownSugarSeizedGm || 0) * 0.05;
  points += (data.vehiclesSeized || 0) * 3;
  points += (data.coughSyrupBottles || 0) * 0.1;
  points += (data.cashSeized || 0) / 1000;

  points += (data.ganjaPlantsDestroyed || 0) * 0.5;

  return Math.round(points);
}

// ======================================================
// OFFICER — SUBMIT NDPS ENTRY
// ======================================================
exports.submitNDPS = async (req, res) => {
  try {
    const data = req.body;
    const points = calculatePoints(data);

    const entry = await NDPS.create({
      officerId: req.user.id,
      districtId: req.user.districtId || "UNKNOWN",
      ...data,
      pointsAwarded: points,
    });

    // 🔔 Push Notification
    await sendNotification(
      req.user.id,
      "NDPS Entry Submitted",
      "Your NDPS entry has been submitted and is pending admin approval.",
      "/ndps/my"
    );

    // 📝 Audit Log
    await logAction(
      req.user.id,
      "Submitted NDPS Entry",
      "NDPS",
      { entryId: entry._id, points },
      req.ip
    );

    return res.json({
      success: true,
      message: "NDPS entry submitted successfully",
      pointsCalculated: points,
      entry,
    });
  } catch (error) {
    console.error("Submit NDPS Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// ADMIN — APPROVE NDPS ENTRY
// ======================================================
exports.approveNDPS = async (req, res) => {
  try {
    const entry = await NDPS.findById(req.params.id).populate("officerId");

    if (!entry) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    // Avoid point double-credit
    if (entry.status !== "APPROVED") {
      await User.findByIdAndUpdate(entry.officerId._id, {
        $inc: { totalPoints: entry.pointsAwarded },
      });
    }

    entry.status = "APPROVED";
    entry.adminRemark = req.body.remark || "";
    await entry.save();

    // 🔔 Notification — Approval
    await sendNotification(
      entry.officerId._id,
      "NDPS Entry Approved",
      `Your NDPS entry has been approved. You earned ${entry.pointsAwarded} points.`,
      "/ndps/my"
    );

    // ------------------------------------------
    // CERTIFICATE GENERATION
    // ------------------------------------------
    const certificateId = `CERT-${Date.now()}`;
    const pdfUrl = await generateCertificate(entry.officerId, entry, certificateId);

    const certRecord = await Certificate.create({
      officerId: entry.officerId._id,
      ndpsEntryId: entry._id,
      certificateId,
      pdfUrl,
    });

    // 🔔 Notification — Certificate Generated
    await sendNotification(
      entry.officerId._id,
      "Certificate Issued",
      "A Good Work Certificate has been generated for your NDPS performance.",
      "/certificates"
    );

    // 📝 Audit Log
    await logAction(
      req.user.id,
      "Approved NDPS Entry",
      "NDPS",
      {
        entryId: entry._id,
        officerId: entry.officerId._id,
        certificateId,
        points: entry.pointsAwarded,
      },
      req.ip
    );

    return res.json({
      success: true,
      message: "Entry approved, points credited & certificate generated",
      entry,
      certificate: certRecord,
    });
  } catch (error) {
    console.error("Approve NDPS Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// ADMIN — REJECT NDPS ENTRY
// ======================================================
exports.rejectNDPS = async (req, res) => {
  try {
    const entry = await NDPS.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    entry.status = "REJECTED";
    entry.adminRemark = req.body.remark || "";
    await entry.save();

    // 🔔 Notification — Rejected
    await sendNotification(
      entry.officerId,
      "NDPS Entry Rejected",
      "Your NDPS entry was rejected by the admin.",
      "/ndps/my"
    );

    // 📝 Audit Log
    await logAction(
      req.user.id,
      "Rejected NDPS Entry",
      "NDPS",
      { entryId: entry._id, remark: req.body.remark },
      req.ip
    );

    return res.json({
      success: true,
      message: "Entry rejected successfully",
      entry,
    });
  } catch (error) {
    console.error("Reject NDPS Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// ADMIN — GET ALL NDPS ENTRIES
// ======================================================
exports.getAllNDPS = async (req, res) => {
  try {
    const entries = await NDPS.find().populate(
      "officerId",
      "name email districtId"
    );

    return res.json({ success: true, entries });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ======================================================
// OFFICER — GET MY NDPS ENTRIES
// ======================================================
exports.getMyNDPS = async (req, res) => {
  try {
    const entries = await NDPS.find({ officerId: req.user.id });

    return res.json({ success: true, entries });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
