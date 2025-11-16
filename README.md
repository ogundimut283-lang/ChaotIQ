🎮 ChaotIQ — Multiplayer AI-Powered Quiz Game

ChaotIQ is a fast-paced, chaotic multiplayer quiz game where players answer AI-generated questions, earn powerups, sabotage opponents, and battle their way to the top of the leaderboard.

The game supports real-time multiplayer, AI-generated quizzes using OpenAI, interactive powerups, and screen sabotages like blur, blackout, and more.

Live deployment:

🖥️ Frontend (Netlify): https://chaotiq.netlify.app

⚙️ Backend (Render): https://chaotiqq.onrender.com

✨ Features
🧠 AI-Generated Questions

ChaotIQ uses the OpenAI API to automatically generate:

Questions

Multiple-choice answers

Correct explanations

Wrong explanations

👥 Multiplayer Lobby

Players join using a room code

Host controls when the game starts

Real-time player list updates using Socket.io

Animated transitions from lobby → game

⚡ Powerups & Sabotages

Players are rewarded with items based on performance each round:

Buffs

Double Points — next correct answer gives 2× score

Shield — block one sabotage

XP Boosts — +100 / +300 / +500 bonus score

Sabotages

Blur Screen (5s / 10s)

Blackout Screen

(TinyText disabled by request)

🏆 Dynamic Scoring System

The fastest correct answers get the highest rewards and best powerups.

🎨 Clean UI & Animations

Smooth modals

On-screen visual indicators for active powerups

Mobile-friendly layout

🛠️ Tech Stack
Frontend

HTML

CSS

JavaScript (ES modules)

Netlify (hosting)

Backend

Node.js

Express

Socket.io

Render (hosting)

OpenAI API (GPT-4o-mini)

📦 Installation (Local Dev)
1. Clone the repo
git clone https://github.com/yourusername/ChaotIQ.git
cd ChaotIQ

2. Install dependencies
npm install

3. Add environment variables

Create a file named .env:

OPENAI_API_KEY=your_api_key_here

4. Run the server locally
npm start


The backend will run on:

http://localhost:3000

5. Open the frontend

Simply open public/index.html in your browser
(or use Live Server in VS Code).

🚀 Deployment
Frontend (Netlify)

Drag and drop the public folder or connect Git repo.
Make sure socket.io client connects to Render backend:

const socket = io("https://chaotiqq.onrender.com");

Backend (Render)

Create a new Web Service

Use Node 18

Add OPENAI_API_KEY under "Environment Variables"

Start command:

node server.js

📁 Project Structure
ChaotIQ/
│
├── public/
│   ├── index.html
│   ├── lobby.html
│   ├── game.html
│   ├── scripts/
│   │   ├── lobby.js
│   │   ├── game.js
│   │   └── utils/modal.js
│   ├── css/
│   └── assets/
│
├── server.js
├── package.json
├── .env (ignored)
└── README.md

🧩 Powerup Engine (How it works)
1. Server assigns items in giveReward()

Players who answer correctly fastest get:

Higher base points

Higher tier reward pools

Better powerups

function giveReward(room, playerId, basePoints, pool, tier) {
  const item = randomFrom(pool);
  room.players[playerId].items.push(item);
}

2. Player uses item → server validates and triggers effect
socket.on("useItem", ({ roomCode, item, targetId }) => {
    io.to(targetId).emit("applyEffect", { item });
});

3. Client applies visual effect
case "blur10":
    blurScreen(10000);
    break;

🚧 Roadmap

🎤 Voice-based questions

🎨 Custom avatars

🛡️ More advanced defenses

🆚 Team battles mode

🏁 Tournament mode

🤝 Contributing

Pull requests are welcome!
Feel free to open issues or request new features.
