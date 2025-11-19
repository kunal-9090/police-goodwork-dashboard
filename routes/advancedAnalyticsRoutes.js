const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { compareDistricts, monthlyTrendline, forecastNextMonth } =
  require("../controllers/advancedAnalyticsController");

// 1️⃣ Compare multiple districts
router.post("/compare", auth, compareDistricts);

// 2️⃣ Monthly NDPS trendline
router.get("/trendline", auth, monthlyTrendline);

// 3️⃣ AI prediction for next month
router.get("/forecast", auth, forecastNextMonth);

module.exports = router;
