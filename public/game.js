// game.js (ES module)

// ======= URL PARAMS =======
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("room");
const codename = params.get("name") || "Player";
const isHost = params.get("host") === "true";

// ======= DOM ELEMENTS =======
const playerNameEl = document.getElementById("player-name");
const playerScoreEl = document.getElementById("player-score");
const powerupListEl = document.getElementById("powerup-list");

const questionTextEl = document.getElementById("question-text");
const optionButtons = [
  document.getElementById("opt0"),
  document.getElementById("opt1"),
  document.getElementById("opt2"),
  document.getElementById("opt3"),
];
import { showModal, hideModal,showPowerupModal} from "./utils/modal.js";
showModal
// Optional modal elements (if you added them to game.html)
const resultModal = document.getElementById("result-modal");
const resultTitle = document.getElementById("result-title");
const resultExplanation = document.getElementById("result-explanation");
const resultExtra = document.getElementById("result-extra");
const closeResultBtn = document.getElementById("close-result");
let myItems = [];
let currentPlayers = [];




playerNameEl.textContent = codename;
playerScoreEl.textContent = "0";



// ======= SOCKET SETUP =======
const socket = io();
let hasAnsweredCurrent = false;

// Re-join room on game page
if (isHost) {
  socket.emit("hostJoinRoom", { roomCode, codename });
} else {
  socket.emit("joinRoom", { roomCode, codename });
}



// Receive questions
socket.on("questionData", (data) => {
  hasAnsweredCurrent = false;
  renderQuestion(data);
});

// Answer result (correct / incorrect)
socket.on("questionResult", (res) => {
  document.querySelectorAll(".powerup-active").forEach(el => el.remove());
  handleQuestionResult(res);
});

// Scoreboard updates (optional, could be used for a full leaderboard)
socket.on("scoreboard", (data) => {
  // You can show a leaderboard overlay if you want
  console.log("Scoreboard:", data.players);
});
socket.on("roomState", (state) => {
  currentPlayers = state.players;
  

const me = state.players.find(p => p.name === codename);
  if (me) playerScoreEl.textContent = me.score;
});
// Game over
socket.on("gameOver", (data) => {
  showGameOver(data.players);
});

// Sabotages from other players
socket.on("applyEffect", ({ item }) => {
  applySabotageEffect(item);
});

socket.on("shieldBlocked", () => {
  console.log("Your shield blocked a sabotage!");
});
function renderQuestion(data) {
    // Reset state
    hasAnsweredCurrent = false;

    // Set question text
    questionTextEl.textContent = data.question;

    // Render options
    data.options.forEach((opt, index) => {
        const btn = optionButtons[index];

        // Reset button visual state
        btn.disabled = false;
        btn.classList.remove("selected");
        btn.classList.remove("correct");
        btn.classList.remove("incorrect");

        // Update option text
        btn.textContent = opt;

        // Assign click handler
        btn.onclick = () => {
            if (hasAnsweredCurrent) return;

            hasAnsweredCurrent = true;
            btn.classList.add("selected");
            disableAllOptions();

            socket.emit("submitAnswer", {
                roomCode,
                answerIndex: index,
            });
        };
    });
}

function renderPowerups() {
    powerupListEl.innerHTML = "";

    myItems.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("powerup-item");

        // simple text, no icons
        li.textContent = item;

        li.onclick = () => openPowerupModal(item);
        powerupListEl.appendChild(li);
    });
}



function disableAllOptions() {
  optionButtons.forEach((btn) => {
    btn.disabled = true;
  });
}

// ======= RESULT HANDLING =======
function handleQuestionResult(res) {
  // Update score
  if (typeof res.totalScore === "number") {
    playerScoreEl.textContent = res.totalScore;
  }

  // Add powerup to list if any
  if (res.item) {
    myItems.push(res.item);
    renderPowerups();
}




  // Show explanation either in modal (if exists) or showModal fallback
  const titleText = res.correct ? "Correct! 🎉" : "Incorrect 😢";
  const extraText = res.correct
    ? `You gained ${res.pointsGained} points` +
      (res.tier ? ` (Tier ${res.tier})` : "") +
      (res.item ? ` and got: ${res.item}` : "")
    : "You gained 0 points.";

  if (resultModal && resultTitle && resultExplanation && resultExtra) {
    resultTitle.textContent = titleText;
    resultExplanation.textContent = res.explanation;
    resultExtra.textContent = extraText;
    resultModal.classList.remove("hidden");
  } else {
    showModal(titleText, `${res.explanation}\n\n${extraText}`);
  }
}



