const mongoose = require("mongoose");

const beatSchema = new mongoose.Schema({
  beatId: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PoliceStation",
    required: true
  },

  districtId: {
    type: String,
    required: true
  },

  boundary: {
    type: {
      type: String,
      enum: ["Polygon"],
      default: "Polygon"
    },

    coordinates: {
      type: [[[Number]]], // GeoJSON polygon
      default: undefined
    }
  }

}, { timestamps: true });

beatSchema.index({ boundary: "2dsphere" });

module.exports = mongoose.model("Beat", beatSchema);
