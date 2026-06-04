import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setAccessToken, clearAccessToken } from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true); // true until initial auth check done

  // ─── Logout helper (used locally + by axios event) ──────────────────────────
  const logout = useCallback(async (callServer = true) => {
    try {
      if (callServer) {
        const rt = localStorage.getItem("refreshToken");
        if (rt) await api.post("/auth/logout", { refreshToken: rt });
      }
    } catch {
      // Ignore errors — always clear local state
    } finally {
      clearAccessToken();
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  // ─── Listen for forced logout from axios interceptor ────────────────────────
  useEffect(() => {
    const handler = () => logout(false);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  // ─── On mount: try to restore session via refresh token ─────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (!storedRefreshToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.post("/auth/refresh", {
          refreshToken: storedRefreshToken,
        });
        setAccessToken(data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } catch {
        // Refresh failed — clear stale session silently
        clearAccessToken();
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // ─── Register ────────────────────────────────────────────────────────────────
  const register = async (fullName, email, password) => {
    const { data } = await api.post("/auth/register", { fullName, email, password });
    setAccessToken(data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // ─── Update local user state after profile save ───────────────────────────
  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
