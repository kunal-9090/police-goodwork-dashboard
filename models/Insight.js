const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema({
  type: { type: String, required: true },        // e.g., "SUMMARY", "ANOMALY", "FORECAST"
  period: { type: Object, default: {} },         // { start, end }
  payload: { type: Object, default: {} },        // saved result object
  text: { type: String, default: "" },           // NL summary
}, { timestamps: true });

module.exports = mongoose.model("Insight", insightSchema);
