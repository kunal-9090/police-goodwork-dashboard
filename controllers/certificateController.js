const Certificate = require("../models/Certificate");
const NDPS = require("../models/NDPS");
const User = require("../models/User");
const generatePDF = require("../utils/generateCertificate");
const { v4: uuidv4 } = require("uuid");

exports.generateCertificate = async (req, res) => {
  try {
    const { entryId } = req.params;

    // Fetch NDPS Entry
    const entry = await NDPS.findById(entryId);
    if (!entry)
      return res.status(404).json({ message: "NDPS entry not found" });

    // Allow only ADMIN to generate certificates
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Only Admin can generate certificates" });

    const officer = await User.findById(entry.officerId);
    if (!officer)
      return res.status(404).json({ message: "Officer not found" });

    const certificateId = uuidv4();

    // Generate PDF
    const pdfPath = await generatePDF({
      officerName: officer.name,
      districtId: officer.districtId,
      points: entry.pointsAwarded,
      certificateId,
    });

    // Save in DB
    const certificate = await Certificate.create({
      officerId: officer._id,
      ndpsEntryId: entry._id,
      certificateId,
      pdfUrl: pdfPath,
    });

    res.json({
      message: "Certificate generated successfully",
      certificate,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
