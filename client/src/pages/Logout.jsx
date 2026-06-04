import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Logout() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  useEffect(() => {
    // callServer=true so refresh token is revoked in DB
    logout(true).finally(() => navigate("/login", { replace: true }));
  }, [logout, navigate]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", flexDirection: "column", gap: "1rem",
    }}>
      <div className="spinner" />
      <p style={{ color: "var(--text-muted)", fontSize: ".9rem" }}>Logging out…</p>
    </div>
  );
}
