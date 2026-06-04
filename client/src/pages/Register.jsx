import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import "./Auth.css";

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.password || !form.confirm)
      return setError("All fields are required");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    if (form.password !== form.confirm)
      return setError("Passwords do not match");

    try {
      setLoading(true);
      await register(form.fullName, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎯 CareerHub</div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Start building your career today</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrap">
              <MdPerson className="input-icon" />
              <input id="fullName" type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrap">
              <MdEmail className="input-icon" />
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <MdLock className="input-icon" />
              <input
                id="password" type={showPwd ? "text" : "password"}
                name="password" value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters" required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd((p) => !p)} aria-label="Toggle password visibility">
                {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <div className="input-wrap">
              <MdLock className="input-icon" />
              <input id="confirm" type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="Repeat password" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="form-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
