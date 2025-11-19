const NDPS = require("../models/NDPS");
const User = require("../models/User");

const { generateNDPSReportPDF } = require("../utils/pdfGenerator");
const { exportNDPSExcel } = require("../utils/excelGenerator");

// --------------------------------------------
// PDF Export - Officer NDPS Report
// --------------------------------------------
exports.exportPDF = async (req, res) => {
  try {
    const entry = await NDPS.findById(req.params.id).populate("officerId");

    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const data = {
      officerName: entry.officerId.name,
      district: entry.districtId,
      metrics: {
        "Cases Registered": entry.casesRegistered,
        "Persons Arrested": entry.personsArrested,
        "Ganja Seized (Kg)": entry.ganjaSeizedKg,
        "Brown Sugar (gm)": entry.brownSugarSeizedGm,
        "Vehicles Seized": entry.vehiclesSeized,
        "Cash Seized (₹)": entry.cashSeized,
        "Points Awarded": entry.pointsAwarded,
      },
    };

    const fileName = `NDPS_REPORT_${entry._id}.pdf`;

    const pdfPath = await generateNDPSReportPDF(data, fileName);

    return res.download(pdfPath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --------------------------------------------
// Excel Export - All NDPS Entries
// --------------------------------------------
exports.exportExcel = async (req, res) => {
  try {
    const entries = await NDPS.find().populate("officerId");

    const fileName = `NDPS_FULL_EXPORT.xlsx`;

    const filePath = await exportNDPSExcel(entries, fileName);

    return res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
