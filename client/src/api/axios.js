import axios from "axios";

const API_URL = "https://careerhub-api-mvti.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

// ─── In-memory access token ───────────────────────────────────────────────────
// Kept in memory (not localStorage) so it can't be stolen via XSS.
// The refresh token stays in localStorage as the only persisted secret.
let accessToken = null;

export const setAccessToken  = (t) => { accessToken = t; };
export const getAccessToken  = ()  => accessToken;
export const clearAccessToken = () => { accessToken = null; };

// ─── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response interceptor — silent refresh on 401 TOKEN_EXPIRED ───────────────
let isRefreshing     = false;
let failedQueue      = []; // requests waiting for a fresh token

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status  = error.response?.status;
    const code    = error.response?.data?.code;
    const message = error.response?.data?.message || "";

    // Only attempt refresh on 401 with TOKEN_EXPIRED code, and only once
    if (
      status === 401 &&
      (code === "TOKEN_EXPIRED" || message.toLowerCase().includes("expired")) &&
      !originalRequest._retried
    ) {
      originalRequest._retried = true;

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
  "https://careerhub-api-mvti.onrender.com/api/auth/refresh",
  {
    refreshToken: storedRefreshToken,
  }
);
          refreshToken: storedRefreshToken,
        });

        // Rotate tokens
        setAccessToken(data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — force logout
        clearAccessToken();
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Any other 401 (invalid token, deleted user, etc.) — force logout
    if (status === 401 && !originalRequest._retried) {
      clearAccessToken();
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  }
);

export default api;
