const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const ndpsRoutes = require("./routes/ndpsRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const certificateRoutes = require("./routes/certificateRoutes");   // ⭐ Module 6
const adminRoutes = require("./routes/adminRoutes");               // ⭐ Module 7
const gisRoutes = require("./routes/gisRoutes");                   // ⭐ Module 8
const stationRoutes = require("./routes/stationRoutes");           // ⭐ Module 9
const aiRoutes = require("./routes/aiRoutes");                     // ⭐ Module 10

// Middlewares
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const app = express();

// -----------------------------
// CONNECT TO DATABASE
// -----------------------------
connectDB();

// -----------------------------
// GLOBAL MIDDLEWARES
// -----------------------------
app.use(cors());
app.use(express.json());

// -----------------------------
// HEALTH CHECK
// -----------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Police Good Work Dashboard backend is running 🚔",
  });
});

// -----------------------------
// MODULE 1 — AUTH
// -----------------------------
app.use("/api/auth", authRoutes);

// -----------------------------
// MODULE 2 — NDPS (Case Submission)
// -----------------------------
app.use("/api/ndps", ndpsRoutes);

// -----------------------------
// MODULE 3 — LEADERBOARD
// -----------------------------
app.use("/api/leaderboard", leaderboardRoutes);

// -----------------------------
// MODULE 4 — ANALYTICS
// -----------------------------
app.use("/api/analytics", analyticsRoutes);

// -----------------------------
// MODULE 5 — WITHDRAWAL REQUESTS
// -----------------------------
app.use("/api/withdrawal", withdrawalRoutes);

// -----------------------------
// MODULE 6 — CERTIFICATE SYSTEM
// -----------------------------
app.use("/api/certificates", certificateRoutes);

// -----------------------------
// MODULE 7 — ADMIN DASHBOARD
// -----------------------------
app.use("/api/admin", adminRoutes);

// -----------------------------
// MODULE 8 — GIS (Heatmap + Choropleth)
// -----------------------------
app.use("/api/gis", gisRoutes);

// -----------------------------
// MODULE 9 — POLICE STATION & BEAT ANALYTICS
// -----------------------------
app.use("/api/stations", stationRoutes);

// -----------------------------
// ⭐ MODULE 10 — AI INSIGHTS & PREDICTIVE POLICING
// -----------------------------
app.use("/api/ai", aiRoutes);

// -----------------------------
// OPTIONAL — Enable Cron Jobs (AI Daily Summary)
// -----------------------------
if (process.env.ENABLE_CRON === "true") {
  try {
    require("./cron/insightsCron");
    console.log("📅 CRON Enabled: AI Insights Scheduler Running");
  } catch (err) {
    console.error("Cron load error:", err.message);
  }
}

// -----------------------------
// ROLE TEST ROUTES
// -----------------------------
app.get("/api/admin-only", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => {
  res.json({
    message: "Admin access granted successfully!",
    user: req.user,
  });
});

app.get("/api/officer-only", authMiddleware, roleMiddleware(["OFFICER"]), (req, res) => {
  res.json({
    message: "Officer access granted successfully!",
    user: req.user,
  });
});

// -----------------------------
// 404 — ROUTE NOT FOUND
// -----------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// -----------------------------
// START SERVER
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
