const NDPS = require("../models/NDPS");
const User = require("../models/User");
const Certificate = require("../models/Certificate"); 
const generateCertificate = require("../utils/generateCertificate");

// --------------------------
// AUTO POINTS CALCULATION
// --------------------------
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

// --------------------------
// OFFICER: SUBMIT ENTRY
// --------------------------
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

    res.json({
      message: "NDPS entry submitted successfully",
      pointsCalculated: points,
      entry
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------
// ADMIN: APPROVE ENTRY
// --------------------------
exports.approveNDPS = async (req, res) => {
  try {
    const entry = await NDPS.findById(req.params.id).populate("officerId");

    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // Avoid double credit of points
    if (entry.status !== "APPROVED") {
      await User.findByIdAndUpdate(entry.officerId._id, {
        $inc: { totalPoints: entry.pointsAwarded }
      });
    }

    entry.status = "APPROVED";
    entry.adminRemark = req.body.remark || "";
    await entry.save();

    // --------------------------
    // ⭐ GENERATE CERTIFICATE PDF
    // --------------------------
    const certificateId = `CERT-${Date.now()}`;

    const pdfUrl = await generateCertificate(entry.officerId, entry, certificateId);

    // Save certificate info in DB
    const certRecord = await Certificate.create({
      officerId: entry.officerId._id,
      entryId: entry._id,
      certificateId,
      pdfUrl
    });

    res.json({
      message: "Entry approved, points added & certificate generated",
      entry,
      certificate: certRecord
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------
// ADMIN: REJECT ENTRY
// --------------------------
exports.rejectNDPS = async (req, res) => {
  try {
    const entry = await NDPS.findById(req.params.id);

    if (!entry) return res.status(404).json({ message: "Entry not found" });

    entry.status = "REJECTED";
    entry.adminRemark = req.body.remark || "";
    await entry.save();

    res.json({ message: "Entry rejected", entry });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --------------------------
// ADMIN: GET ALL ENTRIES
// --------------------------
exports.getAllNDPS = async (req, res) => {
  const entries = await NDPS.find()
    .populate("officerId", "name email districtId");

  res.json(entries);
};

// --------------------------
// OFFICER: GET MY ENTRIES
// --------------------------
exports.getMyNDPS = async (req, res) => {
  const entries = await NDPS.find({ officerId: req.user.id });
  res.json(entries);
};
