# Meridian Onboarding

> The app I wish I'd had on my first day at Meridian — built to make a new hire's
> first month less chaotic, and to scale Meridian's single HR person.

Meridian hires 2–3 people a month, runs hybrid (3 office / 2 remote), and has exactly
**one** person in HR. A new hire shows up knowing no one and unsure how anything works.
This app focuses on the three things that move the needle most in that first month.

## The three pillars

1. **Onboarding Checklist** — your tasks for the first month, grouped into
   *Pre-Day 1 → Week 1 → Weeks 2–4*, with a live progress bar. Check things off as you go.
2. **People Directory** — who does what, in which team, on which project. Answers the
   real first-week question: *"who do I ask about X?"*
3. **HR Dashboard** — one screen showing every current new hire and how far through
   onboarding they are. The differentiator for a one-person HR team.

A lightweight **"I am …" switcher** in the header lets you view the app as any
employee — no login required (see [DECISIONS.md](./DECISIONS.md)).

## Tech stack

| Layer    | Choice                                                            |
| -------- | ----------------------------------------------------------------- |
| Backend  | ASP.NET Core Web API (.NET 10), Entity Framework Core             |
| Database | SQLite — zero-config, file-based, created & seeded on startup     |
| Frontend | React 19 + TypeScript + Vite, Tailwind CSS v4, React Router       |

## Prerequisites

- **.NET SDK 10** (`dotnet --version`) — the backend targets `net10.0`
- **Node.js 18+** (`node --version`) and npm

## Run it locally

The app needs two processes: the API and the web frontend. Open two terminals.

**Terminal 1 — backend (API on http://localhost:5000):**

```bash
cd backend
dotnet run
```

On first start it creates `meridian.db` (SQLite) and seeds it with departments,
the employee directory, and onboarding checklists — so the app is alive immediately.

**Terminal 2 — frontend (UI on http://localhost:5173):**

```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173**. The Vite dev server proxies `/api/*` to the
backend, so no extra configuration is needed.

> Reset the data anytime by stopping the API and deleting `backend/meridian.db*`;
> it will be recreated and reseeded on the next `dotnet run`.

## API

| Method | Route                          | Purpose                              |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/api/employees`               | People directory                     |
| GET    | `/api/employees/{id}/tasks`    | A new hire's checklist, by phase     |
| GET    | `/api/employees/{id}/progress` | Completion percentage                |
| PATCH  | `/api/tasks/{id}/toggle`       | Toggle a task done / not done        |
| GET    | `/api/hr/overview`             | All new hires + progress (HR screen) |

## Project structure

```
MeridianOnboard/
├── backend/                # ASP.NET Core Web API
│   ├── Models/             # Department, Employee, OnboardingTask, OnboardingPhase
│   ├── Data/               # AppDbContext + Seeder
│   ├── Dtos/               # API response shapes
│   ├── Services/           # OnboardingMetrics (progress / phase / status)
│   ├── Controllers/        # Employees, Tasks, Hr
│   └── Program.cs          # DI, SQLite, CORS, startup seed
├── frontend/               # React + Vite + TS
│   └── src/
│       ├── api/            # typed client + types
│       ├── components/     # Header, Avatar, ProgressBar, PhaseCarousel
│       ├── context/        # current-employee ("I am …") state
│       ├── pages/          # Onboarding, People, HrDashboard
│       └── lib/            # helpers + useAsync hook
├── ASSUMPTIONS.md
├── DECISIONS.md
├── WHAT_I_WOULD_DO_NEXT.md
└── REFLECTION.md
```

## Reading the thinking behind it

- [ASSUMPTIONS.md](./ASSUMPTIONS.md) — who this is for and what I assumed
- [DECISIONS.md](./DECISIONS.md) — what I built, what I deliberately left out, and why
- [WHAT_I_WOULD_DO_NEXT.md](./WHAT_I_WOULD_DO_NEXT.md) — the next two weeks
- [REFLECTION.md](./REFLECTION.md) — what was hard and what I'd change
