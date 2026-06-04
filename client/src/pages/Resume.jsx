import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import api from "../api/axios";
import { MdUpload, MdDescription, MdStar, MdCheckCircle, MdLightbulb } from "react-icons/md";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import "./Resume.css";

export default function Resume() {
  const [resume, setResume]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const fileRef = useRef();

  useEffect(() => {
    api.get("/resume")
      .then(({ data }) => setResume(data))
      .catch(() => {}) // no resume yet — fine
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return setError("Select a file first");
    setError(""); setSuccess(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const { data } = await api.post("/resume/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResume(data);
      setSuccess("Resume uploaded and analysed!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const radialData = [{ value: resume?.score || 0, fill: "#4f46e5" }];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-title">Resume Analyser</h1>
        <p className="page-sub">Upload your resume and get AI-powered feedback</p>

        {/* Upload card */}
        <div className="card resume-upload-card">
          <div className="upload-area" onClick={() => fileRef.current?.click()}>
            <MdUpload className="upload-icon" />
            <p className="upload-text">Click to upload or drag & drop</p>
            <p className="upload-hint">PDF, DOC, DOCX — max 5 MB</p>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" hidden onChange={handleUpload} />
          </div>
          {error   && <div className="alert alert-error"   style={{ marginTop:".75rem" }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginTop:".75rem" }}>{success}</div>}
          {uploading && <div className="spinner" />}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : resume ? (
          <>
            {/* Stats */}
            <div className="stats-grid" style={{ margin:"1.5rem 0" }}>
              <StatCard icon={<MdStar />}        label="Resume Score"    value={`${resume.score}%`}        color="primary" />
              <StatCard icon={<MdDescription />} label="Skills Found"    value={resume.skills?.length || 0} color="success" />
              <StatCard icon={<MdLightbulb />}   label="Suggestions"     value={resume.suggestions?.length || 0} color="warning" />
              <StatCard icon={<MdCheckCircle />}  label="File"           value={resume.fileName || "—"}     color="danger" sub={resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : ""} />
            </div>

            <div className="resume-analysis">
              {/* Score chart */}
              <div className="card score-card">
                <h3 className="chart-title">Resume Score</h3>
                <div style={{ position:"relative" }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                      data={radialData} startAngle={90} endAngle={-270}>
                      <RadialBar dataKey="value" cornerRadius={10} background />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <p className="chart-center-label">{resume.score}%</p>
                </div>
                {resume.aiAnalysis && (
                  <p className="ai-analysis">{resume.aiAnalysis}</p>
                )}
              </div>

              <div className="resume-right">
                {/* Detected skills */}
                <div className="card">
                  <h3 className="section-title" style={{ marginBottom:".85rem" }}>Detected Skills</h3>
                  <div className="int-skills">
                    {resume.skills?.map((s) => (
                      <span key={s} className="skill-tag">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="card" style={{ marginTop:"1rem" }}>
                  <h3 className="section-title" style={{ marginBottom:".85rem" }}>Suggestions</h3>
                  <ul className="suggestions-list">
                    {resume.suggestions?.map((s, i) => (
                      <li key={i}><MdLightbulb className="suggest-icon" />{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop:"2rem" }}>
            <MdDescription />
            <p>No resume uploaded yet. Upload one above to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
