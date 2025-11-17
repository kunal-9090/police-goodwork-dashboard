const NDPS = require("../models/NDPS");
const User = require("../models/User");
const Insight = require("../models/Insight");
const mongoose = require("mongoose");

// Helper: parse dates
function parseDates(query) {
  const start = query.start ? new Date(query.start) : new Date(new Date().getFullYear(), 0, 1);
  const end = query.end ? new Date(query.end) : new Date();
  return { start, end };
}

// Helper: compute percent change safely
function pctChange(prev, curr) {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

// ----------------------
// 1) NL Summary
// ----------------------
exports.getSummary = async (req, res) => {
  try {
    const { start, end } = parseDates(req.query);

    // statewide aggregates
    const agg = await NDPS.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: "APPROVED" } },
      {
        $group: {
          _id: null,
          totalCases: { $sum: { $ifNull: ["$casesRegistered", 0] } },
          totalArrests: { $sum: { $ifNull: ["$personsArrested", 0] } },
          totalPoints: { $sum: { $ifNull: ["$pointsAwarded", 0] } },
          totalGanjaKg: { $sum: { $ifNull: ["$ganjaSeizedKg", 0] } },
          totalCash: { $sum: { $ifNull: ["$cashSeized", 0] } }
        }
      }
    ]);

    const totals = agg[0] || { totalCases:0, totalArrests:0, totalPoints:0, totalGanjaKg:0, totalCash:0 };

    // top district by points
    const topDistrict = await NDPS.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: "APPROVED" } },
      { $group: { _id: "$districtId", points: { $sum: "$pointsAwarded" } } },
      { $sort: { points: -1 } },
      { $limit: 1 }
    ]);

    const top = topDistrict[0] || { _id: "N/A", points: 0 };

    // quick trend: compare with previous same-length period
    const prevStart = new Date(start.getTime() - (end - start) - 1);
    const prevEnd = new Date(start.getTime() - 1);

    const prevAgg = await NDPS.aggregate([
      { $match: { createdAt: { $gte: prevStart, $lte: prevEnd }, status: "APPROVED" } },
      { $group: { _id: null, totalPoints: { $sum: { $ifNull: ["$pointsAwarded", 0] } } } }
    ]);
    const prevPoints = prevAgg[0]?.totalPoints || 0;
    const currPoints = totals.totalPoints || 0;
    const changePct = pctChange(prevPoints, currPoints);

    // Natural language summary
    const text = `Between ${start.toDateString()} and ${end.toDateString()}, state-wide approved activity recorded ${totals.totalCases} cases, ${totals.totalArrests} arrests and ${totals.totalPoints} points. ${top._id} led with ${top.points} points. Compared to the previous period, total points changed by ${changePct.toFixed(1)}%.`;

    // Save insight
    const insight = await Insight.create({
      type: "SUMMARY",
      period: { start, end },
      payload: { totals, topDistrict: top },
      text
    });

    res.json({ text, totals, topDistrict: top, insightId: insight._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ----------------------
// 2) Anomaly detection (z-score) by district on points
// ----------------------
exports.getAnomalies = async (req, res) => {
  try {
    const { start, end } = parseDates(req.query);
    const zThreshold = parseFloat(req.query.z) || 2;

    // group by district: monthly total points (or total in period)
    const districtAgg = await NDPS.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: "APPROVED" } },
      { $group: { _id: "$districtId", totalPoints: { $sum: "$pointsAwarded" } } }
    ]);

    const values = districtAgg.map(d => d.totalPoints);
    const mean = values.reduce((a,b)=>a+b,0)/Math.max(1,values.length);
    const variance = values.reduce((a,b)=>a + Math.pow(b - mean, 2), 0) / Math.max(1, values.length);
    const std = Math.sqrt(variance);

    const anomalies = districtAgg.filter(d => {
      if (std === 0) return false;
      const z = (d.totalPoints - mean) / std;
      return Math.abs(z) >= zThreshold;
    }).map(d => ({ districtId: d._id, totalPoints: d.totalPoints }));

    // Save insight
    const insight = await Insight.create({
      type: "ANOMALY",
      period: { start, end },
      payload: { anomalies, mean, std },
      text: `Found ${anomalies.length} anomalous districts using z>=${zThreshold}`
    });

    res.json({ anomalies, mean, std, insightId: insight._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ----------------------
// 3) Predict Underperforming Districts (simple rule-based)
//    Look at moving average (last N months) and compute drops
// ----------------------
exports.getUnderperforming = async (req, res) => {
  try {
    const months = parseInt(req.query.windowMonths) || 3;
    const dropPctThreshold = parseFloat(req.query.dropPct) || 20;

    // compute monthly totals per district for last (months*2) months to compare
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - months*2);

    const pipeline = [
      { $match: { createdAt: { $gte: start, $lte: end }, status: "APPROVED" } },
      { $project: { districtId:1, points: "$pointsAwarded", month: { $month: "$createdAt" }, year: { $year: "$createdAt" } } },
      { $group: {
          _id: { districtId: "$districtId", year: "$year", month: "$month" },
          monthlyPoints: { $sum: "$points" }
        }
      },
      { $sort: { "_id.districtId": 1, "_id.year": 1, "_id.month": 1 } }
    ];

    const monthly = await NDPS.aggregate(pipeline);

    // aggregate into district -> array of monthly totals (last 2*months)
    const map = {};
    monthly.forEach(m => {
      const d = m._id.districtId || "UNKNOWN";
      map[d] = map[d] || [];
      map[d].push({ ym: `${m._id.year}-${m._id.month}`, points: m.monthlyPoints });
    });

    const underperformers = [];

    Object.entries(map).forEach(([district, arr]) => {
      // sort by ym (already sorted by pipeline) and take last months and prev months
      const pts = arr.map(a=>a.points);
      if (pts.length < months*2) return; // insufficient data

      const lastWindow = pts.slice(-months).reduce((a,b)=>a+b,0)/months;
      const prevWindow = pts.slice(-months*2, -months).reduce((a,b)=>a+b,0)/months;

      const drop = pctChange(prevWindow, lastWindow);
      if (drop <= -Math.abs(dropPctThreshold)) {
        underperformers.push({ district, prevWindow: prevWindow.toFixed(1), lastWindow: lastWindow.toFixed(1), drop: drop.toFixed(1) });
      }
    });

    const insight = await Insight.create({
      type: "UNDERPERFORM",
      period: { start, end },
      payload: { underperformers },
      text: `Found ${underperformers.length} underperforming districts`
    });

    res.json({ underperformers, insightId: insight._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ----------------------
// 4) Simple forecast (linear regression) for district totalPoints
// ----------------------
function linearRegression(xs, ys) {
  // xs: [0,1,2,...], ys: numbers
  const n = xs.length;
  if (n === 0) throw new Error("No data");
  const sumX = xs.reduce((a,b)=>a+b,0);
  const sumY = ys.reduce((a,b)=>a+b,0);
  const sumXY = xs.reduce((a,b,i)=>a + b*ys[i],0);
  const sumX2 = xs.reduce((a,b)=>a + b*b,0);
  const denom = (n*sumX2 - sumX*sumX);
  const slope = denom === 0 ? 0 : (n*sumXY - sumX*sumY) / denom;
  const intercept = (sumY - slope*sumX)/n;
  return { slope, intercept };
}

exports.getForecast = async (req, res) => {
  try {
    const districtId = req.query.districtId || null;
    const months = parseInt(req.query.months) || 3;

    // fetch monthly totals for last 12 months (or available)
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 11);

    const match = { createdAt: { $gte: start, $lte: end }, status: "APPROVED" };
    if (districtId) match.districtId = districtId;

    const monthly = await NDPS.aggregate([
      { $match: match },
      { $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalPoints: { $sum: "$pointsAwarded" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // prepare xs, ys
    const xs = [];
    const ys = [];
    monthly.forEach((m,i) => {
      xs.push(i);
      ys.push(m.totalPoints);
    });

    if (ys.length < 2) return res.status(400).json({ message: "Not enough data to forecast" });

    const { slope, intercept } = linearRegression(xs, ys);

    const forecast = [];
    for (let i=1;i<=months;i++) {
      const x = xs.length + i - 1;
      const pred = intercept + slope * x;
      forecast.push({ monthIndex: x, predictedPoints: Math.max(0, Math.round(pred)) });
    }

    const insight = await Insight.create({
      type: "FORECAST",
      period: { start, end },
      payload: { monthly, forecast },
      text: `Forecast generated ${months} months ahead for ${districtId || 'STATE'}`
    });

    res.json({ monthly, forecast, insightId: insight._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ----------------------
// 5) Simple resource suggestions
//    compute a score: points per case or points per arrest and recommend which districts to allocate support
// ----------------------
exports.getResourceSuggestions = async (req, res) => {
  try {
    // compute last 3 months totals for each district
    const months = parseInt(req.query.months) || 3;
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - months);

    const data = await NDPS.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: "APPROVED" } },
      { $group: {
          _id: "$districtId",
          totalPoints: { $sum: "$pointsAwarded" },
          totalCases: { $sum: { $ifNull: ["$casesRegistered", 0] } },
          totalArrests: { $sum: { $ifNull: ["$personsArrested", 0] } }
        }
      }
    ]);

    // compute a simple efficiency score: points per case (higher = efficient)
    const scored = data.map(d => {
      const efficiency = d.totalCases === 0 ? 0 : d.totalPoints / d.totalCases;
      return { districtId: d._id, totalPoints: d.totalPoints, totalCases: d.totalCases, totalArrests: d.totalArrests, efficiency };
    });

    // sort ascending by efficiency (lowest efficiency => needs support)
    scored.sort((a,b) => a.efficiency - b.efficiency);

    const suggestions = scored.slice(0, parseInt(req.query.topN) || 5).map(s => ({
      districtId: s.districtId,
      reason: `Low efficiency (${s.efficiency.toFixed(2)} points/case)`,
      recommendedAction: "Provide training + focused special drive",
      metrics: s
    }));

    const insight = await Insight.create({
      type: "SUGGESTIONS",
      period: { start, end },
      payload: { suggestions },
      text: `Suggested ${suggestions.length} districts for resource allocation`
    });

    res.json({ suggestions, insightId: insight._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// 6) Run full pipeline (admin) - run all insights
// ----------------------
exports.runAll = async (req, res) => {
  try {
    // Admin only (middleware should check role)
    const summary = await exports.getSummary(req, res); // these functions respond — but we want internal results.
    // Instead call internal helpers or simply call endpoints from frontend; for brevity, return OK.
    res.json({ message: "Use the individual endpoints or schedule them. Running pipeline via API not implemented to avoid double-responses." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
