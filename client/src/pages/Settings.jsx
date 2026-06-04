import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  MdPerson, MdLink, MdLock, MdVisibility, MdVisibilityOff,
  MdNotifications, MdPalette, MdSecurity, MdDeleteForever, MdSave,
} from "react-icons/md";
import "./Settings.css";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const fileRef = useRef();

  const [profile, setProfile] = useState({
    fullName: "", college: "", title: "", github: "", linkedin: "", profileImage: "",
  });
  const [passwords, setPasswords] = useState({ current: "", newPwd: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [prefs, setPrefs] = useState({
    resumeVisibility: "public",
    notifications: { internshipAlerts: true, jobAlerts: true, emailAlerts: false },
    darkMode: false,
    twoFactorEnabled: false,
  });

  const [saving, setSaving]   = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [msg, setMsg]         = useState({ type: "", text: "" });
  const [pwdMsg, setPwdMsg]   = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName:     user.fullName     || "",
        college:      user.college      || "",
        title:        user.title        || "",
        github:       user.github       || "",
        linkedin:     user.linkedin     || "",
        profileImage: user.profileImage || "",
      });
      setPrefs({
        resumeVisibility: user.resumeVisibility || "public",
        notifications:    user.notifications    || { internshipAlerts: true, jobAlerts: true, emailAlerts: false },
        darkMode:         user.darkMode         || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
      });
      if (user.darkMode) document.body.classList.add("dark");
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setProfile((p) => ({ ...p, profileImage: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      const payload = {
        fullName:     profile.fullName,
        college:      profile.college,
        title:        profile.title,
        github:       profile.github,
        linkedin:     profile.linkedin,
        profileImage: profile.profileImage,
        resumeVisibility:  prefs.resumeVisibility,
        notifications:     prefs.notifications,
        twoFactorEnabled:  prefs.twoFactorEnabled,
        darkMode:          prefs.darkMode,
      };
      const { data } = await api.put("/user/profile", payload);
      updateUser(data);
      if (prefs.darkMode) document.body.classList.add("dark");
      else document.body.classList.remove("dark");
      setMsg({ type: "success", text: "Settings saved successfully!" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Save failed" });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ type: "", text: "" }), 4000);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: "", text: "" });
    if (passwords.newPwd !== passwords.confirm)
      return setPwdMsg({ type: "error", text: "New passwords do not match" });
    if (passwords.newPwd.length < 6)
      return setPwdMsg({ type: "error", text: "Password must be at least 6 characters" });

    setPwdSaving(true);
    try {
      await api.put("/user/password", { currentPassword: passwords.current, newPassword: passwords.newPwd });
      setPasswords({ current: "", newPwd: "", confirm: "" });
      setPwdMsg({ type: "success", text: "Password updated!" });
    } catch (err) {
      setPwdMsg({ type: "error", text: err.response?.data?.message || "Failed to update password" });
    } finally {
      setPwdSaving(false);
      setTimeout(() => setPwdMsg({ type: "", text: "" }), 4000);
    }
  };

  const deleteAccount = async () => {
    if (!confirm("This will permanently delete your account and all data. Are you sure?")) return;
    try {
      await api.delete("/user/account");
      logout();
    } catch {
      alert("Failed to delete account. Try again.");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Manage your profile and preferences</p>

        <form onSubmit={saveProfile} className="settings-grid">
          {/* Profile Picture */}
          <div className="card settings-card">
            <div className="settings-card__head"><MdPerson /><h3>Profile Picture</h3></div>
            <div className="avatar-section">
              <div className="settings-avatar">
                {profile.profileImage
                  ? <img src={profile.profileImage} alt="profile" />
                  : <span>{user?.fullName?.[0]?.toUpperCase() || "U"}</span>
                }
              </div>
              <div>
                <p className="settings-name">{profile.fullName || user?.fullName}</p>
                <p className="settings-email">{user?.email}</p>
                <button type="button" className="btn btn-outline btn-sm" style={{ marginTop:".6rem" }}
                  onClick={() => fileRef.current?.click()}>
                  Change Photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="card settings-card">
            <div className="settings-card__head"><MdPerson /><h3>Profile Information</h3></div>
            <div className="settings-fields">
              {[
                { label: "Full Name", key: "fullName", placeholder: "John Doe" },
                { label: "College",   key: "college",  placeholder: "e.g. IIT Bombay" },
                { label: "Title",     key: "title",    placeholder: "BTech CSE Student" },
              ].map(({ label, key, placeholder }) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input
                    type="text" value={profile[key]} placeholder={placeholder}
                    onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                    className="settings-input"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Profiles */}
          <div className="card settings-card">
            <div className="settings-card__head"><MdLink /><h3>Social Profiles</h3></div>
            <div className="settings-fields">
              {[
                { label: "GitHub URL",   key: "github",   placeholder: "https://github.com/username" },
                { label: "LinkedIn URL", key: "linkedin", placeholder: "https://linkedin.com/in/username" },
              ].map(({ label, key, placeholder }) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input
                    type="url" value={profile[key]} placeholder={placeholder}
                    onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                    className="settings-input"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="card settings-card">
            <div className="settings-card__head"><MdNotifications /><h3>Preferences</h3></div>
            <div className="settings-fields">
              <div className="form-group">
                <label>Resume Visibility</label>
                <select value={prefs.resumeVisibility}
                  onChange={(e) => setPrefs((p) => ({ ...p, resumeVisibility: e.target.value }))}
                  className="settings-input">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              {[
                { key: "internshipAlerts", label: "Internship Alerts" },
                { key: "jobAlerts",        label: "Job Alerts"        },
                { key: "emailAlerts",      label: "Email Notifications" },
              ].map(({ key, label }) => (
                <div className="toggle-row" key={key}>
                  <span>{label}</span>
                  <label className="toggle-switch">
                    <input type="checkbox"
                      checked={prefs.notifications[key]}
                      onChange={(e) => setPrefs((p) => ({
                        ...p,
                        notifications: { ...p.notifications, [key]: e.target.checked },
                      }))}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Appearance + Security */}
          <div className="card settings-card">
            <div className="settings-card__head"><MdPalette /><h3>Appearance & Security</h3></div>
            <div className="settings-fields">
              <div className="toggle-row">
                <span>Dark Mode</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={prefs.darkMode}
                    onChange={(e) => setPrefs((p) => ({ ...p, darkMode: e.target.checked }))} />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="toggle-row">
                <span>Two-Factor Authentication</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={prefs.twoFactorEnabled}
                    onChange={(e) => setPrefs((p) => ({ ...p, twoFactorEnabled: e.target.checked }))} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Save button */}
          {msg.text && <div className={`alert alert-${msg.type === "success" ? "success" : "error"} settings-msg`}>{msg.text}</div>}
          <button type="submit" className="btn btn-primary settings-save" disabled={saving}>
            <MdSave /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>

        {/* Change Password — separate form */}
        <form onSubmit={changePassword} className="card settings-card" style={{ marginTop:"1.5rem" }}>
          <div className="settings-card__head"><MdLock /><h3>Change Password</h3></div>
          {pwdMsg.text && <div className={`alert alert-${pwdMsg.type === "success" ? "success" : "error"}`} style={{ marginTop:".75rem" }}>{pwdMsg.text}</div>}
          <div className="settings-fields">
            {[
              { label: "Current Password", key: "current" },
              { label: "New Password",     key: "newPwd"  },
              { label: "Confirm New",      key: "confirm" },
            ].map(({ label, key }) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <div className="input-wrap">
                  <MdLock className="input-icon" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={passwords[key]}
                    onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                    className="settings-input"
                    style={{ paddingLeft:"2.4rem" }}
                    placeholder="••••••••"
                  />
                  {key === "current" && (
                    <button type="button" className="pwd-toggle" onClick={() => setShowPwd((p) => !p)} aria-label="Toggle password visibility">
                      {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop:".75rem" }} disabled={pwdSaving}>
            {pwdSaving ? "Updating…" : "Update Password"}
          </button>
        </form>

        {/* Danger zone */}
        <div className="card danger-zone" style={{ marginTop:"1.5rem" }}>
          <div className="settings-card__head" style={{ color:"var(--danger)" }}>
            <MdDeleteForever /><h3>Danger Zone</h3>
          </div>
          <p style={{ fontSize:".9rem", color:"var(--text-muted)", marginBottom:"1rem" }}>
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <button type="button" className="btn btn-danger btn-sm" onClick={deleteAccount}>
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
}
