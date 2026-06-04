// Ensure user is logged in
if (typeof checkAuth === "function") {
    checkAuth();
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("CareerHub Dashboard Loaded");
    animateCards();
    loadDashboardData();
});

window.addEventListener("load", () => {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "true") {
        document.body.classList.add("dark-mode");
    }
});

// Load real data from API endpoints
async function loadDashboardData() {
    try {
        // 1. Get user profile details
        const profileResponse = await apiFetch("/user/profile");
        if (profileResponse.ok) {
            const profile = await profileResponse.json();
            const headerEl = document.querySelector(".header h1");
            if (headerEl) {
                headerEl.textContent = `Welcome Back, ${profile.fullName || "User"} 👋`;
            }
        }

        // 2. Get skills count
        const skillsResponse = await apiFetch("/skills");
        if (skillsResponse.ok) {
            const skills = await skillsResponse.json();
            const skillsCardEl = document.querySelector(".cards .card:nth-child(2) h2");
            if (skillsCardEl) {
                skillsCardEl.textContent = skills.length;
            }
        }

        // 3. Get resume score
        const resumeResponse = await apiFetch("/resume");
        const resumeCardEl = document.querySelector(".cards .card:nth-child(1) h2");
        if (resumeCardEl) {
            if (resumeResponse.ok) {
                const resume = await resumeResponse.json();
                resumeCardEl.textContent = `${resume.score}%`;
            } else {
                resumeCardEl.textContent = "N/A";
            }
        }

        // 4. Get internship application count
        const appsResponse = await apiFetch("/internships/my-applications");
        const appsCardEl = document.querySelector(".cards .card:nth-child(3) h2");
        if (appsCardEl) {
            if (appsResponse.ok) {
                const apps = await appsResponse.json();
                appsCardEl.textContent = apps.length;
            } else {
                appsCardEl.textContent = "0";
            }
        }

        // 5. Get total internships available
        const internshipsResponse = await fetch("https://careerhub-api-mvti.onrender.com/api/internships");
        const totalCardEl = document.querySelector(".cards .card:nth-child(4) h2");
        if (totalCardEl) {
            if (internshipsResponse.ok) {
                const internships = await internshipsResponse.json();
                totalCardEl.textContent = internships.length;
            } else {
                totalCardEl.textContent = "0";
            }
        }
    } catch (err) {
        console.error("Error loading dashboard data:", err);
    }
}

/* Card Animation */
function animateCards() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
        card.style.opacity = "0";
        setTimeout(() => {
            card.style.transition = "0.5s ease";
            card.style.opacity = "1";
        }, index * 150);
    });
}