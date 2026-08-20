# TrustTrail

> AI-Powered Tourism Scam Risk & Safety Platform — Smart India Hackathon 2026 Prototype

## Quick Start

### Backend (pure-Python server, zero dependencies)

```bash
cd backend
python -m app.main        # serves on http://localhost:8000
PORT=9000 python -m app.main   # custom port
```

API available at: http://localhost:8000  
Interactive docs: (this prototype ships a stdlib HTTP server, not FastAPI — see `backend/app/main.py`)

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## Deploying Live

The backend is a dependency-free Python stdlib server and the frontend is a static
Vite build, so both are easy to host on free tiers.

### 1. Backend (e.g. Render)

1. Push the repo to GitHub.
2. Create a **Render Web Service** pointing at the repo (Root directory: `backend`).
3. Build command: `true` (the server is pure Python stdlib, no packages to install —
   `requirements.txt` is intentionally empty so nothing fails to compile).
4. Start command: `python -m app.main` (it reads the `PORT` env var Render provides).
5. Done. You'll get a URL like `https://trusttrail-api.onrender.com`.

### 2. Frontend (e.g. Vercel)

1. Create a **Vercel** project pointing at the repo (Root directory: `frontend`).
   - Framework preset: **Vite** (build `npm run build`, output `dist`).
   - `vercel.json` is included so `/vendor/...`, `/report/...` routes work on refresh.
2. Add an environment variable:
   `VITE_API_URL = https://trusttrail-api.onrender.com`
3. Deploy. The app will be live at `https://trusttrail.vercel.app`.

### Notes

- The frontend reads the API URL from `VITE_API_URL` (falls back to `localhost:8000`).
- The backend allows any origin by default; set `CORS_ORIGIN` to lock it down.
- Reports are stored in memory, so they reset when the backend restarts. For a
  persistent demo, swap `store.reports` for a file/DB in a later iteration.

---

## Demo Flow

1. Open http://localhost:5173
2. Select a Jaipur location (e.g. Johari Bazaar)
3. Click **Monument Ticket Help** (CRITICAL risk)
4. View Risk Score + Reasons
5. Click **Report an Incident**
6. Submit: *"The guide demanded ₹1500 for a service that normally costs ₹500."*
7. See the risk score update live
8. Visit `/admin` to see the submitted report

## Risk Engine

```
risk = complaint_signal × 0.35
     + price_anomaly    × 0.25
     + location_risk    × 0.20
     + recent_reports   × 0.20

0–29   → LOW
30–59  → MEDIUM
60–79  → HIGH
80–100 → CRITICAL
```

## Project Structure

```
trusttrail/
├── frontend/          React + TypeScript + Vite + Tailwind
├── backend/           Python + FastAPI
│   └── app/
│       ├── main.py
│       ├── risk/engine.py    ← isolated scoring module
│       ├── routes/
│       └── schemas/
└── data/              JSON demo data (Jaipur)
```
