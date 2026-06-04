// Ensure user is logged in
if (typeof checkAuth === "function") {
    checkAuth();
}

window.addEventListener("load", () => {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "true") {
        document.body.classList.add("dark-mode");
    }
});

let currentQuestions = [];
let currentIndex = 0;
let selectedType = "frontend";

async function startInterview() {
    selectedType = document.getElementById("category").value;
    
    const questionTextEl = document.getElementById("questionText");
    const feedbackEl = document.getElementById("feedback");
    const nextBtn = document.getElementById("nextBtn");
    const feedbackBtn = document.getElementById("feedbackBtn");
    const answerBox = document.getElementById("answerBox");

    if (questionTextEl) questionTextEl.innerText = "Loading questions...";
    if (feedbackEl) feedbackEl.innerHTML = "Initializing interview...";
    
    try {
        const response = await apiFetch(`/interview/questions/${selectedType}`);
        const data = await response.json();
        
        if (response.ok && data.questions && data.questions.length > 0) {
            currentQuestions = data.questions;
            currentIndex = 0;
            
            questionTextEl.innerText = currentQuestions[currentIndex];
            feedbackEl.innerHTML = "Interview started! Read the question above and type your answer in the text area.";
            if (answerBox) answerBox.value = "";
            
            if (feedbackBtn) {
                feedbackBtn.disabled = false;
                feedbackBtn.innerText = "Submit & Get Feedback";
            }
            if (nextBtn) nextBtn.disabled = true;
        } else {
            questionTextEl.innerText = "Failed to load questions.";
            feedbackEl.innerHTML = data.message || "Error loading questions from backend.";
        }
    } catch (err) {
        console.error("Error starting interview:", err);
        questionTextEl.innerText = "Error starting interview.";
        feedbackEl.innerHTML = "Make sure the backend server is running.";
    }
}

async function submitAnswer() {
    const answer = document.getElementById("answerBox").value.trim();
    const question = currentQuestions[currentIndex];
    const feedbackEl = document.getElementById("feedback");
    const feedbackBtn = document.getElementById("feedbackBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!answer) {
        alert("Please write an answer before submitting.");
        return;
    }

    if (feedbackEl) feedbackEl.innerHTML = "🤖 AI is analyzing your answer... Please wait.";
    if (feedbackBtn) {
        feedbackBtn.disabled = true;
        feedbackBtn.innerText = "Analyzing...";
    }

    try {
        const response = await apiFetch("/interview/feedback", {
            method: "POST",
            body: JSON.stringify({ question, answer, type: selectedType })
        });
        
        const data = await response.json();
        if (response.ok) {
            feedbackEl.innerHTML = `<h3>Feedback:</h3><p>${data.feedback}</p>`;
            if (nextBtn) nextBtn.disabled = false;
            if (feedbackBtn) feedbackBtn.innerText = "Answer Submitted";
        } else {
            feedbackEl.innerHTML = `<span style="color: red;">Error: ${data.message || "Could not analyze answer."}</span>`;
            if (feedbackBtn) {
                feedbackBtn.disabled = false;
                feedbackBtn.innerText = "Submit & Get Feedback";
            }
        }
    } catch (err) {
        console.error("Error submitting answer:", err);
        feedbackEl.innerHTML = '<span style="color: red;">Failed to connect to backend server for AI feedback.</span>';
        if (feedbackBtn) {
            feedbackBtn.disabled = false;
            feedbackBtn.innerText = "Submit & Get Feedback";
        }
    }
}

function nextQuestion() {
    currentIndex++;
    
    const questionTextEl = document.getElementById("questionText");
    const feedbackEl = document.getElementById("feedback");
    const answerBox = document.getElementById("answerBox");
    const feedbackBtn = document.getElementById("feedbackBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (currentIndex < currentQuestions.length) {
        questionTextEl.innerText = currentQuestions[currentIndex];
        if (answerBox) answerBox.value = "";
        if (feedbackEl) feedbackEl.innerHTML = "Read the question above and submit your answer.";
        
        if (feedbackBtn) {
            feedbackBtn.disabled = false;
            feedbackBtn.innerText = "Submit & Get Feedback";
        }
        if (nextBtn) nextBtn.disabled = true;
    } else {
        questionTextEl.innerText = "🎉 Interview Completed!";
        if (answerBox) answerBox.value = "";
        if (feedbackEl) {
            feedbackEl.innerHTML = `
                <div style="text-align: center;">
                    <h3>Great Job!</h3>
                    <p>You have answered all the questions for this interview round. Keep practicing to build confidence!</p>
                </div>
            `;
        }
        if (feedbackBtn) {
            feedbackBtn.disabled = true;
            feedbackBtn.innerText = "Completed";
        }
        if (nextBtn) nextBtn.disabled = true;
    }
}
