// Ensure user is logged in
if (typeof checkAuth === "function") {
    checkAuth();
}

window.addEventListener("load", function () {
    // Apply dark mode immediately from localStorage for speed
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "true") {
        document.body.classList.add("dark-mode");
    }
    loadProfileData();
});

// Load profile data from backend
async function loadProfileData() {
    try {
        const response = await apiFetch("/user/profile");
        if (response.ok) {
            const profile = await response.json();

            // Populate form fields
            document.getElementById("name").value = profile.fullName || "";
            document.getElementById("email").value = profile.email || "";
            document.getElementById("college").value = profile.college || "";
            document.getElementById("github").value = profile.github || "";
            document.getElementById("linkedin").value = profile.linkedin || "";

            // Profile info header cards
            const headerNameEl = document.querySelector(".profile-card h3");
            const headerTitleEl = document.querySelector(".profile-card p");
            if (headerNameEl) headerNameEl.textContent = profile.fullName || "User";
            if (headerTitleEl) headerTitleEl.textContent = profile.title || "Student";

            // Radio button for visibility
            const visibilityRadios = document.getElementsByName("resumeVisibility");
            visibilityRadios.forEach(radio => {
                if (radio.value === (profile.resumeVisibility || "public")) {
                    radio.checked = true;
                }
            });

            // Notification flags
            const notifs = profile.notifications || {};
            document.getElementById("internshipAlert").checked = notifs.internshipAlerts !== false;
            document.getElementById("jobAlert").checked = notifs.jobAlerts !== false;
            document.getElementById("emailAlert").checked = !!notifs.emailAlerts;

            // Appearance & Security checkboxes
            document.getElementById("darkMode").checked = !!profile.darkMode;
            document.getElementById("twoFactor").checked = !!profile.twoFactorEnabled;

            // Profile image preview
            if (profile.profileImage) {
                document.getElementById("profilePreview").src = profile.profileImage;
            }
        }
    } catch (err) {
        console.error("Error loading profile:", err);
    }
}

// Save Settings
async function saveSettings() {
    const visibilityRadios = document.getElementsByName("resumeVisibility");
    let resumeVisibility = "public";
    visibilityRadios.forEach(radio => {
        if (radio.checked) resumeVisibility = radio.value;
    });

    const settingsBody = {
        fullName: document.getElementById("name").value.trim(),
        college: document.getElementById("college").value.trim(),
        github: document.getElementById("github").value.trim(),
        linkedin: document.getElementById("linkedin").value.trim(),
        resumeVisibility,
        notifications: {
            internshipAlerts: document.getElementById("internshipAlert").checked,
            jobAlerts: document.getElementById("jobAlert").checked,
            emailAlerts: document.getElementById("emailAlert").checked
        },
        darkMode: document.getElementById("darkMode").checked,
        twoFactorEnabled: document.getElementById("twoFactor").checked
    };

    try {
        // 1. Update basic profile info
        const profileResponse = await apiFetch("/user/profile", {
            method: "PUT",
            body: JSON.stringify(settingsBody)
        });

        if (!profileResponse.ok) {
            const data = await profileResponse.json();
            alert(data.message || "Failed to update profile settings.");
            return;
        }

        // Apply dark mode locally
        localStorage.setItem("darkMode", settingsBody.darkMode ? "true" : "false");
        if (settingsBody.darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }

        // 2. Handle password change if requested
        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;

        if (currentPassword || newPassword) {
            if (!currentPassword || !newPassword) {
                alert("To change your password, you must fill out both Current Password and New Password.");
                return;
            }

            const pwdResponse = await apiFetch("/user/password", {
                method: "PUT",
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const pwdData = await pwdResponse.json();

            if (!pwdResponse.ok) {
                alert(`Profile saved, but password change failed: ${pwdData.message}`);
                return;
            } else {
                alert("✅ Profile and Password updated successfully! Please log in again.");
                logoutUserLocal();
                return;
            }
        }

        alert("✅ Profile settings saved successfully!");
        loadProfileData();
    } catch (err) {
        console.error("Error saving settings:", err);
        alert("Failed to connect to the backend server.");
    }
}

// Profile Image Upload
function uploadProfileImage() {
    const fileInput = document.getElementById("profileImage");
    const preview = document.getElementById("profilePreview");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image first.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const base64Image = e.target.result;
        
        try {
            // Upload to user profile image field
            const response = await apiFetch("/user/profile", {
                method: "PUT",
                body: JSON.stringify({ profileImage: base64Image })
            });

            if (response.ok) {
                preview.src = base64Image;
                alert("Profile picture updated!");
            } else {
                const data = await response.json();
                alert(data.message || "Failed to save profile picture.");
            }
        } catch (err) {
            console.error("Error uploading profile image:", err);
            alert("Error saving profile picture.");
        }
    };
    reader.readAsDataURL(file);
}

// Delete Account
async function deleteAccount() {
    const confirmDelete = confirm("⚠️ WARNING: Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
        const response = await apiFetch("/user/account", {
            method: "DELETE"
        });

        if (response.ok) {
            localStorage.clear();
            alert("Your account has been deleted successfully.");
            window.location.href = "../index.html";
        } else {
            const data = await response.json();
            alert(data.message || "Failed to delete account.");
        }
    } catch (err) {
        console.error("Error deleting account:", err);
        alert("Failed to delete account due to network/server issues.");
    }
}
