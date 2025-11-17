const express = require('express');
const router = express.Router();
const {
  getDistrictGeoJSON,
  getHeatmapPoints,
  getChoroplethData,
  getDistrictMetrics
} = require('../controllers/gisController');

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Return district boundaries GeoJSON (public)
router.get('/district-boundaries', getDistrictGeoJSON);

// Return heatmap points: recent entries with intensity (public)
router.get('/heatmap', getHeatmapPoints);

// Return choropleth-ready data { districtId, value }
router.get('/choropleth', getChoroplethData);

// District metrics (detailed): protected for admin/officer
router.get('/district/:districtId/metrics', auth, role(['ADMIN','OFFICER']), getDistrictMetrics);

module.exports = router;
