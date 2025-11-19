const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const { exportPDF, exportExcel } = require("../controllers/exportController");

// PDF for single NDPS entry
router.get("/ndps/pdf/:id", auth, exportPDF);

// Excel for all entries (Admin only)
router.get(
  "/ndps/excel",
  auth,
  role(["ADMIN"]),
  exportExcel
);

module.exports = router;
