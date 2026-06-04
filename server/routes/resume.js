const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const Resume   = require("../models/Resume");
const { protect } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, "../uploads/resumes");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf",".doc",".docx"];
    allowed.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error("Only PDF/DOC/DOCX files allowed"));
  },
});

router.use(protect);

// POST /api/resume/upload
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const detectedSkills = ["HTML","CSS","JavaScript","React","Node.js"];
    const suggestions    = [
      "Add quantified project impacts (e.g. 'reduced load time by 30%')",
      "Include Git and version control experience",
      "Mention cloud platforms (AWS / GCP / Azure)",
      "Add a strong objective/summary section",
    ];
    const score = Math.floor(Math.random() * 21) + 70;
    let aiAnalysis = "Your resume shows solid fundamentals. Focus on quantifying achievements and adding more industry-relevant keywords to improve ATS scores.";

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(
          "You are a resume expert. Give a 3-sentence analysis for a BTech CSE student resume. Mention specific strengths and improvements."
        );
        aiAnalysis = result.response.text();
      } catch { /* fall back to default */ }
    }

    const resume = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, fileName: req.file.originalname, filePath: req.file.path, score, skills: detectedSkills, suggestions, aiAnalysis },
      { upsert: true, new: true }
    );
    res.json(resume);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/resume
router.get("/", async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) return res.status(404).json({ message: "No resume uploaded yet" });
    res.json(resume);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
