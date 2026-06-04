const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    company:     { type: String, required: true },
    location:    { type: String, default: "Remote" },
    type:        { type: String, enum: ["Remote","Hybrid","On-site"], default: "Remote" },
    duration:    { type: String, default: "3 months" },
    stipend:     { type: String, default: "Unpaid" },
    category:    { type: String, enum: ["frontend","backend","fullstack","java","python","uiux","data"], required: true },
    skills:      [{ type: String }],
    description: { type: String, default: "" },
    applyLink:   { type: String, default: "" },
    deadline:    { type: Date },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Internship", internshipSchema);
