const Certificate = require("../models/Certificate");
const NDPS = require("../models/NDPS");
const User = require("../models/User");
const generateCertificatePDF = require("../utils/generateCertificate");  // PDF generator
const { v4: uuidv4 } = require("uuid");

// -----------------------------------------------------
// ADMIN: Generate Certificate for Approved NDPS Entry
// -----------------------------------------------------
exports.generateCertificate = async (req, res) => {
  try {
    const { entryId } = req.params;

    // Fetch NDPS Entry
    const entry = await NDPS.findById(entryId).populate("officerId");
    if (!entry) {
      return res.status(404).json({ message: "NDPS entry not found" });
    }

    // Only approved entries can receive a certificate
    if (entry.status !== "APPROVED") {
      return res.status(400).json({
        message: "Certificate can only be generated for APPROVED entries"
      });
    }

    // Allow only ADMIN
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only Admin can generate certificates" });
    }

    const officer = entry.officerId;
    if (!officer) {
      return res.status(404).json({ message: "Officer details not found" });
    }

    // Prevent duplicate certificate creation for same entry
    const existing = await Certificate.findOne({ ndpsEntryId: entry._id });
    if (existing) {
      return res.json({
        message: "Certificate already exists for this entry",
        certificate: existing
      });
    }

    const certificateId = `CERT-${uuidv4()}`;

    // ----------------------------------------------
    // Generate PDF using your generateCertificate.js
    // ----------------------------------------------
    const pdfUrl = await generateCertificatePDF(officer, entry, certificateId);

    // Save in DB
    const certificate = await Certificate.create({
      officerId: officer._id,
      ndpsEntryId: entry._id,
      certificateId,
      pdfUrl
    });

    res.json({
      message: "Certificate generated successfully",
      certificate
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
