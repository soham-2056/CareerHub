window.addEventListener("load", () => {
    // Auto-redirect to dashboard if user is already logged in
    const token = localStorage.getItem("accessToken");
    if (token) {
        window.location.href = "dashboard.html";
    }
});

async function registerUser(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (
        fullName === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch("https://careerhub-api-mvti.onrender.com/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fullName, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed.");
            return;
        }

        alert("Registration Successful! Please log in.");
        window.location.href = "login.html";
    } catch (err) {
        console.error("Registration error:", err);
        alert("Unable to connect to the backend server. Please make sure the server is running on port 5000.");
    }
}