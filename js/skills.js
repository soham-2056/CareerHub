// Ensure user is logged in
if (typeof checkAuth === "function") {
    checkAuth();
}

window.addEventListener("load", () => {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "true") {
        document.body.classList.add("dark-mode");
    }
    loadSkills();
});

let skills = [];

// Load skills from backend
async function loadSkills() {
    try {
        const response = await apiFetch("/skills");
        if (response.ok) {
            skills = await response.json();
            displaySkills();
        } else {
            console.error("Failed to load skills");
        }
    } catch (err) {
        console.error("Error fetching skills:", err);
    }
}

// Add Skill
async function addSkill() {
    const skillName = document.getElementById("skillName").value.trim();
    const skillLevel = document.getElementById("skillLevel").value;

    if (skillName === "") {
        alert("Please enter a skill.");
        return;
    }

    try {
        const response = await apiFetch("/skills", {
            method: "POST",
            body: JSON.stringify({ name: skillName, level: skillLevel })
        });

        const data = await response.json();
        if (response.ok) {
            skills.unshift(data); // Add to beginning of local array
            document.getElementById("skillName").value = "";
            displaySkills();
        } else {
            alert(data.message || "Failed to add skill.");
        }
    } catch (err) {
        console.error("Error adding skill:", err);
        alert("Failed to add skill.");
    }
}

// Display Skills
function displaySkills(filteredSkills = skills) {
    const container = document.getElementById("skillContainer");
    if (!container) return;

    container.innerHTML = "";

    if (filteredSkills.length === 0) {
        container.innerHTML = `
            <div class="skill-card">
                <h3>No Skills Found</h3>
            </div>
        `;
        updateStats();
        return;
    }

    filteredSkills.forEach((skill) => {
        let levelClass = (skill.level || "beginner").toLowerCase();

        container.innerHTML += `
            <div class="skill-card">
                <h3>${skill.name}</h3>
                <p class="${levelClass}">
                    ${skill.level || "Beginner"}
                </p>
                <div class="skill-actions">
                    <button
                        class="edit-btn"
                        onclick="editSkill('${skill._id}', '${skill.name.replace(/'/g, "\\'")}', '${skill.level}')">
                        Edit
                    </button>
                    <button
                        class="delete-btn"
                        onclick="deleteSkill('${skill._id}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
    });

    updateStats();
}

// Delete Skill
async function deleteSkill(id) {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
        const response = await apiFetch(`/skills/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            skills = skills.filter(skill => skill._id !== id);
            displaySkills();
        } else {
            const data = await response.json();
            alert(data.message || "Failed to delete skill.");
        }
    } catch (err) {
        console.error("Error deleting skill:", err);
    }
}

// Edit Skill
async function editSkill(id, currentName, currentLevel) {
    const newName = prompt("Edit Skill Name", currentName);
    if (newName === null || newName.trim() === "") return;

    const newLevel = prompt("Edit Skill Level (Beginner, Intermediate, Advanced)", currentLevel);
    if (newLevel === null || !["Beginner", "Intermediate", "Advanced"].includes(newLevel.trim())) {
        alert("Invalid skill level. Must be Beginner, Intermediate, or Advanced.");
        return;
    }

    try {
        const response = await apiFetch(`/skills/${id}`, {
            method: "PUT",
            body: JSON.stringify({ name: newName.trim(), level: newLevel.trim() })
        });

        const data = await response.json();
        if (response.ok) {
            skills = skills.map(skill => skill._id === id ? data : skill);
            displaySkills();
        } else {
            alert(data.message || "Failed to update skill.");
        }
    } catch (err) {
        console.error("Error updating skill:", err);
    }
}

// Update Dashboard Cards
function updateStats() {
    const totalEl = document.getElementById("totalSkills");
    const begEl = document.getElementById("beginnerCount");
    const intEl = document.getElementById("intermediateCount");
    const advEl = document.getElementById("advancedCount");

    if (totalEl) totalEl.textContent = skills.length;
    if (begEl) begEl.textContent = skills.filter(s => s.level === "Beginner").length;
    if (intEl) intEl.textContent = skills.filter(s => s.level === "Intermediate").length;
    if (advEl) advEl.textContent = skills.filter(s => s.level === "Advanced").length;
}

// Search Skills
const searchInput = document.getElementById("searchSkill");
if (searchInput) {
    searchInput.addEventListener("keyup", function () {
        const keyword = this.value.toLowerCase();
        const filtered = skills.filter(skill =>
            skill.name.toLowerCase().includes(keyword)
        );
        displaySkills(filtered);
    });
}