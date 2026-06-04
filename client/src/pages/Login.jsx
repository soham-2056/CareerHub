import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password)
      return setError("Both fields are required");

    try {
      setLoading(true);
      await login(form.email.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎯 CareerHub</div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to continue your journey</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrap">
              <MdEmail className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <MdLock className="input-icon" />
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd((p) => !p)} aria-label="Toggle password visibility">
                {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <div className="form-meta">
            <Link to="/forgot-password" className="form-link">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register" className="form-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
