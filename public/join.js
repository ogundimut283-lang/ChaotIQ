// // join.js
// import { initSocket, setupResultModalClose } from "./quiz.js";

// const form = document.getElementById("join-form");
// const statusDiv = document.getElementById("status");
// const lobbyDiv = document.getElementById("lobby");
// const roomCodeSpan = document.getElementById("room-code");

// let socket = null;
// let currentRoomCode = null;

// setupResultModalClose();

// form.addEventListener("submit", (e) => {
//   e.preventDefault();

//   const formData = new FormData(form);
//   currentRoomCode = formData.get("roomCode").toUpperCase().trim();
//   const codename = formData.get("codename");

//   socket = io();
//   initSocket(socket, currentRoomCode);

//   socket.emit("joinRoom", {
//     roomCode: currentRoomCode,
//     codename
//   });

//   socket.on("errorMessage", (msg) => {
//     statusDiv.textContent = msg;
//   });

//   socket.on("roomState", (state) => {
//     lobbyDiv.classList.remove("hidden");
//     roomCodeSpan.textContent = state.roomCode;
//     statusDiv.textContent = "";
//   });
// });
const form = document.getElementById("join-form");
const statusDiv = document.getElementById("status");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const roomCode = e.target.roomCode.value.toUpperCase().trim();
  const codename = e.target.codename.value.trim();

  if (!roomCode || !codename) {
    statusDiv.textContent = "Room code and name required";
    return;
  }

  // ⭐ REDIRECT TO LOBBY
  const url = new URL(window.location.origin + "/lobby.html");
  url.searchParams.set("room", roomCode);
  url.searchParams.set("name", codename);
  url.searchParams.set("host", "false");

  window.location.href = url.toString();
});
