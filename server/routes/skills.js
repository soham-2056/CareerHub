const express  = require("express");
const router   = express.Router();
const Skill    = require("../models/Skill");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(skills);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { name, level } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Skill name required" });
    const exists = await Skill.findOne({ user: req.user._id, name: name.trim() });
    if (exists) return res.status(400).json({ message: "Skill already added" });
    const skill = await Skill.create({ user: req.user._id, name: name.trim(), level });
    res.status(201).json(skill);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, user: req.user._id });
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    if (req.body.name)  skill.name  = req.body.name.trim();
    if (req.body.level) skill.level = req.body.level;
    await skill.save();
    res.json(skill);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json({ message: "Skill deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
