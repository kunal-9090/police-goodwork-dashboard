const NDPS = require("../models/NDPS");
const User = require("../models/User");

// -----------------------------------------------------
// A. PERFORMANCE RANKING ENGINE
// -----------------------------------------------------
function calculateMonthlyGrowth(entries) {
  if (entries.length < 2) return 0;

  const sorted = entries.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const first = sorted[0].pointsAwarded;
  const last = sorted[sorted.length - 1].pointsAwarded;

  return last - first; 
}

function calculateConsistency(entries) {
  if (entries.length === 0) return 0;
  return Math.min(100, entries.length * 10);
}

exports.getTopOfficers = async (req, res) => {
  try {
    const users = await User.find({ role: "OFFICER" });

    const ranked = [];

    for (let officer of users) {
      const entries = await NDPS.find({ officerId: officer._id });

      const monthlyGrowth = calculateMonthlyGrowth(entries);
      const consistency = calculateConsistency(entries);

      const highImpact = entries.reduce(
        (sum, e) => sum + (e.cashSeized > 50000 ? 10 : 0),
        0
      );

      const finalScore = 
        officer.totalPoints * 0.6 +
        monthlyGrowth * 0.2 +
        consistency * 0.1 +
        highImpact * 0.1;

      ranked.push({
        officer,
        finalScore: Number(finalScore.toFixed(2)),
      });
    }

    ranked.sort((a, b) => b.finalScore - a.finalScore);

    res.json({
      success: true,
      rankedOfficers: ranked,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// -----------------------------------------------------
// B. AI HOTSPOT PREDICTION ENGINE
// -----------------------------------------------------
exports.getHotspotPredictions = async (req, res) => {
  try {
    const entries = await NDPS.find({
      location: { $exists: true },
    });

    let districtRisk = {};

    entries.forEach((e) => {
      if (!districtRisk[e.districtId]) {
        districtRisk[e.districtId] = { count: 0, points: 0 };
      }

      districtRisk[e.districtId].count += 1;
      districtRisk[e.districtId].points += e.pointsAwarded;
    });

    const hotspots = Object.entries(districtRisk).map(
      ([districtId, data]) => ({
        districtId,
        riskScore: Math.min(100, data.points + data.count * 5),
      })
    );

    hotspots.sort((a, b) => b.riskScore - a.riskScore);

    res.json({
      success: true,
      hotspots,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
