const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getMyProfile,
  updateProfile,
  updateProfilePhoto
} = require("../controllers/profileController");

// -------------------------------------
// GET MY PROFILE
// -------------------------------------
router.get("/me", auth, getMyProfile);

// -------------------------------------
// UPDATE PROFILE DETAILS
// -------------------------------------
router.put("/update", auth, updateProfile);

// -------------------------------------
// UPDATE PROFILE PHOTO (Cloudinary Upload)
// Field name → "photo"
// -------------------------------------
router.put(
  "/photo",
  auth,
  upload.single("photo"), // Accept only 1 file
  updateProfilePhoto
);

module.exports = router;
