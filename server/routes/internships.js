const express     = require("express");
const router      = express.Router();
const Internship  = require("../models/Internship");
const Application = require("../models/Application");
const { protect } = require("../middleware/auth");

// GET /api/internships
router.get("/", async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.query.category && req.query.category !== "all")
      query.category = req.query.category;
    let list = await Internship.find(query).sort({ createdAt: -1 });
    if (req.query.search) {
      const s = req.query.search.toLowerCase();
      list = list.filter((i) =>
        i.title.toLowerCase().includes(s) ||
        i.company.toLowerCase().includes(s) ||
        i.location.toLowerCase().includes(s)
      );
    }
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/internships/my-applications
router.get("/my-applications", protect, async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user._id })
      .populate("internship").sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/internships/apply/:id
router.post("/apply/:id", protect, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found" });
    const existing = await Application.findOne({ user: req.user._id, internship: internship._id });
    if (existing) return res.status(400).json({ message: "Already applied" });
    const app = await Application.create({ user: req.user._id, internship: internship._id });
    res.status(201).json({ message: "Application submitted!", application: app });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/internships/seed
router.post("/seed", async (req, res) => {
  try {
    await Internship.deleteMany({});
    await Internship.insertMany([
      { title:"Frontend Developer Intern",  company:"Google",    location:"Bangalore", type:"Hybrid",  duration:"3 months", stipend:"₹25,000/mo", category:"frontend",  skills:["React","CSS","JavaScript"] },
      { title:"Backend Developer Intern",   company:"Microsoft", location:"Hyderabad", type:"Remote",  duration:"6 months", stipend:"₹30,000/mo", category:"backend",   skills:["Node.js","Express","MongoDB"] },
      { title:"Full Stack Intern",          company:"Amazon",    location:"Remote",    type:"Remote",  duration:"4 months", stipend:"₹20,000/mo", category:"fullstack", skills:["React","Node.js","AWS"] },
      { title:"Java Developer Intern",      company:"Infosys",   location:"Pune",      type:"On-site", duration:"3 months", stipend:"₹15,000/mo", category:"java",      skills:["Java","Spring Boot"] },
      { title:"Python Developer Intern",    company:"TCS",       location:"Chennai",   type:"Hybrid",  duration:"3 months", stipend:"₹18,000/mo", category:"python",    skills:["Python","Django","REST APIs"] },
      { title:"UI/UX Design Intern",        company:"Adobe",     location:"Noida",     type:"Remote",  duration:"2 months", stipend:"₹12,000/mo", category:"uiux",      skills:["Figma","Adobe XD"] },
      { title:"Data Science Intern",        company:"Flipkart",  location:"Bangalore", type:"Hybrid",  duration:"6 months", stipend:"₹35,000/mo", category:"data",      skills:["Python","Machine Learning","SQL"] },
      { title:"React Native Intern",        company:"Swiggy",    location:"Bangalore", type:"Hybrid",  duration:"3 months", stipend:"₹22,000/mo", category:"frontend",  skills:["React Native","JavaScript"] },
      { title:"DevOps Intern",              company:"Razorpay",  location:"Remote",    type:"Remote",  duration:"4 months", stipend:"₹28,000/mo", category:"backend",   skills:["Docker","Kubernetes","CI/CD"] },
      { title:"ML Engineer Intern",         company:"Ola",       location:"Bangalore", type:"Hybrid",  duration:"6 months", stipend:"₹32,000/mo", category:"data",      skills:["TensorFlow","Python","Data Analysis"] },
    ]);
    res.json({ message: "Seeded 10 internships ✅" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
