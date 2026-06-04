window.addEventListener("load", () => {
    // Auto-redirect to dashboard if user is already logged in
    const token = localStorage.getItem("accessToken");
    if (token) {
        window.location.href = "dashboard.html";
    }
});

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("Please fill all fields.");
        return;
    }

    try {
        const response = await fetch("https://careerhub-api-mvti.onrender.com/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Invalid credentials.");
            return;
        }

        // Store tokens and user in localStorage
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login Successful!");
        window.location.href = "dashboard.html";
    } catch (err) {
        console.error("Login error:", err);
        alert("Unable to connect to the backend server. Please make sure the server is running on port 5000.");
    }
}