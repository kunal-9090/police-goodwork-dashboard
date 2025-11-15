const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");

// Import Middlewares
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const app = express();

// Connect MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Police Good Work Dashboard backend is running",
  });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// -------------------------
// Protected Route Example
// -------------------------
app.get(
  "/api/admin-only",
  authMiddleware,                 // Check valid JWT token
  roleMiddleware(["ADMIN"]),      // Only ADMIN can access
  (req, res) => {
    res.json({
      message: "Admin access granted successfully!",
      user: req.user,
    });
  }
);

// -------------------------
// Officer-only protected route example
// -------------------------
app.get(
  "/api/officer-only",
  authMiddleware,
  roleMiddleware(["OFFICER"]),
  (req, res) => {
    res.json({
      message: "Officer access granted successfully!",
      user: req.user,
    });
  }
);

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
