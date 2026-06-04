import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import api from "../api/axios";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdSchool } from "react-icons/md";
import "./Skills.css";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function Skills() {
  const [skills, setSkills]   = useState([]);
  const [search, setSearch]   = useState("");
  const [form, setForm]       = useState({ name: "", level: "Beginner" });
  const [editing, setEditing] = useState(null); // skill._id being edited
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSkills = async () => {
    try {
      const { data } = await api.get("/skills");
      setSkills(data);
    } catch {
      setError("Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSkills(); }, []);

  const filtered = skills.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const counts = LEVELS.reduce((acc, l) => {
    acc[l] = skills.filter((s) => s.level === l).length;
    return acc;
  }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        const { data } = await api.put(`/skills/${editing}`, form);
        setSkills((p) => p.map((s) => (s._id === editing ? data : s)));
        setEditing(null);
      } else {
        const { data } = await api.post("/skills", form);
        setSkills((p) => [data, ...p]);
      }
      setForm({ name: "", level: "Beginner" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save skill");
    }
  };

  const startEdit = (skill) => {
    setEditing(skill._id);
    setForm({ name: skill.name, level: skill.level });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: "", level: "Beginner" });
    setError("");
  };

  const deleteSkill = async (id) => {
    if (!confirm("Delete this skill?")) return;
    try {
      await api.delete(`/skills/${id}`);
      setSkills((p) => p.filter((s) => s._id !== id));
    } catch {
      setError("Failed to delete");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-title">Skills Tracker</h1>
        <p className="page-sub">Track and manage your technical skills</p>

        {/* Stats */}
        <div className="stats-grid" style={{ marginTop:"1.5rem" }}>
          <StatCard icon={<MdSchool />} label="Total Skills"  value={skills.length}          color="primary" />
          <StatCard icon={<MdSchool />} label="Beginner"      value={counts.Beginner || 0}   color="success" />
          <StatCard icon={<MdSchool />} label="Intermediate"  value={counts.Intermediate || 0} color="warning" />
          <StatCard icon={<MdSchool />} label="Advanced"      value={counts.Advanced || 0}   color="danger"  />
        </div>

        {/* Add / Edit form */}
        <div className="card skills-form-card">
          <h3>{editing ? "Edit Skill" : "Add New Skill"}</h3>
          {error && <div className="alert alert-error" style={{ marginTop:".75rem" }}>{error}</div>}
          <form onSubmit={handleSubmit} className="skills-form">
            <input
              type="text"
              placeholder="Skill name (e.g. React)"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              className="skill-input"
            />
            <select
              value={form.level}
              onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
              className="skill-select"
            >
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <button type="submit" className="btn btn-primary">
              <MdAdd /> {editing ? "Update" : "Add Skill"}
            </button>
            {editing && (
              <button type="button" className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
            )}
          </form>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search skills…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Skills grid */}
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <MdSchool />
            <p>{search ? "No skills match your search" : "No skills added yet. Add your first skill above!"}</p>
          </div>
        ) : (
          <div className="skills-grid">
            {filtered.map((skill) => (
              <div key={skill._id} className="skill-card">
                <div className="skill-card__top">
                  <span className="skill-name">{skill.name}</span>
                  <span className={`badge badge-${skill.level.toLowerCase()}`}>{skill.level}</span>
                </div>
                <div className="skill-card__actions">
                  <button className="icon-btn edit" onClick={() => startEdit(skill)} aria-label="Edit">
                    <MdEdit />
                  </button>
                  <button className="icon-btn delete" onClick={() => deleteSkill(skill._id)} aria-label="Delete">
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
