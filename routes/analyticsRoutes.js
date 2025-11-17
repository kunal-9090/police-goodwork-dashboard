const express = require("express");
const router = express.Router();

const {
  getStateSummary,
  getDistrictSummary,
  getMonthlyTrend,
  getWeeklyTrend,
  getOfficerStats,
  getHeatmapData,
  getAdminCards
} = require("../controllers/analyticsController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// STATE SUMMARY
router.get("/state-summary", getStateSummary);

// DISTRICT SUMMARY
router.get("/district/:districtId", getDistrictSummary);

// MONTHLY TRENDS
router.get("/trend/monthly/:year", getMonthlyTrend);

// WEEKLY TRENDS
router.get("/trend/weekly", getWeeklyTrend);

// OFFICER ANALYTICS
router.get("/officer/:officerId", getOfficerStats);

// HEATMAP DATA
router.get("/heatmap", getHeatmapData);

// ADMIN DASHBOARD CARDS
router.get("/admin/cards", getAdminCards);

module.exports = router;
