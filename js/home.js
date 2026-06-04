// CareerHub Home Page

document.addEventListener("DOMContentLoaded", () => {

    initializeGetStartedButton();
    initializeSmoothScroll();
    initializeFeatureCards();
    updateNavForLoggedInUser();

});

// Dynamic navigation update for logged-in users
function updateNavForLoggedInUser() {
    const token = localStorage.getItem("accessToken");
    if (token) {
        const navUl = document.querySelector("nav ul");
        if (navUl) {
            navUl.innerHTML = `
                <li><a href="index.html">Home</a></li>
                <li><a href="pages/dashboard.html">Dashboard</a></li>
                <li><a href="pages/logout.html">Logout</a></li>
            `;
        }
        
        const getStartedBtn = document.getElementById("getStartedBtn");
        if (getStartedBtn) {
            const newBtn = getStartedBtn.cloneNode(true);
            newBtn.addEventListener("click", () => {
                window.location.href = "pages/dashboard.html";
            });
            getStartedBtn.parentNode.replaceChild(newBtn, getStartedBtn);
        }
    }
}

// Get Started Button
function initializeGetStartedButton() {

    const getStartedBtn =
        document.getElementById("getStartedBtn");

    if (!getStartedBtn) return;

    getStartedBtn.addEventListener("click", () => {

        window.location.href =
            "pages/register.html";

    });

}

// Smooth Scroll to Features Section
function initializeSmoothScroll() {

    const featureCards =
        document.querySelector(".features");

    const getStartedBtn =
        document.getElementById("getStartedBtn");

    if (!getStartedBtn || !featureCards) return;

    getStartedBtn.addEventListener("dblclick", () => {

        featureCards.scrollIntoView({
            behavior: "smooth"
        });

    });

}

// Feature Card Hover Effect
function initializeFeatureCards() {

    const cards =
        document.querySelectorAll(".card");

    cards.forEach(card => {

        card.addEventListener("mouseenter", () => {

            card.style.transform =
                "translateY(-10px)";

            card.style.transition =
                "0.3s ease";

        });

        card.addEventListener("mouseleave", () => {

            card.style.transform =
                "translateY(0)";

        });

    });

}