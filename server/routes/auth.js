const express = require("express");
const router  = express.Router();
const crypto  = require("crypto");
const User    = require("../models/User");
const Token   = require("../models/Token");
const { protect }          = require("../middleware/auth");
const { authRateLimiter }  = require("../middleware/rateLimiter");
const { generateAccessToken, generateRefreshToken, generateFamily } = require("../utils/generateTokens");

const REFRESH_EXPIRY_MS = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || "7") * 864e5;

const publicUser = (u) => ({
  _id: u._id, fullName: u.fullName, email: u.email,
  college: u.college, title: u.title, github: u.github,
  linkedin: u.linkedin, profileImage: u.profileImage, darkMode: u.darkMode,
});

const issueTokenPair = async (userId, family, ip) => {
  const accessToken  = generateAccessToken(userId);
  const refreshToken = generateRefreshToken();
  await Token.create({
    user: userId, token: refreshToken, family, isRevoked: false,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS), createdByIp: ip || "",
  });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName?.trim() || !email?.trim() || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ message: "Invalid email format" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (await User.findOne({ email: email.toLowerCase().trim() }))
      return res.status(409).json({ message: "Email already registered" });

    const user   = await User.create({ fullName: fullName.trim(), email, password });
    const family = generateFamily();
    const { accessToken, refreshToken } = await issueTokenPair(user._id, family, req.ip);
    res.status(201).json({ user: publicUser(user), accessToken, refreshToken });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password)
      return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });
    const family = generateFamily();
    const { accessToken, refreshToken } = await issueTokenPair(user._id, family, req.ip);
    res.json({ user: publicUser(user), accessToken, refreshToken });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });
    const stored = await Token.findOne({ token: refreshToken });
    if (!stored) return res.status(401).json({ message: "Invalid refresh token" });
    if (stored.isRevoked) {
      await Token.updateMany({ family: stored.family }, { isRevoked: true });
      return res.status(401).json({ message: "Token reuse detected — please log in again" });
    }
    if (stored.expiresAt < new Date()) {
      await Token.updateOne({ _id: stored._id }, { isRevoked: true });
      return res.status(401).json({ message: "Refresh token expired — please log in again" });
    }
    await Token.updateOne({ _id: stored._id }, { isRevoked: true });
    const user = await User.findById(stored.user);
    if (!user) return res.status(401).json({ message: "Account not found" });
    const { accessToken, refreshToken: newRT } = await issueTokenPair(stored.user, stored.family, req.ip);
    res.json({ user: publicUser(user), accessToken, refreshToken: newRT });
  } catch (err) {
  console.error("=================================");
  console.error("REGISTER ERROR:");
  console.error(err);
  console.error("=================================");

  res.status(500).json({
    message: "Registration failed",
    error: err.message
  });
}
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await Token.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
    res.json({ message: "Logged out successfully" });
  } catch { res.json({ message: "Logged out" }); }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => res.json({ user: publicUser(req.user) }));

// POST /api/auth/forgot-password
router.post("/forgot-password", authRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json({ message: "If that email is registered, a reset link has been sent." });
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed   = crypto.createHash("sha256").update(rawToken).digest("hex");
    await User.updateOne({ _id: user._id }, {
      resetPasswordToken:  hashed,
      resetPasswordExpire: new Date(Date.now() + 3600000),
    });
    res.json({ message: "If that email is registered, a reset link has been sent.", resetToken: rawToken });
  } catch (err) { res.status(500).json({ message: "Could not process request" }); }
});

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", authRateLimiter, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user   = await User.findOne({
      resetPasswordToken: hashed, resetPasswordExpire: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "Reset link is invalid or expired" });
    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    await Token.updateMany({ user: user._id }, { isRevoked: true });
    res.json({ message: "Password reset successful. Please log in." });
  } catch (err) { res.status(500).json({ message: "Password reset failed" }); }
});

module.exports = router;
