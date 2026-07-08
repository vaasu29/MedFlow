# 🏥 MedFlow — AI Agent for Patient Intake & Appointment Scheduling

> **An intelligent healthcare workflow tool** that automates patient intake, classifies urgency, recommends specialists, and autonomously books appointments — powered by an AI agent with full explainability.

[![CI](https://github.com/YOUR_USERNAME/MedFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/MedFlow/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🔗 Live Demo

- **Frontend:** [https://medflow-ai.vercel.app](https://medflow-ai.vercel.app) *(deploy to get this link)*
- **Backend API:** [https://medflow-api.onrender.com/api/health](https://medflow-api.onrender.com/api/health) *(deploy to get this link)*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Intake Agent** | Parses free-text symptoms, no forms to fill |
| ⚡ **Urgency Classification** | AUTO classifies LOW / MEDIUM / HIGH / CRITICAL |
| 🩺 **Specialist Matching** | Matches symptoms to the right specialist |
| 📅 **Autonomous Booking** | Agent checks availability and books without human input |
| 👤 **Human Override** | Admin can override/cancel any AI decision |
| 🔍 **Full Explainability** | Every agent decision logged with reasoning + confidence |
| 📊 **Live Dashboard** | Real-time stats, urgency breakdowns, appointment tables |
| 👨‍⚕️ **Doctor Directory** | 10 specialists with availability slots |

---

## 🏗️ Architecture

```
Patient Browser
     │
     ▼
React Frontend (Vite)   →   Node/Express REST API
                                  │
                         ┌────────┴─────────┐
                         │                  │
                    SQLite (Prisma)    Mock AI Agent
                    patients           symptom parsing
                    doctors            urgency classification
                    appointments       specialist matching
                    agent_logs         autonomous booking
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/MedFlow.git
cd MedFlow
```

### 2. Setup Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
node src/seed.js          # Seeds 10 doctors + slots
npm run dev               # Starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev               # Starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) — you're live! 🎉

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/intake` | Submit patient intake — triggers AI agent |
| `GET` | `/api/doctors` | List all doctors with slots |
| `GET` | `/api/doctors/specialties` | Get all specialties |
| `GET` | `/api/appointments` | List appointments |
| `PATCH` | `/api/appointments/:id` | Update / override appointment |
| `DELETE` | `/api/appointments/:id` | Cancel appointment |
| `GET` | `/api/agent-logs` | Agent decision history |
| `GET` | `/api/dashboard` | Aggregate stats |
| `GET` | `/api/health` | Health check |

### Example: Submit Intake
```bash
curl -X POST http://localhost:5000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "symptoms": "I have had chest pain and shortness of breath for 2 days"
  }'
```

Response:
```json
{
  "patient": { "id": "...", "name": "Jane Doe" },
  "agent": {
    "action": "BOOKED",
    "urgency": "HIGH",
    "urgencyReason": "Symptoms are severe and require prompt medical evaluation",
    "recommendedSpecialty": "Cardiologist",
    "confidence": 0.87,
    "doctor": { "name": "Ayesha Malik", "specialty": "Cardiologist" },
    "slot": { "date": "2026-07-09", "startTime": "09:00", "endTime": "09:30" }
  }
}
```

---

## 🤖 How the AI Agent Works

The mock agent uses **rule-based NLP** to simulate LLM behavior:

1. **Parse Symptoms** — Extracts medical keywords from free text
2. **Classify Urgency** — Matches against severity keyword rules (CRITICAL → LOW)
3. **Recommend Specialty** — Scores each specialty by keyword matches
4. **Check Availability** — Queries DB for free slots in matching specialty
5. **Book / Flag** — Either autonomously books or flags for human review
6. **Log Decision** — Stores full reasoning + confidence in `agent_logs` table

Replace `src/agent/mockIntakeAgent.js` with a real OpenAI/Gemini call to go production-ready.

---

## 🌐 Deployment Guide

### Frontend → Vercel (free)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import `MedFlow`
3. Set **Root Directory**: `frontend`
4. Add environment variable: `VITE_API_URL` = your Render backend URL
5. Click Deploy

### Backend → Render (free)

1. Go to [render.com](https://render.com) → New Web Service → Connect GitHub
2. Set **Root Directory**: `backend`
3. **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && node src/seed.js`
4. **Start Command**: `npm start`
5. Add environment variable: `DATABASE_URL` = `file:./dev.db`
6. Add environment variable: `FRONTEND_URL` = your Vercel URL

> ⚠️ **Note**: Render's free tier uses ephemeral storage — the SQLite DB resets on redeploy. For persistence, upgrade to PostgreSQL (change `DATABASE_URL` and update `schema.prisma` provider to `postgresql`).

---

## 🗂️ Project Structure

```
MedFlow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # DB models
│   ├── src/
│   │   ├── agent/
│   │   │   └── mockIntakeAgent.js  # 🤖 AI agent logic
│   │   ├── routes/
│   │   │   ├── intake.js
│   │   │   ├── doctors.js
│   │   │   ├── appointments.js
│   │   │   ├── agentLogs.js
│   │   │   └── dashboard.js
│   │   ├── seed.js             # DB seeder
│   │   └── server.js           # Express entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── AgentThinking.jsx
│   │   ├── pages/
│   │   │   ├── PatientIntake.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AgentLogs.jsx
│   │   │   └── Doctors.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Design system
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
├── .gitignore
└── README.md
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Vanilla CSS |
| Backend | Node.js, Express |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| AI Agent | Mock rule-based (swap for OpenAI) |
| CI/CD | GitHub Actions |
| Deployment | Vercel + Render |

---

## 📋 JD Alignment (Iksha Labs)

| Requirement | Implementation |
|---|---|
| React | ✅ React 18 + Vite frontend |
| Node.js | ✅ Express backend |
| PostgreSQL | ✅ Prisma ORM (SQLite dev, PostgreSQL prod) |
| REST APIs | ✅ Full CRUD API with 8 endpoints |
| AI Agents | ✅ Autonomous intake agent with decision logs |
| Healthcare/medtech | ✅ Domain is patient intake & scheduling |
| CI/CD | ✅ GitHub Actions workflow |

---

## 📄 License

MIT © 2026 MedFlow
