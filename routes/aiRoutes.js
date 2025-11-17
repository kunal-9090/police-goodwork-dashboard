const express = require("express");
const router = express.Router();
const ai = require("../controllers/aiController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Public summary or protected? Keep summary public for now, restrict runAll to admin
router.get("/summary", ai.getSummary);
router.get("/anomalies", ai.getAnomalies);
router.get("/predict-underperforming", ai.getUnderperforming);
router.get("/forecast", ai.getForecast);
router.get("/resource-suggestions", ai.getResourceSuggestions);

// run pipeline (admin)
router.post("/run", auth, role(["ADMIN"]), ai.runAll);

module.exports = router;
