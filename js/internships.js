// Ensure user is logged in
if (typeof checkAuth === "function") {
    checkAuth();
}

let allInternships = [];
let myApplications = [];

window.addEventListener("load", () => {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "true") {
        document.body.classList.add("dark-mode");
    }
    init();
});

async function init() {
    await fetchMyApplications();
    await fetchInternships();
}

async function fetchMyApplications() {
    try {
        const response = await apiFetch("/internships/my-applications");
        if (response.ok) {
            myApplications = await response.json();
            // Update stats cards
            const sentEl = document.querySelector(".cards .card:nth-child(4) h2");
            if (sentEl) sentEl.textContent = myApplications.length;
        }
    } catch (err) {
        console.error("Error fetching my applications:", err);
    }
}

async function fetchInternships(category = "", search = "") {
    try {
        let url = "https://careerhub-api-mvti.onrender.com/api/internships";
        const params = [];
        if (category) params.push(`category=${category}`);
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (params.length > 0) url += `?${params.join("&")}`;

        // Internships API doesn't strictly need auth for GET, but we can use standard fetch or apiFetch
        const response = await fetch(url);
        if (response.ok) {
            allInternships = await response.json();
            displayInternships(allInternships);
            updateStats();
        }
    } catch (err) {
        console.error("Error fetching internships:", err);
    }
}

const skillDropdown = document.getElementById("skillDropdown");
const searchInput = document.getElementById("searchInput");
const internshipContainer = document.getElementById("internshipContainer");

function displayInternships(jobs) {
    internshipContainer.innerHTML = "";

    if (jobs.length === 0) {
        internshipContainer.innerHTML = `
            <div class="card">
                <h3>No Internships Found</h3>
                <p>Try resetting filters or searching for something else.</p>
            </div>
        `;
        return;
    }

    jobs.forEach((job) => {
        // Check if user has already applied to this internship
        const hasApplied = myApplications.some(app => 
            app.internship && (app.internship._id === job._id || app.internship === job._id)
        );

        const btnText = hasApplied ? "Applied ✓" : "Apply Now";
        const btnDisabled = hasApplied ? "disabled class='applied-btn'" : "";

        const card = `
            <div class="card">
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Location:</strong> ${job.location} (${job.type || "Remote"})</p>
                <p><strong>Stipend:</strong> ${job.stipend}</p>
                <p><strong>Duration:</strong> ${job.duration || "N/A"}</p>
                <button ${btnDisabled} onclick="applyInternship('${job._id}')">${btnText}</button>
            </div>
        `;
        internshipContainer.innerHTML += card;
    });
}

if (skillDropdown) {
    skillDropdown.addEventListener("change", function() {
        const selectedCategory = skillDropdown.value;
        const keyword = searchInput ? searchInput.value : "";
        fetchInternships(selectedCategory, keyword);
    });
}

if (searchInput) {
    searchInput.addEventListener("keyup", function() {
        const selectedCategory = skillDropdown ? skillDropdown.value : "";
        const keyword = searchInput.value;
        fetchInternships(selectedCategory, keyword);
    });
}

async function applyInternship(id) {
    try {
        const response = await apiFetch(`/internships/apply/${id}`, {
            method: "POST"
        });
        
        const data = await response.json();
        if (response.ok) {
            alert("Application Submitted Successfully!");
            init(); // reload data and update UI
        } else {
            alert(data.message || "Failed to submit application.");
        }
    } catch (err) {
        console.error("Error applying to internship:", err);
        alert("Failed to submit application.");
    }
}

function updateStats() {
    const totalEl = document.querySelector(".cards .card:nth-child(1) h2");
    const remoteEl = document.querySelector(".cards .card:nth-child(3) h2");
    
    if (totalEl) totalEl.textContent = allInternships.length;
    if (remoteEl) {
        const remoteCount = allInternships.filter(job => 
            job.type === "Remote" || job.location.toLowerCase().includes("remote")
        ).length;
        remoteEl.textContent = remoteCount;
    }
}
