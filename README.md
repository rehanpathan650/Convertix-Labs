# Convertix Labs — Full-Stack

React (Vite) · Express · Neon Postgres · Docker

```
client/   React app: landing, quiz funnel, login, invite signup, dashboards
server/   Express API (auth, leads, admin) — auto-creates DB tables on start
docker-compose.yml
.env.example
```

## How it works
1. A visitor answers the quiz → saved as a **lead** (status `new`) immediately, so you can prepare for the call.
2. You open the **admin dashboard**, call them, set status to *Call done*, add notes.
3. Click **Create client invite** → copy the link → send it. The client opens it, sets a password, and gets the **client portal** (project stage + their answers).
4. Update the **Project stage** (Review → Map → Build → Run); the client sees it live.

There is no public signup: only invited clients (after a successful call) can create accounts.
The admin account is created automatically from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Setup
1. Create a project on **neon.tech** and copy the connection string.
2. `cp .env.example .env` and fill in `DATABASE_URL`, `JWT_SECRET` (long random), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

### Run locally (no Docker)
```bash
cd server && npm install && npm run dev      # terminal 1 → API on :5000
cd client && npm install && npm run dev      # terminal 2 → http://localhost:5173
```
Log in at `/login` with your admin email/password.

### Run with Docker
```bash
docker compose up --build                    # → http://localhost:8080
```
For HTTP-only local Docker set `COOKIE_SECURE=false` in `.env`; on a real domain with HTTPS leave it `true` and set `CLIENT_URL=https://yourdomain.com`.

## API
| Method | Route | Who |
|---|---|---|
| POST | `/api/leads` | public (rate-limited) |
| POST | `/api/auth/login` · `/logout` · GET `/me` | anyone / session |
| GET | `/api/auth/invite/:token` · POST `/api/auth/signup` | invited client |
| GET | `/api/me/project` | client |
| GET | `/api/admin/leads` · PATCH `/api/admin/leads/:id` · POST `/api/admin/leads/:id/invite` | admin |

## Security notes
bcrypt passwords · httpOnly SameSite cookie (JWT, 7 days) · hashed one-time invite tokens (7-day expiry) · rate limits on leads/login/signup · zod validation · Helmet.
