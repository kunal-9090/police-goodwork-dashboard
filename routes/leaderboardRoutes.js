const express = require("express");
const router = express.Router();

const {
  getTopOfficers,
  getDistrictLeaders,
  getMyRank,
  getMonthlyLeaders,
  getRangeLeaders
} = require("../controllers/leaderboardController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// GLOBAL TOP 10
router.get("/top", getTopOfficers);

// DISTRICT-WISE RANK
router.get("/district/:districtId", getDistrictLeaders);

// OFFICER RANK
router.get("/my-rank", auth, role(["OFFICER","ADMIN"]), getMyRank);

// MONTHLY LEADERBOARD
router.get("/by-month/:month/:year", getMonthlyLeaders);

// DATE RANGE LEADERBOARD
router.get("/by-range", getRangeLeaders);

module.exports = router;
