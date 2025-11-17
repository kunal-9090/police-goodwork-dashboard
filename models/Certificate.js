const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ndpsEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NDPS",
      required: true,
    },

    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    pdfUrl: {
      type: String,
      required: true,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
