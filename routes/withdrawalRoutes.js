const express = require("express");
const router = express.Router();

const {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} = require("../controllers/withdrawalController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// OFFICER
router.post("/request", auth, role(["OFFICER","ADMIN"]), requestWithdrawal);
router.get("/my", auth, role(["OFFICER","ADMIN"]), getMyWithdrawals);

// ADMIN
router.get("/all", auth, role(["ADMIN"]), getAllWithdrawals);
router.patch("/approve/:id", auth, role(["ADMIN"]), approveWithdrawal);
router.patch("/reject/:id", auth, role(["ADMIN"]), rejectWithdrawal);

module.exports = router;
