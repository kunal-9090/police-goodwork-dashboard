const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");

// -------------------------------------------
// OFFICER: Request Withdrawal
// -------------------------------------------
exports.requestWithdrawal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const points = req.body.points;

    if (points <= 0) {
      return res.status(400).json({ message: "Points must be greater than 0" });
    }

    if (points > user.totalPoints) {
      return res.status(400).json({
        message: "You cannot withdraw more points than your total balance",
      });
    }

    const amount = points * 100; // 1 point = ₹100

    const withdrawal = await Withdrawal.create({
      officerId: req.user.id,
      pointsRequested: points,
      amountInRupees: amount,
    });

    res.json({
      message: "Withdrawal request submitted successfully",
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------
// OFFICER: Get My Withdrawal Requests
// -------------------------------------------
exports.getMyWithdrawals = async (req, res) => {
  try {
    const list = await Withdrawal.find({ officerId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------
// ADMIN: Get All Withdrawal Requests
// -------------------------------------------
exports.getAllWithdrawals = async (req, res) => {
  try {
    const list = await Withdrawal.find()
      .populate("officerId", "name email districtId")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------
// ADMIN: Approve Withdrawal
// -------------------------------------------
exports.approveWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal)
      return res.status(404).json({ message: "Request not found" });

    if (withdrawal.status !== "PENDING")
      return res.status(400).json({ message: "Already processed" });

    const user = await User.findById(withdrawal.officerId);

    // Deduct points from officer
    user.totalPoints -= withdrawal.pointsRequested;
    user.walletBalance += withdrawal.amountInRupees;
    await user.save();

    withdrawal.status = "APPROVED";
    withdrawal.adminRemark = req.body.remark || "";
    await withdrawal.save();

    res.json({
      message: "Withdrawal approved successfully",
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------
// ADMIN: Reject Withdrawal
// -------------------------------------------
exports.rejectWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal)
      return res.status(404).json({ message: "Request not found" });

    if (withdrawal.status !== "PENDING")
      return res.status(400).json({ message: "Already processed" });

    withdrawal.status = "REJECTED";
    withdrawal.adminRemark = req.body.remark || "";
    await withdrawal.save();

    res.json({
      message: "Withdrawal rejected",
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
