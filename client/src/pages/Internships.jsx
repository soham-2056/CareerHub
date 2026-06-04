import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import api from "../api/axios";
import { MdWork, MdSearch, MdLocationOn, MdAccessTime, MdCurrencyRupee, MdBusiness } from "react-icons/md";
import "./Internships.css";

const CATEGORIES = ["all","frontend","backend","fullstack","java","python","uiux","data"];

export default function Internships() {
  const [internships, setInternships]   = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch]             = useState("");
  const [category, setCategory]         = useState("all");
  const [loading, setLoading]           = useState(true);
  const [applying, setApplying]         = useState(null);
  const [msg, setMsg]                   = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== "all") params.category = category;
      if (search) params.search = search;
      const [intRes, appRes] = await Promise.all([
        api.get("/internships", { params }),
        api.get("/internships/my-applications"),
      ]);
      setInternships(intRes.data);
      setApplications(appRes.data.map((a) => a.internship?._id));
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const apply = async (id) => {
    setApplying(id); setMsg("");
    try {
      await api.post(`/internships/apply/${id}`);
      setApplications((p) => [...p, id]);
      setMsg("Application submitted successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to apply");
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setApplying(null);
    }
  };

  const typeClass = (type) =>
    type === "Remote" ? "remote" : type === "Hybrid" ? "hybrid" : "on-site";

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-title">Internship Portal</h1>
        <p className="page-sub">Discover and apply to the best internships</p>

        <div className="stats-grid" style={{ marginTop:"1.5rem" }}>
          <StatCard icon={<MdWork />}     label="Available"   value="500+" color="primary" />
          <StatCard icon={<MdBusiness />} label="Companies"   value="150+" color="success" />
          <StatCard icon={<MdWork />}     label="Remote"      value="220+" color="warning" />
          <StatCard icon={<MdWork />}     label="Applied"     value={applications.length} color="danger" />
        </div>

        {/* Filters */}
        <div className="int-filters card">
          <div className="search-wrap" style={{ flex:1 }}>
            <MdSearch className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by role, company, location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="skill-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {msg && <div className={`alert ${msg.includes("success") || msg.includes("submitted") ? "alert-success" : "alert-error"}`}>{msg}</div>}

        {loading ? (
          <div className="spinner" />
        ) : internships.length === 0 ? (
          <div className="empty-state"><MdWork /><p>No internships found</p></div>
        ) : (
          <div className="int-grid">
            {internships.map((i) => (
              <div key={i._id} className="int-card">
                <div className="int-card__head">
                  <div className="int-company-icon"><MdBusiness /></div>
                  <div>
                    <h3 className="int-title">{i.title}</h3>
                    <p className="int-company">{i.company}</p>
                  </div>
                  <span className={`badge badge-${typeClass(i.type)}`}>{i.type}</span>
                </div>

                <div className="int-meta">
                  <span><MdLocationOn />{i.location}</span>
                  <span><MdAccessTime />{i.duration}</span>
                  <span><MdCurrencyRupee />{i.stipend}</span>
                </div>

                <div className="int-skills">
                  {i.skills?.map((s) => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>

                <button
                  className={`btn ${applications.includes(i._id) ? "btn-outline" : "btn-primary"} btn-sm int-apply`}
                  onClick={() => !applications.includes(i._id) && apply(i._id)}
                  disabled={applications.includes(i._id) || applying === i._id}
                >
                  {applying === i._id ? "Applying…" : applications.includes(i._id) ? "✓ Applied" : "Apply Now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
