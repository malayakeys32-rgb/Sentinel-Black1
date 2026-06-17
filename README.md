# SENTINEL·BLACK — Render Deployment Guide

Unified Case & Operations Platform. Two services: Express backend + Vite/React frontend.

---

## Project Structure

```
sentinel-black/
├── render.yaml          ← Render Blueprint (deploy both services at once)
├── backend/
│   ├── index.js         ← Express API server
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx      ← Full React UI
    │   └── api.js       ← API client
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## Quick Deploy to Render (Blueprint)

1. Push this folder to a GitHub/GitLab repo.
2. In Render Dashboard → **New** → **Blueprint**.
3. Connect your repo. Render reads `render.yaml` and creates both services.
4. After the **backend** deploys, copy its URL (e.g. `https://sentinel-black-backend.onrender.com`).
5. In the **frontend** service settings → Environment → set `VITE_API_URL` to that URL.
6. Trigger a redeploy of the frontend. Done.

---

## Manual Deploy (Two Services)

### Backend

1. Render → **New Web Service** → connect repo → set **Root Directory** to `backend`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add environment variables:
   - `JWT_SECRET` — any long random string (use "Generate" in Render)
   - `NODE_ENV` — `production`
5. Deploy.

### Frontend

1. Render → **New Static Site** → connect same repo → set **Root Directory** to `frontend`.
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Add environment variable:
   - `VITE_API_URL` — your backend URL from step above
5. Add a rewrite rule: `/*` → `/index.html` (for SPA routing).
6. Deploy.

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
npm install
cp .env.example .env   # edit JWT_SECRET
npm run dev            # runs on :4000

# Terminal 2 — Frontend
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:4000
npm run dev            # runs on :5173
```

The Vite dev server proxies `/api/*` → `localhost:4000` automatically.

---

## Demo Credentials

| Email                      | Password     | Role     |
|---------------------------|--------------|----------|
| mercer@sentinel.black     | director001  | DIRECTOR |
| chen@sentinel.black       | analyst002   | ANALYST  |
| vance@sentinel.black      | operator003  | OPERATOR |

---

## API Endpoints

| Method | Path                            | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| POST   | /auth/login                     | —    | Login, returns JWT       |
| POST   | /auth/logout                    | ✓    | Logout                   |
| GET    | /users/me                       | ✓    | Current user             |
| GET    | /cases                          | ✓    | List all cases           |
| POST   | /cases                          | ✓    | Create case              |
| GET    | /cases/:id                      | ✓    | Get case + linked ops    |
| PATCH  | /cases/:id                      | ✓    | Update case              |
| POST   | /cases/:id/link-operation       | ✓    | Link case to operation   |
| GET    | /operations                     | ✓    | List all operations      |
| POST   | /operations                     | ✓    | Create operation         |
| GET    | /operations/:id                 | ✓    | Get op + linked cases    |
| PATCH  | /operations/:id                 | ✓    | Update operation         |
| GET    | /evidence                       | ✓    | List evidence            |
| POST   | /evidence                       | ✓    | Add evidence             |
| GET    | /timeline                       | ✓    | Unified event feed       |
| GET    | /audit                          | ✓    | Audit log                |
| GET    | /health                         | —    | Health check             |

---

## Production Notes

- **Database**: The backend uses in-memory storage. Data resets on restart.
  To persist data, swap `db.*` arrays with a PostgreSQL/MongoDB adapter.
  Render provides managed Postgres — add a `databases:` block to `render.yaml`.
- **JWT Secret**: Always use a strong random secret in production. Never commit `.env`.
- **CORS**: Currently allows all origins. Lock down `cors()` options before going live.
