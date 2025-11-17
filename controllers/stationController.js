const PoliceStation = require("../models/PoliceStation");
const Beat = require("../models/Beat");
const NDPS = require("../models/NDPS");

// Get all stations in district
exports.getStationsByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;
    const stations = await PoliceStation.find({ districtId });

    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Station-level performance summary
exports.getStationStats = async (req, res) => {
  try {
    const stationId = req.params.stationId;

    const stats = await NDPS.aggregate([
      { $match: { stationId: new mongoose.Types.ObjectId(stationId) } },
      {
        $group: {
          _id: null,
          totalCases: { $sum: "$casesRegistered" },
          totalArrests: { $sum: "$personsArrested" },
          totalPoints: { $sum: "$pointsAwarded" }
        }
      }
    ]);

    res.json(stats[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Beat-wise stats
exports.getBeatStats = async (req, res) => {
  try {
    const beatId = req.params.beatId;

    const stats = await NDPS.aggregate([
      { $match: { beatId: new mongoose.Types.ObjectId(beatId) } },
      {
        $group: {
          _id: null,
          totalCases: { $sum: "$casesRegistered" },
          totalArrests: { $sum: "$personsArrested" },
          totalPoints: { $sum: "$pointsAwarded" }
        }
      }
    ]);

    res.json(stats[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
