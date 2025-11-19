const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// HTTP + SOCKET.IO
const http = require("http");
const { Server } = require("socket.io");

// Import Routes (Modules 1 → 20)
const authRoutes = require("./routes/authRoutes");
const ndpsRoutes = require("./routes/ndpsRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const certificateRoutes = require("./routes/certificateRoutes");   // Module 6
const adminRoutes = require("./routes/adminRoutes");               // Module 7
const gisRoutes = require("./routes/gisRoutes");                   // Module 8
const stationRoutes = require("./routes/stationRoutes");           // Module 9
const aiRoutes = require("./routes/aiRoutes");                     // Module 10
const notificationRoutes = require("./routes/notificationRoutes"); // Module 11
const announcementRoutes = require("./routes/announcementRoutes"); // Module 12/13
const profileRoutes = require("./routes/profileRoutes");           // Module 15
const auditRoutes = require("./routes/auditRoutes");               // Module 16
const exportRoutes = require("./routes/exportRoutes");             // Module 17
const advancedAnalyticsRoutes = require("./routes/advancedAnalyticsRoutes"); // Module 18
const rankingRoutes = require("./routes/rankingRoutes");           // Module 19
const globalSearchRoutes = require("./routes/globalSearchRoutes"); // ⭐ Module 20 NEW

// Middleware
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const app = express();

// -------------------------------------------------------
// DATABASE CONNECTION
// -------------------------------------------------------
connectDB();

// -------------------------------------------------------
// CREATE SERVER (Socket.IO Support)
// -------------------------------------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
app.set("io", io);

// SOCKET.IO EVENTS
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// -------------------------------------------------------
// GLOBAL MIDDLEWARES
// -------------------------------------------------------
app.use(cors());
app.use(express.json());

// -------------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Police Good Work Dashboard backend is running 🚔",
  });
});

// -------------------------------------------------------
// MODULE ROUTES (1 → 20)
// -------------------------------------------------------

// 1. Auth
app.use("/api/auth", authRoutes);

// 2. NDPS Cases
app.use("/api/ndps", ndpsRoutes);

// 3. Leaderboard
app.use("/api/leaderboard", leaderboardRoutes);

// 4. Analytics
app.use("/api/analytics", analyticsRoutes);

// 5. Withdrawals
app.use("/api/withdrawal", withdrawalRoutes);

// 6. Certificates
app.use("/api/certificates", certificateRoutes);

// 7. Admin
app.use("/api/admin", adminRoutes);

// 8. GIS
app.use("/api/gis", gisRoutes);

// 9. Station Analytics
app.use("/api/stations", stationRoutes);

// 10. AI Insights
app.use("/api/ai", aiRoutes);

// 11. Notifications
app.use("/api/notifications", notificationRoutes);

// 12/13. Announcements
app.use("/api/announcements", announcementRoutes);

// 15. Profile Management
app.use("/api/profile", profileRoutes);

// 16. Audit Logs
app.use("/api/audit", auditRoutes);

// 17. Export System (PDF/Excel)
app.use("/api/export", exportRoutes);

// 18. Advanced Analytics
app.use("/api/advanced-analytics", advancedAnalyticsRoutes);

// 19. Ranking + Hotspot Prediction
app.use("/api/ranking", rankingRoutes);

// ⭐ 20. Global Search Engine
app.use("/api/search", globalSearchRoutes);

// -------------------------------------------------------
// OPTIONAL CRON JOBS
// -------------------------------------------------------
if (process.env.ENABLE_CRON === "true") {
  try {
    require("./cron/insightsCron");
    console.log("📅 CRON Enabled: AI Insights Scheduler Running");
  } catch (err) {
    console.error("CRON Load Error:", err.message);
  }
}

// -------------------------------------------------------
// ROLE TEST ROUTES
// -------------------------------------------------------
app.get(
  "/api/admin-only",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  (req, res) => res.json({ message: "Admin access granted!", user: req.user })
);

app.get(
  "/api/officer-only",
  authMiddleware,
  roleMiddleware(["OFFICER"]),
  (req, res) => res.json({ message: "Officer access granted!", user: req.user })
);

// -------------------------------------------------------
// 404 HANDLER
// -------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// -------------------------------------------------------
// START SERVER
// -------------------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend + WebSocket running on port ${PORT}`);
});
