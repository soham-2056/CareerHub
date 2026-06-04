const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

// Fix DNS issues with MongoDB Atlas
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

const app = express();

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.removeHeader("X-Powered-By");
  next();
});

// ===================== CORS =====================
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,https://career-hub-neon-alpha.vercel.app"
).split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked:", origin);
        callback(new Error("CORS blocked"));
      }
    },
    credentials: true,
  })
);
// ================================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/internships", require("./routes/internships"));
app.use("/api/resume", require("./routes/resume"));
app.use("/api/interview", require("./routes/interview"));

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    db: "MongoDB Atlas",
    ts: new Date().toISOString(),
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Error Handler
app.use((err, _req, res, _next) => {
  console.error("❌ Server Error:", err.message);

  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server → ${PORT}`);
      console.log(`📋 Health → /api/health`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });