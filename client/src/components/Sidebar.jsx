import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MdDashboard, MdSchool, MdWork, MdDescription,
  MdPerson, MdSettings, MdLogout, MdQuiz,
} from "react-icons/md";
import "./Sidebar.css";

const links = [
  { to: "/dashboard",      label: "Dashboard",       icon: <MdDashboard /> },
  { to: "/skills",         label: "Skills Tracker",  icon: <MdSchool /> },
  { to: "/internships",    label: "Internships",      icon: <MdWork /> },
  { to: "/resume",         label: "Resume",           icon: <MdDescription /> },
  { to: "/mock-interview", label: "Mock Interview",   icon: <MdQuiz /> },
  { to: "/settings",       label: "Settings",         icon: <MdSettings /> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🎯</span>
        <span className="logo-text">CareerHub</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.profileImage
            ? <img src={user.profileImage} alt="profile" />
            : <span>{user?.fullName?.[0]?.toUpperCase() || "U"}</span>
          }
        </div>
        <div className="user-info">
          <p className="user-name">{user?.fullName || "User"}</p>
          <p className="user-title">BTech CSE Student</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <MdLogout />
        <span>Logout</span>
      </button>
    </aside>
  );
}
