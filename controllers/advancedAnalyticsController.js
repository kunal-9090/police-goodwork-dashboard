const NDPS = require("../models/NDPS");
const User = require("../models/User");
const axios = require("axios");

// ===============================================
// MODULE 18 — ADVANCED ANALYTICS ENGINE
// ===============================================

// -----------------------------------------------
// 1️⃣ DISTRICT COMPARISON
// -----------------------------------------------
exports.compareDistricts = async (req, res) => {
  try {
    const { districts } = req.body;

    if (!districts || districts.length < 2)
      return res.status(400).json({
        success: false,
        message: "Provide at least two districts to compare",
      });

    const comparison = {};

    for (const district of districts) {
      const stats = await NDPS.aggregate([
        { $match: { districtId: district } },
        {
          $group: {
            _id: "$districtId",
            totalCases: { $sum: "$casesRegistered" },
            totalArrests: { $sum: "$personsArrested" },
            ganjaKg: { $sum: "$ganjaSeizedKg" },
            brownSugarGm: { $sum: "$brownSugarSeizedGm" },
            totalPoints: { $sum: "$pointsAwarded" },
          },
        },
      ]);

      comparison[district] = stats[0] || {
        totalCases: 0,
        totalArrests: 0,
        ganjaKg: 0,
        brownSugarGm: 0,
        totalPoints: 0,
      };
    }

    res.json({ success: true, comparison });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// -----------------------------------------------
// 2️⃣ MONTHLY TRENDLINE (For Charts)
// -----------------------------------------------
exports.monthlyTrendline = async (req, res) => {
  try {
    const { districtId } = req.query;

    const pipeline = [
      districtId ? { $match: { districtId } } : { $match: {} },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalCases: { $sum: "$casesRegistered" },
          arrests: { $sum: "$personsArrested" },
          points: { $sum: "$pointsAwarded" },
        },
      },
      { $sort: { "_id": 1 } },
    ];

    const data = await NDPS.aggregate(pipeline);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// -----------------------------------------------
// 3️⃣ AI FORECAST NEXT MONTH
// -----------------------------------------------
exports.forecastNextMonth = async (req, res) => {
  try {
    const stats = await NDPS.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          cases: { $sum: "$casesRegistered" },
          arrests: { $sum: "$personsArrested" },
          ganjaKg: { $sum: "$ganjaSeizedKg" },
          points: { $sum: "$pointsAwarded" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // prepare data to send to GPT
    const prompt = `
You are an analytics expert. Based on these monthly NDPS stats:
${JSON.stringify(stats)}

Predict next month's:
- Cases
- Arrests
- Ganja seized (kg)
- Expected points
Give numbers only, no explanation.
`;

    // Call your AI Route (Module 10)
    const aiResponse = await axios.post(process.env.AI_API_URL, {
      prompt,
    });

    res.json({
      success: true,
      forecast: aiResponse.data.forecast || aiResponse.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
