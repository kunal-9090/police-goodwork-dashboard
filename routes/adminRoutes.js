const express = require("express");
const router = express.Router();

const {
  getAllOfficers,
  getOfficerById,
  updateOfficer,
  deleteOfficer,
  getAdminStats,
  getDistrictOfficers
} = require("../controllers/adminController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Admin only routes
router.get("/officers", auth, role(["ADMIN"]), getAllOfficers);
router.get("/officer/:id", auth, role(["ADMIN"]), getOfficerById);
router.put("/officer/:id", auth, role(["ADMIN"]), updateOfficer);
router.delete("/officer/:id", auth, role(["ADMIN"]), deleteOfficer);

router.get("/stats", auth, role(["ADMIN"]), getAdminStats);

router.get("/district/:districtId", auth, role(["ADMIN"]), getDistrictOfficers);

module.exports = router;
