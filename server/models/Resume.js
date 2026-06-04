const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fileName:    { type: String, default: "" },
    filePath:    { type: String, default: "" },
    score:       { type: Number, default: 0 },
    skills:      [{ type: String }],
    suggestions: [{ type: String }],
    aiAnalysis:  { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
