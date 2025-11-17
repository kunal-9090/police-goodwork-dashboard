const path = require('path');
const fs = require('fs');
const NDPS = require('../models/NDPS');
const User = require('../models/User');
const mongoose = require('mongoose');

// 1) Serve districts.geojson file
exports.getDistrictGeoJSON = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'districts.geojson');
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Boundaries not found' });
    const raw = fs.readFileSync(filePath);
    const geo = JSON.parse(raw);
    res.json(geo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2) Heatmap points (returns points with intensity)
exports.getHeatmapPoints = async (req, res) => {
  try {
    // optional query: ?days=30 to get last N days
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const points = await NDPS.aggregate([
      { $match: { createdAt: { $gte: since }, location: { $exists: true, $ne: null } } },
      {
        $project: {
          _id: 0,
          coordinates: "$location.coordinates", // [lon, lat]
          intensity: "$pointsAwarded",
          districtId: 1,
          createdAt: 1
        }
      }
    ]);

    // Map to format suitable for Leaflet/Mapbox heatmap: [lat, lon, intensity]
    const mapped = points
      .filter(p => Array.isArray(p.coordinates) && p.coordinates.length === 2)
      .map(p => [p.coordinates[1], p.coordinates[0], p.intensity || 1]);

    res.json({ points: mapped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3) Choropleth data: aggregate points per district (total or per period)
exports.getChoroplethData = async (req, res) => {
  try {
    // optional query: ?start=yyyy-mm-dd&end=yyyy-mm-dd
    const { start, end } = req.query;
    const match = {};
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end) match.createdAt.$lte = new Date(end);
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: "$districtId",
          totalPoints: { $sum: "$pointsAwarded" },
          totalCases: { $sum: { $ifNull: ["$casesRegistered", 0] } }
        }
      },
      { $project: { districtId: "$_id", _id: 0, totalPoints: 1, totalCases: 1 } }
    ];

    const results = await NDPS.aggregate(pipeline);
    res.json(results); // frontend will join with district geometry
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4) District metrics (details)
exports.getDistrictMetrics = async (req, res) => {
  try {
    const districtId = req.params.districtId;
    // Example: totals and monthly trend
    const totals = await NDPS.aggregate([
      { $match: { districtId } },
      {
        $group: {
          _id: null,
          totalCases: { $sum: { $ifNull: ["$casesRegistered", 0] } },
          totalArrests: { $sum: { $ifNull: ["$personsArrested", 0] } },
          totalPoints: { $sum: { $ifNull: ["$pointsAwarded", 0] } },
          ganjaKg: { $sum: { $ifNull: ["$ganjaSeizedKg", 0] } },
          cashSeized: { $sum: { $ifNull: ["$cashSeized", 0] } }
        }
      }
    ]);

    const monthly = await NDPS.aggregate([
      { $match: { districtId } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          totalPoints: { $sum: { $ifNull: ["$pointsAwarded", 0] } },
          totalCases: { $sum: { $ifNull: ["$casesRegistered", 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      totals: totals[0] || {},
      monthlyTrend: monthly
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
