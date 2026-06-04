import { useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { MdQuiz, MdArrowForward, MdLightbulb, MdCheckCircle } from "react-icons/md";
import "./MockInterview.css";

const TYPES = [
  { value: "frontend",  label: "Frontend Developer" },
  { value: "backend",   label: "Backend Developer"  },
  { value: "fullstack", label: "Full Stack"          },
  { value: "hr",        label: "HR Round"            },
];

export default function MockInterview() {
  const [type, setType]         = useState("frontend");
  const [questions, setQuestions] = useState([]);
  const [index, setIndex]       = useState(0);
  const [answer, setAnswer]     = useState("");
  const [feedback, setFeedback] = useState("");
  const [stage, setStage]       = useState("setup"); // setup | interview | feedback | done
  const [loading, setLoading]   = useState(false);

  const startInterview = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/interview/questions/${type}`);
      setQuestions(data.questions);
      setIndex(0);
      setAnswer("");
      setFeedback("");
      setStage("interview");
    } catch {
      alert("Failed to load questions. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/interview/feedback", {
        question: questions[index],
        answer,
        type,
      });
      setFeedback(data.feedback);
      setStage("feedback");
    } catch {
      setFeedback("Good attempt! Keep practising and reviewing your answers.");
      setStage("feedback");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (index + 1 >= questions.length) {
      setStage("done");
    } else {
      setIndex((p) => p + 1);
      setAnswer("");
      setFeedback("");
      setStage("interview");
    }
  };

  const reset = () => {
    setStage("setup");
    setQuestions([]);
    setIndex(0);
    setAnswer("");
    setFeedback("");
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-title">Mock Interview</h1>
        <p className="page-sub">Practise with real interview questions and get AI feedback</p>

        {/* Setup */}
        {stage === "setup" && (
          <div className="card interview-setup">
            <MdQuiz className="setup-icon" />
            <h2>Choose Interview Type</h2>
            <p>Select a category and start practising with curated questions</p>
            <div className="type-grid">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  className={`type-btn ${type === t.value ? "active" : ""}`}
                  onClick={() => setType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={startInterview} disabled={loading}>
              {loading ? "Loading…" : <>Start Interview <MdArrowForward /></>}
            </button>
          </div>
        )}

        {/* Interview */}
        {stage === "interview" && (
          <div className="interview-area">
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${((index) / questions.length) * 100}%` }} />
            </div>
            <p className="question-count">Question {index + 1} of {questions.length}</p>

            <div className="card question-card">
              <h3 className="question-text">{questions[index]}</h3>
            </div>

            <div className="card answer-card">
              <label className="answer-label">Your Answer</label>
              <textarea
                className="answer-textarea"
                rows={6}
                placeholder="Type your answer here…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button className="btn btn-primary" onClick={submitAnswer} disabled={loading || !answer.trim()}>
                {loading ? "Getting feedback…" : "Submit Answer"}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {stage === "feedback" && (
          <div className="interview-area">
            <div className="card question-card">
              <h3 className="question-text">{questions[index]}</h3>
            </div>
            <div className="card answer-card">
              <p className="answer-label">Your Answer</p>
              <p className="answer-display">{answer}</p>
            </div>
            <div className="card feedback-card">
              <div className="feedback-head">
                <MdLightbulb className="feedback-icon" />
                <h3>AI Feedback</h3>
              </div>
              <p className="feedback-text">{feedback}</p>
              <button className="btn btn-primary" onClick={nextQuestion} style={{ marginTop:"1rem" }}>
                {index + 1 >= questions.length ? "Finish Interview" : <>Next Question <MdArrowForward /></>}
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {stage === "done" && (
          <div className="card interview-done">
            <MdCheckCircle className="done-icon" />
            <h2>Interview Complete!</h2>
            <p>Great job completing the {TYPES.find((t) => t.value === type)?.label} interview.</p>
            <p className="done-tip">Keep practising to improve your answers and confidence.</p>
            <button className="btn btn-primary" onClick={reset}>Start Another</button>
          </div>
        )}
      </main>
    </div>
  );
}
