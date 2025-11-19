const Announcement = require("../models/Announcement");

// ADMIN: Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, targetDistrict } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      priority,
      targetDistrict: targetDistrict || null,
      createdBy: req.user.id
    });

    res.json({
      message: "Announcement created successfully",
      announcement
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const list = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role");

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// OFFICER: Get announcements relevant to him
exports.getMyAnnouncements = async (req, res) => {
  try {
    const userDistrict = req.user.districtId;

    const list = await Announcement.find({
      $or: [
        { targetDistrict: null },        // broadcast to all
        { targetDistrict: userDistrict } // district-specific
      ]
    }).sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// OFFICER: Mark announcement read
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Announcement.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: req.user.id } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Marked as read", updated });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ message: "Announcement deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
