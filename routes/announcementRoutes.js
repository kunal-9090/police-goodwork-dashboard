const express = require("express");
const router = express.Router();
const { 
  createAnnouncement, 
  getAllAnnouncements, 
  getMyAnnouncements, 
  markRead,
  deleteAnnouncement 
} = require("../controllers/announcementController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// ADMIN: Create announcement
router.post("/create", auth, role(["ADMIN"]), createAnnouncement);

// ALL: Get all announcements
router.get("/all", getAllAnnouncements);

// OFFICER: Get district-specific + global announcements
router.get("/my", auth, getMyAnnouncements);

// OFFICER: Mark as read
router.patch("/read/:id", auth, role(["OFFICER", "ADMIN"]), markRead);

// ADMIN: Delete announcement
router.delete("/delete/:id", auth, role(["ADMIN"]), deleteAnnouncement);

module.exports = router;
