
import express from "express";
import http from "http";
import { Server } from "socket.io";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";


import path from "path";

import { fileURLToPath } from "url";


dotenv.config();

// ---------------- PATH SETUP ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- APP + SOCKET ----------------
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// ---------------- OPENAI ----------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ---------------- ROOMS ----------------
const rooms = {};

// ---------------- REWARD POOLS ----------------
const tier1Pool = [
  "doublePoints", "shield",
  "xp500", "blur10", "blackout10",
  "tinyText"
];

const tier2Pool = [
   "shield", "doublePoints",
  "xp300", "blur5",
  "blackout10",
  "tinyText",
];

const tier3Pool = [
  "shield",  "xp100", "blur5",
   "blackout10",
];

// ---------------- HELPERS ----------------
function makeRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}




// ---------------- SAFE JSON QUIZ GENERATION ----------------
async function generateQuizFromText(text, numQuestions) {
  const prompt = `
Generate ${numQuestions} multiple-choice questions **based ONLY** on this study material:

${text}

Return STRICT JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["A","B","C","D"],
      "correctIndex": 0,
      "explanationCorrect": "...",
      "explanationWrong": "..."
    }
  ]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You generate quiz questions ONLY from the material." },
      { role: "user", content: prompt }
    ]
  });

  const raw = completion.choices[0].message.content;

  console.log("\n======= RAW OPENAI RESPONSE =======\n", raw, "\n");

  // SAFE PARSING
  try {
    const parsed = JSON.parse(raw);

    if (
      !parsed.questions ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0
    ) {
      throw new Error("Bad JSON structure.");
    }

    return parsed.questions;
  } catch (err) {
    console.log("❌ JSON PARSE FAILED:", err.message);

    // ALWAYS return a fallback question to avoid blank UI
    return [
      {
        question: "Quiz generation failed. This is a fallback question.",
        options: ["Fallback A", "Fallback B", "Fallback C", "Fallback D"],
        correctIndex: 0,
        explanationCorrect: "This is fallback correct explanation.",
        explanationWrong: "This is fallback wrong explanation."
      }
    ];
  }
}

// ---------------- CREATE ROOM ----------------
// CREATE ROOM (Topic + Grade Level)
app.post("/api/create-room", async (req, res) => {
  try {
    const { codename, questionCount, topic, grade } = req.body;

    if (!topic || !grade) {
      return res.status(400).json({ error: "Topic and grade level are required." });
    }

    const numQuestions = Math.min(20, Math.max(5, parseInt(questionCount)));

    const studyText = `Topic: ${topic}\nGrade Level: ${grade}\nCreate questions appropriate for this level.`

    const questions = await generateQuizFromText(studyText, numQuestions);

    const roomCode = makeRoomCode();

    rooms[roomCode] = {
      code: roomCode,
      quiz: questions,
      current: 0,
      players: {},
      answers: {}
    };

    return res.json({ roomCode, quizLength: questions.length });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server failed to create room." });
  }
});


// ---------------- SOCKET.IO LOGIC ----------------
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // HOST JOIN
  socket.on("hostJoinRoom", ({ roomCode, codename }) => {
    joinPlayer(socket, roomCode, codename);
  });

  // PLAYER JOIN
  socket.on("joinRoom", ({ roomCode, codename }) => {
    joinPlayer(socket, roomCode, codename);
  });

  socket.on("startGame", ({ roomCode }) => {
  console.log("SERVER RECEIVED startGame for room:", roomCode);

  const room = rooms[roomCode];
  if (!room) return;

  // tell all clients to redirect to game.html
  io.to(roomCode).emit("gameStarted");

  // allow time for redirect to game.html to load
  setTimeout(() => {
    room.current = 0;
    room.answers = {};
    sendQuestion(roomCode);
  }, 500);
});

  // SUBMIT ANSWER
  socket.on("submitAnswer", ({ roomCode, answerIndex }) => {
    const room = rooms[roomCode];
    if (!room) return;

    if (!room.players[socket.id]) return;

    if (room.answers[socket.id]) return; // already answered

    room.answers[socket.id] = { answerIndex };

    const total = Object.keys(room.players).length;
    const answered = Object.keys(room.answers).length;

    if (answered === total) resolveRound(roomCode);
  });

  // USE POWERUP
  socket.on("useItem", ({ roomCode, item, targetId }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const user = room.players[socket.id];
    if (!user) return;

    if (!user.items.includes(item)) return;

    user.items = user.items.filter((i) => i !== item);

    // SELF POWERUPS (buffs)
const selfBuffs = [
  "doublePoints",
  "shield"];
const xpBuffs = ["xp500", "xp300", "xp100"];


if (selfBuffs.includes(item)) {
    user.activeEffects.push(item);
    io.to(socket.id).emit("applyEffect", { item });
    sendRoomState(roomCode); // Update UI
    return;
}

if (xpBuffs.includes(item)) {
        const xpAmount = parseInt(item.replace("xp", ""));
        user.score += xpAmount;
        io.to(socket.id).emit("applyEffect", { item, xpAmount });
        sendRoomState(roomCode); // Update score
        return;
    }

// SABOTAGES REQUIRE A TARGET
const target = room.players[targetId];
if (!target) return;

// SHIELD CHECK
 if (target.activeEffects.includes("shield")) {
        target.activeEffects = target.activeEffects.filter(e => e !== "shield");
        io.to(targetId).emit("shieldBlocked");
        sendRoomState(roomCode);
        return;
    }

// APPLY SABOTAGE
io.to(targetId).emit("applyEffect", { item });

  });

  // DISCONNECT
  socket.on("disconnect", () => {
    for (const code in rooms) {
      const room = rooms[code];
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        sendRoomState(code);
      }
    }
  });
});

const AVATARS = ["🐱","🦊","🐼","🐸","🦁"];

function joinPlayer(socket, roomCode, codename) {
  const room = rooms[roomCode];
  if (!room) return socket.emit("errorMessage", "Room not found.");
  if (Object.keys(room.players).length >= 4)
    return socket.emit("errorMessage", "Room is full.");

  socket.join(roomCode);

  room.players[socket.id] = {
    id: socket.id,
    name: codename,
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    score: 0,
    items: [],
    activeEffects: []
  };

  sendRoomState(roomCode);

  if (room.current < room.quiz.length) sendQuestion(roomCode);
}


// ---------------- SEND ROOM STATE ----------------
function sendRoomState(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  io.to(roomCode).emit("roomState", {
    roomCode,
    players: Object.values(room.players),
    quizLength: room.quiz.length
  });
}

// ---------------- SEND QUESTION ----------------
function sendQuestion(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const q = room.quiz[room.current];

  io.to(roomCode).emit("questionData", {
    index: room.current,
    total: room.quiz.length,
    question: q.question,
    options: q.options
  });
}

// ---------------- RESOLVE ROUND ----------------
function resolveRound(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const q = room.quiz[room.current];
  const correctIndex = q.correctIndex;

  const correct = [];
  const wrong = [];

  for (const [id, ans] of Object.entries(room.answers)) {
    if (ans.answerIndex === correctIndex) correct.push(id);
    else wrong.push(id);
  }

  const reward = {};

  // Give rewards with doublePoints multiplier
  if (correct[0]) reward[correct[0]] = giveReward(room, correct[0], 1000, tier1Pool, 1);
  if (correct[1]) reward[correct[1]] = giveReward(room, correct[1], 750, tier2Pool, 2);
  if (correct[2]) reward[correct[2]] = giveReward(room, correct[2], 500, tier3Pool, 3);
  if (correct[3]) reward[correct[3]] = giveReward(room, correct[3], 250, [], 4);

  wrong.forEach((id) => {
    reward[id] = { points: 0, tier: null, item: null };
  });

  // SEND RESULTS
  for (const [pid, ans] of Object.entries(room.answers)) {
    const isCorrect = ans.answerIndex === correctIndex;

    io.to(pid).emit("questionResult", {
      correct: isCorrect,
      chosenIndex: ans.answerIndex,
      correctIndex,
      pointsGained: reward[pid].points,
      tier: reward[pid].tier,
      item: reward[pid].item,
      explanation: isCorrect ? q.explanationCorrect : q.explanationWrong,
      totalScore: room.players[pid].score
    });
  }

  io.to(roomCode).emit("scoreboard", {
    players: Object.values(room.players)
  });

  // NEXT QUESTION
  room.current++;
  room.answers = {};

  if (room.current < room.quiz.length) {
    sendQuestion(roomCode);
  } else {
    io.to(roomCode).emit("gameOver", {
      players: Object.values(room.players)
    });
  }
}

function giveReward(room, playerId, basePoints, pool, tier) {
  const player = room.players[playerId];
  
  // Check for doublePoints buff
  let points = basePoints;
  if (player.activeEffects.includes("doublePoints")) {
    points *= 2;
    player.activeEffects = player.activeEffects.filter(e => e !== "doublePoints");
  }
  
  player.score += points;

  const item = pool.length ? randomFrom(pool) : null;
  if (item) player.items.push(item);

  return { points, tier, item };
}

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running at: http://localhost:${PORT}\n`);
});
