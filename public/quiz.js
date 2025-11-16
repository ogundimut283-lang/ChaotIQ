export function initSocket(socket, roomCode) {
  let hasAnsweredCurrent = false;

  socket.on("roomState", (state) => {
    const list = document.getElementById("players-list");
    if (list) {
      list.innerHTML = "";
      state.players.forEach((p) => {
        const li = document.createElement("li");
        li.textContent = `${p.name} (${p.score || 0} pts)`;
        list.appendChild(li);
      });
      const rc = document.getElementById("room-code");
      if (rc) rc.textContent = state.roomCode;
    }
  });

  socket.on("questionData", (data) => {
    hasAnsweredCurrent = false;
    showQuiz(data);
  });

  socket.on("questionResult", (res) => {
    showResultModal(res);
  });

  socket.on("scoreboard", (data) => {
    const list = document.getElementById("players-list");
    if (!list) return;
    list.innerHTML = "";
    data.players.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `${p.name} (${p.score} pts)`;
      list.appendChild(li);
    });
  });

  socket.on("gameOver", (data) => {
    showGameOver(data);
  });

  socket.on("applyEffect", ({ item }) => {
    // sabotage effects can go here
  });

  socket.on("shieldBlocked", () => {
    console.log("Shield blocked an attack!");
  });

  function showQuiz(data) {
    document.getElementById("lobby")?.classList.add("hidden");
    document.getElementById("quiz")?.classList.remove("hidden");

    document.getElementById("q-index").textContent = data.index + 1;
    document.getElementById("q-total").textContent = data.total;
    document.getElementById("q-text").textContent = data.question;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    data.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.textContent = opt;

      btn.onclick = () => {
        if (hasAnsweredCurrent) return;
        hasAnsweredCurrent = true;
        socket.emit("submitAnswer", {
          roomCode,
          answerIndex: idx
        });
      };

      optionsDiv.appendChild(btn);
    });
  }
}

export function setupResultModalClose() {
  const btn = document.getElementById("close-result");
  const modal = document.getElementById("result-modal");
  if (!btn || !modal) return;

  btn.onclick = () => modal.classList.add("hidden");
}

function showResultModal(res) {
  const modal = document.getElementById("result-modal");
  modal.classList.remove("hidden");

  document.getElementById("result-title").textContent =
    res.correct ? "Correct! 🎉" : "Incorrect";

  document.getElementById("result-explanation").textContent =
    res.explanation;

  document.getElementById("result-extra").textContent =
    res.correct
      ? `+${res.pointsGained} points ${
          res.item ? ` | Item: ${res.item}` : ""
        }`
      : `0 points`;

  if (res.correct) launchConfetti();
}

function showGameOver(data) {
  const sorted = [...data.players].sort((a, b) => b.score - a.score);

  const modal = document.getElementById("result-modal");
  modal.classList.remove("hidden");

  document.getElementById("result-title").textContent = "Game Over 🏁";
  document.getElementById("result-explanation").textContent =
    "Final Scores:";
  document.getElementById("result-extra").innerHTML = sorted
    .map((p, i) => `${i + 1}. ${p.name} — ${p.score}`)
    .join("<br>");
}


