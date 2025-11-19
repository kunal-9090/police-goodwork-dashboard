const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getTopOfficers,
  getHotspotPredictions
} = require("../controllers/rankingController");

router.get("/top-officers", auth, getTopOfficers);
router.get("/hotspots", auth, getHotspotPredictions);

module.exports = router;
