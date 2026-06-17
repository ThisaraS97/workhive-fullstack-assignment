# WorkHive — Full-Stack Job Board

WorkHive is a job board where **job seekers** browse and apply, **employers** post jobs and manage applicants, and **admins** moderate the platform.

Built with **Next.js 15+**, **Node.js/Express**, **PostgreSQL/Prisma**, **Docker**, **ngrok**, and **Vercel**.

## Architecture

```
Browser → Vercel (Next.js SSR/CSR + Server Actions + NextAuth + Redux)
              ↓ NEXT_PUBLIC_API_URL
         ngrok tunnel → Express API (Docker) → PostgreSQL
                              ↓ worker_threads
                    Email confirmation + PDF resume parsing
```

## Tech stack (and why)

| Technology | Role |
|---|---|
| Next.js SSR (`/`, `/jobs/[id]`) | SEO-friendly job listings rendered at request time |
| Next.js CSR + `useEffect` | User-specific dashboards (not publicly cached) |
| Server Actions | Secure form writes without exposing API keys |
| Redux Toolkit | Client auth/filter/UI state (`authSlice`, `jobSlice`, `uiSlice`) |
| NextAuth.js (JWT) | Session management + route protection |
| Express + Repository pattern | Versioned REST API under `/api/v1/` |
| Prisma + PostgreSQL | Typed data layer with migrations & seed |
| Worker threads | Non-blocking email + resume parsing |
| Docker Compose | One-command backend + DB startup |
| ngrok | Tunnel local API to Vercel-deployed frontend |
| Vercel | Public frontend hosting |

## Prerequisites

- Node.js 20+
- Docker Desktop
- ngrok account ([ngrok.com](https://ngrok.com))
- Vercel account ([vercel.com](https://vercel.com))

## Setup (10 steps)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd workhive
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start backend + database**
   ```bash
   docker compose up -d --build
   ```

4. **Verify API health**
   ```bash
   curl http://localhost:5000/health
   ```

5. **Install frontend dependencies**
   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   ```

6. **Run frontend locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

7. **Start ngrok tunnel**
   ```bash
   ngrok http 5000
   ```
   Copy the HTTPS forwarding URL (e.g. `https://abc123.ngrok-free.app`).

8. **Update CORS** — add your ngrok URL to `CORS_ORIGIN` in root `.env`, then restart backend:
   ```bash
   docker compose restart backend
   ```

9. **Deploy frontend to Vercel**
   - Import the `frontend` folder as a project
   - Set environment variables:
     - `NEXT_PUBLIC_API_URL` = your ngrok HTTPS URL
     - `NEXTAUTH_URL` = your Vercel deployment URL
     - `NEXTAUTH_SECRET` = a long random string
   - Deploy

10. **Test end-to-end** — browse jobs on Vercel, login, apply, and confirm backend logs show worker activity.

## Seed credentials

All seeded users use password: `Password123!`

| Role | Email |
|---|---|
| Admin | admin@workhive.local |
| Employer | alice@techcorp.io |
| Seeker | seeker1@example.com |

## API documentation

Import `backend/postman/WorkHive.postman_collection.json` into Postman.

All routes are under `/api/v1/` with consistent error shape:
```json
{ "success": false, "error": { "code": "JOB_NOT_FOUND", "message": "..." } }
```

## Demo video checklist (40–60 min)

Your submission email requires a **40–60 minute** public demo video covering:

1. Assumptions & clarifications (2–3 min)
2. Architecture & design decisions (8–10 min)
3. Live walkthrough — all roles (15–20 min)
4. Technical deep dive — SSR vs CSR, Server Actions, workers, Prisma layers (10–12 min)
5. Docker + ngrok + Vercel deployment (5–8 min)
6. Challenges & solutions (3–5 min)

## Project structure

```
workhive/
├── backend/          # Express API, Prisma, workers
├── frontend/         # Next.js app
├── docker-compose.yml
├── .env.example
└── README.md
```

## License

MIT — created for the WorkHive technical assessment.
