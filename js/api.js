// CareerHub Vanilla JS API Client and Auth Helper
const API_URL = "https://careerhub-api-mvti.onrender.com/api";

// Helper to perform authenticated fetch requests
async function apiFetch(endpoint, options = {}) {
  let accessToken = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    let response = await fetch(`${API_URL}${endpoint}`, config);

    // If 401 Unauthorized (likely token expired), try refreshing token
    if (response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        console.log("🔄 Access token expired. Attempting refresh...");
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem("accessToken", refreshData.accessToken);
          localStorage.setItem("refreshToken", refreshData.refreshToken);
          localStorage.setItem("user", JSON.stringify(refreshData.user));
          
          // Retry original request with new token
          config.headers["Authorization"] = `Bearer ${refreshData.accessToken}`;
          response = await fetch(`${API_URL}${endpoint}`, config);
        } else {
          // Refresh failed - clean storage and redirect
          logoutUserLocal();
        }
      } else {
        logoutUserLocal();
      }
    }

    return response;
  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
}

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    // Determine path back to login.html depending on if we are in pages/ folder or root
    const inPagesDir = window.location.pathname.includes("/pages/");
    window.location.href = inPagesDir ? "login.html" : "pages/login.html";
    return false;
  }
  return true;
}

// Local logout (clears storage and redirects)
function logoutUserLocal() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  const inPagesDir = window.location.pathname.includes("/pages/");
  window.location.href = inPagesDir ? "login.html" : "pages/login.html";
}

// Server logout
async function logoutUser() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });
    } catch (err) {
      console.error("Logout request error:", err);
    }
  }
  logoutUserLocal();
}
