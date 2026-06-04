import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home           from "./pages/Home";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard      from "./pages/Dashboard";
import Skills         from "./pages/Skills";
import Internships    from "./pages/Internships";
import Resume         from "./pages/Resume";
import MockInterview  from "./pages/MockInterview";
import Settings       from "./pages/Settings";
import Logout         from "./pages/Logout";

// ─── Route guards ─────────────────────────────────────────────────────────────

/** Block unauthenticated users from private pages */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  return user ? children : <Navigate to="/login" replace />;
};

/** Redirect already-logged-in users away from auth pages */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const FullScreenSpinner = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100vh", background: "var(--bg)",
  }}>
    <div className="spinner" />
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/"                element={<Home />} />
        <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Private pages */}
        <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/skills"         element={<PrivateRoute><Skills /></PrivateRoute>} />
        <Route path="/internships"    element={<PrivateRoute><Internships /></PrivateRoute>} />
        <Route path="/resume"         element={<PrivateRoute><Resume /></PrivateRoute>} />
        <Route path="/mock-interview" element={<PrivateRoute><MockInterview /></PrivateRoute>} />
        <Route path="/settings"       element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/logout"         element={<PrivateRoute><Logout /></PrivateRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
