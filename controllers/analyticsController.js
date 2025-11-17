const NDPS = require("../models/NDPS");
const User = require("../models/User");
const mongoose = require("mongoose");

// -----------------------------
// 1. STATE-LEVEL SUMMARY
// -----------------------------
exports.getStateSummary = async (req, res) => {
  try {
    const summary = await NDPS.aggregate([
      {
        $group: {
          _id: null,
          totalCases: { $sum: "$casesRegistered" },
          totalArrests: { $sum: "$personsArrested" },
          totalGanjaKg: { $sum: "$ganjaSeizedKg" },
          totalBrownSugarGm: { $sum: "$brownSugarSeizedGm" },
          totalCash: { $sum: "$cashSeized" },
          totalVehicles: { $sum: "$vehiclesSeized" },
        }
      }
    ]);

    res.json(summary[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------
// 2. DISTRICT-WISE SUMMARY
// -----------------------------
exports.getDistrictSummary = async (req, res) => {
  try {
    const districtId = req.params.districtId;

    const summary = await NDPS.aggregate([
      { $match: { districtId } },
      {
        $group: {
          _id: "$districtId",
          totalCases: { $sum: "$casesRegistered" },
          totalArrests: { $sum: "$personsArrested" },
          totalGanjaKg: { $sum: "$ganjaSeizedKg" },
          totalCash: { $sum: "$cashSeized" },
          totalVehicles: { $sum: "$vehiclesSeized" },
        }
      }
    ]);

    res.json(summary[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------
// 3. MONTHLY TRENDS
// -----------------------------
exports.getMonthlyTrend = async (req, res) => {
  try {
    const year = parseInt(req.params.year);

    const trend = await NDPS.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          totalCases: { $sum: "$casesRegistered" },
          totalArrests: { $sum: "$personsArrested" },
          totalGanjaKg: { $sum: "$ganjaSeizedKg" }
        }
      },
      { $match: { "_id.year": year } },
      { $sort: { "_id.month": 1 } }
    ]);

    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------
// 4. WEEKLY TREND
// -----------------------------
exports.getWeeklyTrend = async (req, res) => {
  try {
    const trend = await NDPS.aggregate([
      {
        $group: {
          _id: { week: { $week: "$createdAt" } },
          totalCases: { $sum: "$casesRegistered" },
          totalArrests: { $sum: "$personsArrested" }
        }
      },
      { $sort: { "_id.week": 1 } }
    ]);

    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------
// 5. OFFICER PERFORMANCE STATISTICS
// -----------------------------
exports.getOfficerStats = async (req, res) => {
  try {
    const officerId = new mongoose.Types.ObjectId(req.params.officerId);

    const stats = await NDPS.aggregate([
      { $match: { officerId } },
      {
        $group: {
          _id: "$officerId",
          entries: { $sum: 1 },
          totalPoints: { $sum: "$pointsAwarded" },
          totalCases: { $sum: "$casesRegistered" },
          totalArrests: { $sum: "$personsArrested" }
        }
      }
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------
// 6. HEATMAP DATA (for GIS views)
// -----------------------------
exports.getHeatmapData = async (req, res) => {
  try {
    const heatmap = await NDPS.aggregate([
      {
        $group: {
          _id: "$districtId",
          intensity: { $sum: "$casesRegistered" }
        }
      }
    ]);

    res.json(heatmap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------
// 7. ADMIN SUMMARY CARDS
// -----------------------------
exports.getAdminCards = async (req, res) => {
  try {
    const totalEntries = await NDPS.countDocuments();
    const pending = await NDPS.countDocuments({ status: "PENDING" });
    const approved = await NDPS.countDocuments({ status: "APPROVED" });

    const topOfficer = await User.find().sort({ totalPoints: -1 }).limit(1);

    res.json({
      totalEntries,
      approved,
      pending,
      topOfficer: topOfficer[0] || null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
