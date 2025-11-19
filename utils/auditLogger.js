const AuditLog = require("../models/AuditLog");

async function logAction(adminId, action, module, details = {}, ipAddress = null) {
  try {
    await AuditLog.create({
      adminId,
      action,
      module,
      details,
      ipAddress
    });
  } catch (err) {
    console.error("Audit Log Error:", err.message);
  }
}

module.exports = logAction;
