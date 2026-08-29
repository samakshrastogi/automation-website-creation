# 🌌 Gemini × ChatGPT Hybrid AI Monorepo

An ultra-modern, full-stack AI platform combining the best of **ChatGPT & Google Gemini** interfaces with **Glassmorphism design, interactive 3D WebGL visuals, GSAP animations, dynamic prompt generation, Node.js backend, and MongoDB database persistence**.

---

## ✨ Features

- 💎 **Glassmorphism Design System**: Translucent frosted acrylic panels, layered blur (`backdrop-filter: blur(24px)`), aurora glow gradients, and modern dark aesthetics.
- 🪐 **Interactive 3D WebGL Canvas (Three.js)**: Ethereal dynamic particle nebula and holographic wireframe core reacting smoothly to cursor movement and AI generation states.
- ⚡ **GSAP Smooth Animations**: Physics-based staggered entrance reveals, hover morphs, pulsing badges, and confetti bursts.
- 🔮 **Instant "Generate Prompt" Engine**: One-click prompt spark generator powered by Google Gemini that crafts creative questions across Coding, Architecture, Sci-Fi, and Logic.
- 🤖 **Google Gemini API Integration**: Direct integration with Google's Generative AI SDK (`gemini-1.5-flash` and `gemini-1.5-pro`) with built-in zero-crash demo fallback.
- 📦 **Monorepo Architecture**: Clean separation of concerns with React + Vite frontend and Node.js + Express backend managed via NPM Workspaces.
- 🍃 **MongoDB & Mongoose Persistence**: Full chat thread history, timestamps, categorized messages, and in-memory offline fallback.
- 📝 **Rich Markdown & Code Highlighting**: Formatted code blocks with one-click copy buttons and syntax recognition.

---

## 📂 Project Structure

```text
├── package.json              # Monorepo root configuration & workspace runner
├── .gitignore                # Global git ignore rules
├── README.md                 # Complete documentation & guide
│
├── client/                   # React Frontend (Vite + Tailwind + GSAP + Three.js)
│   ├── index.html            # HTML entry point with Google Fonts
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite config with backend proxy
│   ├── tailwind.config.js    # Glassmorphic color palette & shadows
│   ├── postcss.config.js     # PostCSS setup
│   └── src/
│       ├── App.jsx           # Main layout & chat orchestration
│       ├── index.css         # Custom glassmorphism, glowing borders & scrollbars
│       ├── main.jsx          # React DOM render root
│       ├── components/
│       │   ├── Background3D.jsx   # Three.js 3D interactive particle sphere
│       │   ├── Header.jsx         # Glass top navigation bar & model selector
│       │   ├── Sidebar.jsx        # Frosted glass conversation history drawer
│       │   ├── ChatWindow.jsx     # Hero landing state & message thread viewer
│       │   ├── ChatMessage.jsx    # User & AI Markdown message bubble
│       │   ├── PromptInput.jsx    # Glass capsule input & "Generate Prompt" button
│       │   └── FeaturesModal.jsx  # Architecture & system info modal
│       └── services/
│           └── api.js        # REST client connecting to backend endpoints
│
└── server/                   # Node.js / Express API Server
    ├── package.json          # Server dependencies (Express, Mongoose, @google/genai)
    ├── .env.example          # Environment variable template
    ├── .env                  # Local server environment configuration
    └── src/
        ├── index.js          # Express app entry & server listener
        ├── config/
        │   └── db.js         # Resilient MongoDB Mongoose connection
        ├── models/
        │   └── Chat.js       # Chat and Message Mongoose schemas
        ├── controllers/
        │   └── chatController.js # Gemini generation & prompt engine
        └── routes/
            └── chatRoutes.js # REST API endpoints
```

---

## 🚀 Steps to Run This Project

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher installed ([Download Node.js](https://nodejs.org/))
- **MongoDB** *(Optional)*: Local MongoDB instance or MongoDB Atlas URI (if not available, the app will automatically run in lightweight offline mode).
- **Google Gemini API Key** *(Optional for live responses)*: Get a free API key at [Google AI Studio](https://aistudio.google.com/).

---

### 2. Install Dependencies

Install all root, client, and server dependencies with a single command from the root directory:

```bash
npm run install:all
```
*(Or simply run `npm install` at the project root).*

---

### 3. Configure Environment Variables

Open `server/.env` (or copy from `server/.env.example`):

```env
PORT=5000
NODE_ENV=development

# Paste your Google Gemini API key here
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Connection String & Database Name (Controlled via .env)
MONGODB_URI=mongodb://localhost:27017
DB_NAME=website_creation
```

> **Note**: Even without an API key or MongoDB running, the application will boot seamlessly in demo mode with full UI and 3D functionality so you can test it immediately!

---

### 4. Start the Application

Run both the frontend and backend concurrently with one command:

```bash
npm run dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📜 Available NPM Scripts

From the root directory:

| Command | Description |
|---|---|
| `npm run dev` | Runs both backend (`localhost:5000`) and frontend (`localhost:3000`) concurrently. |
| `npm run dev:client` | Starts only the Vite frontend dev server. |
| `npm run dev:server` | Starts only the Express Node.js backend server with nodemon. |
| `npm run build` | Builds the React frontend for production into `client/dist`. |
| `npm run start` | Starts the production backend server. |

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Sends message to Gemini AI, returns response, and saves to MongoDB. |
| `POST` | `/api/generate-prompt` | Generates a creative prompt idea dynamically via Gemini. |
| `GET` | `/api/chats` | Retrieves all saved conversation sessions. |
| `GET` | `/api/chats/:id` | Retrieves full message history for a given chat ID. |
| `DELETE` | `/api/chats/:id` | Deletes a conversation thread. |
| `GET` | `/api/health` | Health check reporting server, DB, and Gemini status. |

---

## 🎨 Design System & Animation Tech

- **Glassmorphism**: Built using custom Tailwind classes `.glass-panel`, `.glass-card`, and `.glass-input` with acrylic backdrop filters and layered borders.
- **Three.js Particle Galaxy**: Responsive 3D particle cloud with additive blending, mouse tracking parallax, and speed acceleration during generation.
- **GSAP (GreenSock)**: Timeline-based staggered animations for message bubbles, prompt cards, and button interaction states.
- **Canvas Confetti**: Celebratory sparkle bursts when generating prompt ideas.

---

## 📄 License
This project is open-source and available under the **MIT License**.
