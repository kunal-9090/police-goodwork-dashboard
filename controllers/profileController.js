const User = require("../models/User");

// --------------------------------------
// GET MY PROFILE
// --------------------------------------
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --------------------------------------
// UPDATE BASIC DETAILS
// --------------------------------------
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, designation, districtId } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { 
        ...(name && { name }),
        ...(phone && { phone }),
        ...(designation && { designation }),
        ...(districtId && { districtId })
      },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --------------------------------------
// UPDATE PROFILE PHOTO (Cloudinary)
// --------------------------------------
exports.updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const photoUrl = req.file.path; // Cloudinary returns URL here

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto: photoUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile photo updated successfully",
      user,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