// Close modal if present
if (closeResultBtn && resultModal) {
  closeResultBtn.onclick = () => {
    resultModal.classList.add("hidden");
  };
}

// ======= GAME OVER =======
function showGameOver(players) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const lines = sorted.map(
    (p, i) => `${i + 1}. ${p.name} — ${p.score} pts`
  );

  if (resultModal && resultTitle && resultExplanation && resultExtra) {
    resultTitle.textContent = "Game Over 🏁";
    resultExplanation.textContent = "Final Scores:";
    resultExtra.innerHTML = lines.join("\n");
    resultModal.classList.remove("hidden");
  } else {
    showModal("Game Over!\n\n" + lines.join("\n"));
  }
}



// ======= SABOTAGE EFFECTS (basic stubs) =======
function applySabotageEffect(item) {

    switch (item) {

        // ===== SABOTAGES =====

        case "blur10":
            showModal("Sabotage! Blur 🌫️", "Your screen is blurred for 10 seconds!");
            blurScreen(10000);
            break;

        case "blur5":
            showModal("Sabotage! Blurr 🌫️", "Your screen is blurred for 5 seconds!");
            blurScreen(5000);
            break;

        case "blackout10":
            showModal("Sabotage! BlackOut 🌑", "Your screen is completely blacked out for 10 seconds!");
            blackout(10000);
            break;

        case "tinyText":
            showModal("Sabotage! Tiny Text 🔎", "All text shrinks to tiny size for 10 seconds!");
            tinyTextEffect(10000);
            break;


        // ===== BUFFS =====

        case "doublePoints":
            showModal("Powerup! Double Points ⚡", "Your next correct answer gives DOUBLE points!");
            break;

        case "shield":
            showModal("Powerup! Shield 🛡️", "A shield now protects you from one sabotage.");
            break;
        case "xp500":
            showModal("Powerup! +XP500 💡", "Extra 500 points for a correct answer.");
            addXP(500);
            break;
        case "xp300":
            showModal("Powerup! +XP300 💡", "Extra 300 points for a correct answer.");
            addXP(300);
            break;
        case "xp100":
            showModal("Powerup! +XP100 💡", "Extra 100 points for a correct answer.");
            addXP(100);
            break;


        default:
            console.log("Unknown powerup:", item);
    }
}


function blurScreen(ms) {
  document.body.style.filter = "blur(4px)";
  setTimeout(() => {
    document.body.style.filter = "none";
  }, ms);
}

function blackout(ms) {
  const overlay = document.createElement("div");
  overlay.className = "blackout";
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), ms);
}

function tinyTextEffect(ms) {
  document.body.classList.add("tiny-text");
  setTimeout(() => {
    document.body.classList.remove("tiny-text");
  }, ms);
}
function addXP(amount) {
    const current = parseInt(playerScoreEl.textContent);
    playerScoreEl.textContent = current + amount;
    showModal("XP Gained!", `+${amount} bonus points!`);
}




function openPowerupModal(item) {
    const sabotageItems = ["blur10", "blur5", "blackout10", "tinyText"];

    if (sabotageItems.includes(item)) {
        const opponents = currentPlayers.filter(p => p.name !== codename);

        showPowerupModal(item, opponents, (targetId) => {
            socket.emit("useItem", { roomCode, item, targetId });
            myItems = myItems.filter(x => x !== item);
            renderPowerups();
        });

    } else {
        // NO targetId used here
        showPowerupModal(item, [], () => {
            socket.emit("useItem", { roomCode, item, targetId: null });
            myItems = myItems.filter(x => x !== item);
            renderPowerups();
        });
    }
}
