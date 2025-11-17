const mongoose = require("mongoose");

const policeStationSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  districtId: {
    type: String,
    required: true
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lon, lat]
      default: undefined
    }
  },

  // Optional: Station in-charge
  officerInCharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }

}, { timestamps: true });

policeStationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("PoliceStation", policeStationSchema);
