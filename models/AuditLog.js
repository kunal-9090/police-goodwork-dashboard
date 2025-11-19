const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    module: {
      type: String,
      required: true,
      enum: [
        "NDPS",
        "WITHDRAWAL",
        "CERTIFICATE",
        "ANNOUNCEMENT",
        "USER",
        "STATION",
        "GIS",
        "SYSTEM"
      ],
    },

    details: {
      type: Object, // flexible JSON object for storing extra info
      default: {},
    },

    ipAddress: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
