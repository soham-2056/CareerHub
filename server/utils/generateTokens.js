const jwt    = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Short-lived access token — kept in memory on the client (never localStorage).
 * 15 minutes is tight enough to limit damage if stolen.
 */
const generateAccessToken = (userId) =>
  jwt.sign(
    { id: userId, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );

/**
 * Long-lived refresh token — opaque random string, stored in DB.
 * NOT a JWT so it can be revoked server-side at any time.
 */
const generateRefreshToken = () => crypto.randomBytes(40).toString("hex");

/**
 * New token family ID — used to detect refresh token reuse (theft detection).
 */
const generateFamily = () => crypto.randomBytes(16).toString("hex");

module.exports = { generateAccessToken, generateRefreshToken, generateFamily };
