const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");

const questionBank = {
  frontend: [
    "What is the difference between var, let, and const in JavaScript?",
    "Explain the CSS box model and how margin, padding and border interact.",
    "What are React hooks? Explain useState and useEffect with examples.",
    "How does the Virtual DOM work and why is it faster than direct DOM manipulation?",
    "What is the difference between == and === in JavaScript?",
    "Explain event bubbling and event delegation in JavaScript.",
    "What is a closure in JavaScript? Give a practical example.",
  ],
  backend: [
    "What is REST and what are its key architectural principles?",
    "Explain the difference between SQL and NoSQL databases with examples.",
    "What is middleware in Express.js? How does it work?",
    "How does JWT authentication work? What are access and refresh tokens?",
    "What is the event loop in Node.js and how does it handle async operations?",
    "Explain database indexing and when you would use it.",
    "What is the difference between authentication and authorisation?",
  ],
  fullstack: [
    "Explain the MVC architecture pattern.",
    "What is CORS? How do you handle it in an Express app?",
    "What is the difference between client-side and server-side rendering?",
    "How would you optimise a slow database query?",
    "Explain the difference between cookies, sessionStorage and localStorage.",
    "What is a RESTful API? How would you version one?",
    "How do you handle errors in both frontend and backend?",
  ],
  hr: [
    "Tell me about yourself and your background.",
    "Where do you see yourself in 5 years?",
    "What are your greatest strengths and weaknesses?",
    "Describe a challenging project you have worked on and how you handled it.",
    "Why do you want to work at this company?",
    "How do you handle tight deadlines and pressure?",
    "Tell me about a time you worked in a team and faced a conflict.",
  ],
};

// GET /api/interview/questions/:type
router.get("/questions/:type", protect, (req, res) => {
  const questions = questionBank[req.params.type];
  if (!questions) return res.status(400).json({ message: "Invalid type. Use: frontend, backend, fullstack, hr" });
  res.json({ type: req.params.type, questions });
});

// POST /api/interview/feedback
router.post("/feedback", protect, async (req, res) => {
  try {
    const { question, answer, type } = req.body;
    if (!question || !answer)
      return res.status(400).json({ message: "Question and answer are required" });

    let feedback = "Good attempt! Structure your answer clearly — definition first, then an example. Review this topic and try again.";

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(
          `You are a ${type} interview coach for BTech students.\nQuestion: "${question}"\nCandidate answer: "${answer}"\nProvide 2-3 sentence feedback: what was good and what to improve.`
        );
        feedback = result.response.text();
      } catch { /* fall back */ }
    }

    res.json({ feedback });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
