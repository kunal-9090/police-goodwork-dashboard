const express = require("express");
const router = express.Router();

const {
  submitNDPS,
  approveNDPS,
  rejectNDPS,
  getAllNDPS,
  getMyNDPS
} = require("../controllers/ndpsController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Officer submits
router.post("/submit", auth, role(["OFFICER", "ADMIN"]), submitNDPS);

// Officer view own entries
router.get("/my", auth, role(["OFFICER", "ADMIN"]), getMyNDPS);

// Admin controls
router.get("/all", auth, role(["ADMIN"]), getAllNDPS);
router.patch("/approve/:id", auth, role(["ADMIN"]), approveNDPS);
router.patch("/reject/:id", auth, role(["ADMIN"]), rejectNDPS);

module.exports = router;
