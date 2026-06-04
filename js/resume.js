// Ensure user is logged in
if (typeof checkAuth === "function") {
    checkAuth();
}

window.addEventListener("load", () => {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "true") {
        document.body.classList.add("dark-mode");
    }
    loadExistingResume();
});

// Load existing resume from backend
async function loadExistingResume() {
    try {
        const response = await apiFetch("/resume");
        if (response.ok) {
            const resume = await response.json();
            displayResumeData(resume);
        }
    } catch (err) {
        console.error("Error loading existing resume:", err);
    }
}

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("resumeFile");

if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        // Validate file extension
        const allowedExtensions = /(\.pdf|\.doc|\.docx)$/i;
        if (!allowedExtensions.exec(file.name)) {
            alert("Only PDF, DOC, or DOCX files are allowed.");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);

        uploadBtn.disabled = true;
        uploadBtn.textContent = "Analyzing... Please wait";

        try {
            // Since we're sending FormData, we let the browser set the boundary header
            const accessToken = localStorage.getItem("accessToken");
            const response = await fetch("https://careerhub-api-mvti.onrender.com/api/resume/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert("Resume uploaded and analyzed successfully!");
                displayResumeData(data);
            } else {
                alert(data.message || "Failed to analyze resume.");
            }
        } catch (err) {
            console.error("Error uploading resume:", err);
            alert("Failed to connect to the backend server. Make sure the server is running on port 5000.");
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Upload Resume";
        }
    });
}

function displayResumeData(resume) {
    const scoreEl = document.getElementById("resumeScore");
    const aiAnalysisEl = document.getElementById("aiAnalysis");
    const skillTagsEl = document.getElementById("skillTags");
    const suggestionListEl = document.getElementById("suggestionList");

    if (scoreEl) scoreEl.textContent = `${resume.score}%`;
    if (aiAnalysisEl) aiAnalysisEl.textContent = resume.aiAnalysis || "No analysis details available.";

    if (skillTagsEl) {
        skillTagsEl.innerHTML = "";
        const skillsArray = Array.isArray(resume.skills) 
            ? resume.skills 
            : (typeof resume.skills === "string" ? resume.skills.split(",") : []);
        
        skillsArray.forEach(skill => {
            if (skill.trim()) {
                const span = document.createElement("span");
                span.textContent = skill.trim();
                skillTagsEl.appendChild(span);
            }
        });
    }

    if (suggestionListEl) {
        suggestionListEl.innerHTML = "";
        const suggestionsArray = Array.isArray(resume.suggestions) 
            ? resume.suggestions 
            : (typeof resume.suggestions === "string" ? JSON.parse(resume.suggestions) : []);
        
        suggestionsArray.forEach(item => {
            if (item.trim()) {
                const li = document.createElement("li");
                li.textContent = `💡 ${item.trim()}`;
                suggestionListEl.appendChild(li);
            }
        });
    }
}
