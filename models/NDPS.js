const mongoose = require("mongoose");

const ndpsSchema = new mongoose.Schema({
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  districtId: {
    type: String,
    required: true
  },

  // ⭐ MODULE 9 — POLICE STATION LEVEL MAPPING
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PoliceStation",
    default: null
  },

  // ⭐ MODULE 9 — BEAT LEVEL MAPPING
  beatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Beat",
    default: null
  },

  // Basic details
  date: {
    type: Date,
    default: Date.now
  },

  // ⭐ OPTIONAL — place / area name (for map popup)
  placeName: {
    type: String,
    default: null
  },

  // ⭐ GEO-SPATIAL LOCATION (for GIS Mapping & Heatmap)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined
    }
  },

  // NDPS Case Metrics
  casesRegistered: Number,
  personsArrested: Number,

  ganjaSeizedKg: Number,
  brownSugarSeizedGm: Number,
  vehiclesSeized: Number,
  ganjaPlantsDestroyed: Number,
  bhangaKg: Number,
  opiumGm: Number,
  coughSyrupBottles: Number,
  cashSeized: Number,

  // Points
  pointsAwarded: {
    type: Number,
    default: 0
  },

  // Workflow
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },

  adminRemark: {
    type: String,
    default: ""
  }

}, { timestamps: true });

// ⭐ GEO INDEX
ndpsSchema.index({ location: "2dsphere" });

// ⭐ SPEED UP STATION/BEAT ANALYTICS
ndpsSchema.index({ stationId: 1 });
ndpsSchema.index({ beatId: 1 });
ndpsSchema.index({ districtId: 1 });

module.exports = mongoose.model("NDPS", ndpsSchema);
