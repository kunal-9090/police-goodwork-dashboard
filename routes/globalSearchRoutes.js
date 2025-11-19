const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const { globalSearch } = require("../controllers/globalSearchController");

// Only admin can search everything
router.get("/", auth, role(["ADMIN"]), globalSearch);

module.exports = router;
