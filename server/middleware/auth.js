const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "access")
      return res.status(401).json({ message: "Invalid token type" });

    const user = await User.findById(decoded.id).select("-password -resetPasswordToken -resetPasswordExpire");
    if (!user) return res.status(401).json({ message: "Account no longer exists" });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { protect };
