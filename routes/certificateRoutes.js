const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const path = require("path");
const fs = require("fs");

// -------------------------
// DOWNLOAD CERTIFICATE PDF
// -------------------------
router.get("/download/:id", async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Full absolute path on server
    const fullPath = path.join(__dirname, "..", certificate.pdfUrl);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "PDF file missing on server" });
    }

    res.download(fullPath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// VIEW CERTIFICATE in Browser
// -------------------------
router.get("/view/:id", async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const fullPath = path.join(__dirname, "..", certificate.pdfUrl);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "PDF missing" });
    }

    res.sendFile(fullPath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
