import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { MdEmail, MdArrowBack } from "react-icons/md";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [msg, setMsg]         = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    if (!email) return setError("Email is required");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/forgot-password", { email });
      setMsg(data.message || "Reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎯 CareerHub</div>
        <h2 className="auth-title">Reset password</h2>
        <p className="auth-sub">Enter your email and we&apos;ll send a reset link</p>

        {error && <div className="alert alert-error">{error}</div>}
        {msg   && <div className="alert alert-success">{msg}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrap">
              <MdEmail className="input-icon" />
              <input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login" className="form-link" style={{ display:"flex", alignItems:"center", gap:".3rem", justifyContent:"center" }}>
            <MdArrowBack /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
