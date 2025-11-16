// // host.js
// import { initSocket, setupResultModalClose } from "./quiz.js";

// const form = document.getElementById("host-form");
// const statusDiv = document.getElementById("status");
// const lobbyDiv = document.getElementById("lobby");
// const roomCodeSpan = document.getElementById("room-code");
// const startBtn = document.getElementById("start-quiz");

// let socket = null;
// let currentRoomCode = null;
// let codename = null;

// document.addEventListener("DOMContentLoaded", () => {
//   setupResultModalClose();
// });


// form.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   statusDiv.textContent = "Creating room & generating quiz...";
//   const fd = new FormData(form);
//   codename = fd.get("codename");

//   const res = await fetch("/api/create-room", {
//   method: "POST",
//   body: fd
//   });

// const data = await res.json();  // THIS defines the variable

// if (data.error) {
//   statusDiv.textContent = data.error;
//   return;
// }

// currentRoomCode = data.roomCode;
// statusDiv.textContent = "Room created! Connecting...";


//   socket = io();
//   initSocket(socket, currentRoomCode);

//   socket.emit("hostJoinRoom", {
//     roomCode: currentRoomCode,
//     codename
//   });

//   lobbyDiv.classList.remove("hidden");
//   roomCodeSpan.textContent = currentRoomCode;
// });

// startBtn.addEventListener("click", () => {
//   if (!socket || !currentRoomCode) return;
//   socket.emit("startQuiz", { roomCode: currentRoomCode });
// });
// import { initSocket, setupResultModalClose } from "./quiz.js";

// const form = document.getElementById("host-form");
// const statusDiv = document.getElementById("status");

// let roomCode = null;
// start
// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   statusDiv.textContent = "Generating quiz...";

//   const fd = new FormData(form);
//   const codename = fd.get("codename");

//   const res = await fetch("/api/create-room", {
//     method: "POST",
//     body: fd
//   });

//   const data = await res.json();

//   if (data.error) {
//     statusDiv.textContent = data.error;
//     return;
//   }

//   roomCode = data.roomCode;

//   // ⭐ REDIRECT TO LOBBY
//   const url = new URL(window.location.origin + "/lobby.html");
//   url.searchParams.set("room", roomCode);
//   url.searchParams.set("name", codename);
//   url.searchParams.set("host", "true");

//   window.location.href = url.toString();
// });
// host.js (FINAL FIXED VERSION)
import { showModal, hideModal } from "./utils/modal.js";

const form = document.getElementById("host-form");
const statusDiv = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusDiv.textContent = "Generating quiz...";

  const fd = new FormData(form);

  const codename = fd.get("codename");
  const questionCount = fd.get("questionCount");
  const topic = fd.get("topic");
  const grade = fd.get("grade");

  // ⭐ Validate
  if (!codename || !questionCount || !topic || !grade) {
    statusDiv.textContent = "Please fill in all fields.";
    return;
  }

  // ⭐ API for creating room
  const res = await fetch("https://chaotiqq.onrender.com/api/create-room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      codename,
      questionCount,
      topic,
      grade
    })
  });

  const data = await res.json();

  if (data.error) {
    statusDiv.textContent = data.error;
    return;
  }

  const roomCode = data.roomCode;

  // ⭐ Redirect host to lobby
  const url = new URL(window.location.origin + "/lobby.html");
  url.searchParams.set("room", roomCode);
  url.searchParams.set("name", codename);
  url.searchParams.set("host", "true");

  window.location.href = url.toString();
});
