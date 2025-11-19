const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// -----------------------------
// CLOUDINARY STORAGE
// -----------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "police-profiles",
      allowed_formats: ["jpg", "jpeg", "png"],
      public_id: `profile_${req.user?.id}_${Date.now()}`, // Unique filename
    };
  },
});

// -----------------------------
// MULTER UPLOAD CONFIG
// -----------------------------
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, JPEG, and PNG files are allowed"));
    }

    cb(null, true);
  },
});

module.exports = upload;
