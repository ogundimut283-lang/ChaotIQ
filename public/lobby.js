// // lobby.js (fixed)
// // ---------------------------

// const params = new URLSearchParams(window.location.search);
// const roomCode = params.get("room");
// const codename = params.get("name") || "Player";
// const isHost = params.get("host") === "true";

// const roomCodeSpan = document.getElementById("room-code");
// const playersList = document.getElementById("players-list");
// const startGameBtn = document.getElementById("start-game");

// roomCodeSpan.textContent = roomCode || "N/A";

// // Only host should see button
// if (isHost) {
//   startGameBtn.classList.remove("hidden");
// }

// const socket = io();

// /* ⭐ FIX: Only join room AFTER socket is connected */
// socket.on("connect", () => {
//   if (isHost) {
//     socket.emit("hostJoinRoom", { roomCode, codename });
//   } else {
//     socket.emit("joinRoom", { roomCode, codename });
//   }
// });

// /* Lobby player list update */
// socket.on("roomState", (state) => {
//   playersList.innerHTML = "";
//   state.players.forEach((p) => {
//     const li = document.createElement("li");
//     li.textContent = `${p.name} (${p.score || 0} pts)`;
//     playersList.appendChild(li);
//   });
// });

// /* Host starts game */
// if (isHost) {
//   startGameBtn.addEventListener("click", () => {
//     socket.emit("startGame", { roomCode });
//   });
// }

// socket.on("startGame", () => {
//   const url = new URL(window.location.origin + "/game.html");
//   url.searchParams.set("room", roomCode);
//   url.searchParams.set("name", codename);
//   url.searchParams.set("host", isHost ? "true" : "false");

//   window.location.href = url.toString();
// });


// /* Errors */
// socket.on("errorMessage", (msg) => {
//   alert(msg);
// });

// lobby.js (FINAL FIXED VERSION)

// const params = new URLSearchParams(window.location.search);
// const roomCode = params.get("room");
// const codename = params.get("name") || "Player";
// const isHost = params.get("host") === "true";

// const roomCodeSpan = document.getElementById("room-code");
// const playersList = document.getElementById("players-list");
// const startGameBtn = document.getElementById("start-game");

// roomCodeSpan.textContent = roomCode || "N/A";

// // Host sees the button
// if (isHost) {
//   startGameBtn.classList.remove("hidden");
// }

// const socket = io();

// socket.on("connect", () => {
//   if (isHost) {
//     socket.emit("hostJoinRoom", { roomCode, codename });
//   } else {
//     socket.emit("joinRoom", { roomCode, codename });
//   }
// });

// /* Update lobby list */
// socket.on("roomState", (state) => {
//   playersList.innerHTML = "";
//   state.players.forEach((p) => {
//     const li = document.createElement("li");
//     li.textContent = `${p.name} (${p.score || 0} pts)`;
//     playersList.appendChild(li);
//   });
// });

// /* HOST clicks start → tell server to start game */
// if (isHost) {
//   startGameBtn.addEventListener("click", () => {
//     socket.emit("startGame", { roomCode });
//   });
// }

// /* When server says GAME STARTS → move to game.html */
// socket.on("gameStarted", () => {
//   const url = new URL(window.location.origin + "/game.html");
//   url.searchParams.set("room", roomCode);
//   url.searchParams.set("name", codename);
//   url.searchParams.set("host", isHost ? "true" : "false");
//   window.location.href = url.toString();
// });

// /* Errors */
// socket.on("errorMessage", (msg) => {
//   alert(msg);
// });
// lobby.js

import { showModal, hideModal } from "./utils/modal.js";

const params = new URLSearchParams(window.location.search);
const roomCode = params.get("room");
const codename = params.get("name") || "Player";
const isHost = params.get("host") === "true";

const roomCodeSpan = document.getElementById("room-code");
const playersList = document.getElementById("players-list");
const startGameBtn = document.getElementById("start-game");

roomCodeSpan.textContent = roomCode;

// Show start button only to host
if (isHost) startGameBtn.classList.remove("hidden");

const socket = io();

// Join room once connected
socket.on("connect", () => {
  socket.emit(isHost ? "hostJoinRoom" : "joinRoom", { roomCode, codename });
});

// Update player list
socket.on("roomState", (state) => {
  playersList.innerHTML = "";
  state.players.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.score} pts)`;
    playersList.appendChild(li);
  });
});

// Host starts game
if (isHost) {
  startGameBtn.onclick = () => {
    console.log("Start Game button clicked!");   // DEBUG
    socket.emit("startGame", { roomCode });
    console.log("startGame emitted");
  };
}


// Redirect ONLY when server says game started
socket.on("gameStarted", () => {
  const url = new URL(window.location.origin + "/game.html");
  url.searchParams.set("room", roomCode);
  url.searchParams.set("name", codename);
  url.searchParams.set("host", isHost);
  window.location.href = url.toString();
});
