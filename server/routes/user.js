const express  = require("express");
const router   = express.Router();
const User     = require("../models/User");
const Token    = require("../models/Token");
const { protect } = require("../middleware/auth");

const publicUser = (u) => ({
  _id: u._id, fullName: u.fullName, email: u.email,
  college: u.college, title: u.title, github: u.github,
  linkedin: u.linkedin, profileImage: u.profileImage,
  resumeVisibility: u.resumeVisibility, notifications: u.notifications,
  twoFactorEnabled: u.twoFactorEnabled, darkMode: u.darkMode,
  createdAt: u.createdAt,
});

router.use(protect);

// GET /api/user/profile
router.get("/profile", (req, res) => res.json(publicUser(req.user)));

// PUT /api/user/profile
router.put("/profile", async (req, res) => {
  try {
    const allowed = ["fullName","college","title","github","linkedin",
                     "profileImage","resumeVisibility","notifications",
                     "twoFactorEnabled","darkMode"];
    const user = await User.findById(req.user._id);
    allowed.forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
    const updated = await user.save({ validateModifiedOnly: true });
    res.json(publicUser(updated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/user/password
router.put("/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    await Token.updateMany({ user: user._id }, { isRevoked: true });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/user/account
router.delete("/account", async (req, res) => {
  try {
    await Token.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
