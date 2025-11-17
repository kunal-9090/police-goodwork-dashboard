const express = require("express");
const router = express.Router();
const {
  getStationsByDistrict,
  getStationStats,
  getBeatStats
} = require("../controllers/stationController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/district/:districtId", auth, role(["ADMIN","OFFICER"]), getStationsByDistrict);

router.get("/station/:stationId/stats", auth, role(["ADMIN","OFFICER"]), getStationStats);

router.get("/beat/:beatId/stats", auth, role(["ADMIN","OFFICER"]), getBeatStats);

module.exports = router;
