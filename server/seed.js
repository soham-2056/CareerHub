const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Apply DNS fallback
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const Internship = require("./models/Internship");

const sampleInternships = [
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
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected! Cleaning old internships...");
    await Internship.deleteMany({});
    console.log("Inserting sample internships...");
    await Internship.insertMany(sampleInternships);
    console.log("✅ Database seeded successfully with 10 internships!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
