const NDPS = require("../models/NDPS");
const User = require("../models/User");
const mongoose = require("mongoose");

// -------------------------
// GLOBAL TOP 10 LEADERBOARD
// -------------------------
exports.getTopOfficers = async (req, res) => {
  try {
    const leaders = await NDPS.aggregate([
      {
        $group: {
          _id: "$officerId",
          totalPoints: { $sum: "$pointsAwarded" }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "officer"
        }
      },
      { $unwind: "$officer" },
      {
        $project: {
          officerId: "$officer._id",
          name: "$officer.name",
          email: "$officer.email",
          districtId: "$officer.districtId",
          totalPoints: 1
        }
      }
    ]);

    res.json(leaders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------
// DISTRICT LEADERBOARD
// -------------------------
exports.getDistrictLeaders = async (req, res) => {
  try {
    const districtId = req.params.districtId;

    const leaders = await NDPS.aggregate([
      { $match: { districtId: districtId } },
      {
        $group: {
          _id: "$officerId",
          totalPoints: { $sum: "$pointsAwarded" }
        }
      },
      { $sort: { totalPoints: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "officer"
        }
      },
      { $unwind: "$officer" },
      {
        $project: {
          officerId: "$officer._id",
          name: "$officer.name",
          email: "$officer.email",
          districtId: "$officer.districtId",
          totalPoints: 1
        }
      }
    ]);

    res.json(leaders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------
// GET MY RANK
// -------------------------
exports.getMyRank = async (req, res) => {
  try {
    const officerId = new mongoose.Types.ObjectId(req.user.id);

    const leaderboard = await NDPS.aggregate([
      {
        $group: {
          _id: "$officerId",
          totalPoints: { $sum: "$pointsAwarded" }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    const rank = leaderboard.findIndex(
      entry => String(entry._id) === String(officerId)
    );

    res.json({
      officerId,
      rank: rank + 1,
      totalPoints: leaderboard[rank]?.totalPoints || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------
// MONTHLY LEADERBOARD
// -------------------------
exports.getMonthlyLeaders = async (req, res) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const leaders = await NDPS.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$officerId",
          totalPoints: { $sum: "$pointsAwarded" }
        }
      },
      { $sort: { totalPoints: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "officer"
        }
      },
      { $unwind: "$officer" }
    ]);

    res.json(leaders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------
// DATE RANGE LEADERBOARD
// -------------------------
exports.getRangeLeaders = async (req, res) => {
  try {
    const { start, end } = req.query;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const leaders = await NDPS.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: "$officerId",
          totalPoints: { $sum: "$pointsAwarded" }
        }
      },
      { $sort: { totalPoints: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "officer"
        }
      },
      { $unwind: "$officer" }
    ]);

    res.json(leaders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
