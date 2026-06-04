import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  MdSchool, MdWork, MdDescription, MdTrendingUp,
  MdArrowForward, MdQuiz,
} from "react-icons/md";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ skills: 0, applications: 0, resumeScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [skillsRes, appsRes, resumeRes] = await Promise.allSettled([
          api.get("/skills"),
          api.get("/internships/my-applications"),
          api.get("/resume"),
        ]);
        setStats({
          skills:       skillsRes.status === "fulfilled" ? skillsRes.value.data.length : 0,
          applications: appsRes.status   === "fulfilled" ? appsRes.value.data.length   : 0,
          resumeScore:  resumeRes.status === "fulfilled" ? resumeRes.value.data.score  : 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const radialData = [{ name: "Score", value: stats.resumeScore, fill: "#4f46e5" }];

  const barData = [
    { subject: "HTML",   score: 90 },
    { subject: "CSS",    score: 80 },
    { subject: "JS",     score: 65 },
    { subject: "React",  score: 55 },
    { subject: "Node",   score: 45 },
  ];

  const quickActions = [
    { to: "/resume",        label: "Analyse Resume",   icon: <MdDescription />, color: "purple" },
    { to: "/internships",   label: "Browse Internships", icon: <MdWork />,       color: "blue"   },
    { to: "/mock-interview", label: "Start Interview",   icon: <MdQuiz />,       color: "green"  },
    { to: "/skills",        label: "Add Skills",         icon: <MdSchool />,     color: "orange" },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Welcome back, {user?.fullName?.split(" ")[0]} 👋</h1>
            <p className="page-sub">Here's your career progress overview</p>
          </div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              <StatCard icon={<MdDescription />} label="Resume Score"    value={`${stats.resumeScore}%`} color="primary" sub="Upload to get score" />
              <StatCard icon={<MdSchool />}      label="Skills Learned"  value={stats.skills}           color="success" />
              <StatCard icon={<MdWork />}        label="Applications"    value={stats.applications}     color="warning" sub="Internships applied" />
              <StatCard icon={<MdTrendingUp />}  label="Jobs Available"  value="500+"                   color="danger"  sub="Across all categories" />
            </div>

            {/* Charts row */}
            <div className="charts-row">
              {/* Resume score radial */}
              <div className="card chart-card">
                <h3 className="chart-title">Resume Score</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart
                    cx="50%" cy="50%"
                    innerRadius="60%" outerRadius="90%"
                    data={radialData}
                    startAngle={90} endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} background />
                    <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <p className="chart-center-label">{stats.resumeScore}%</p>
              </div>

              {/* Skill levels bar */}
              <div className="card chart-card chart-card--wide">
                <h3 className="chart-title">Learning Progress</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${v}%`]} />
                    <Bar dataKey="score" fill="#4f46e5" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              {quickActions.map(({ to, label, icon, color }) => (
                <Link key={to} to={to} className={`quick-action quick-action--${color}`}>
                  <span className="qa-icon">{icon}</span>
                  <span className="qa-label">{label}</span>
                  <MdArrowForward className="qa-arrow" />
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
