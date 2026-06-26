# Decisions

> The brief states that *how you deal with ambiguity* is what's being evaluated.
> The core decision was therefore **what to leave out**. Three things built well beat
> ten things half-finished — especially against a short window and a 3-minute demo.

## Product decisions

### What I built (and why these three)

I mapped the brief's pain points to features and kept only the highest-leverage ones:

| Pain in the brief                          | Feature                |
| ------------------------------------------ | ---------------------- |
| "You don't know how things work"           | **Onboarding Checklist** |
| "You don't know anyone"                    | **People Directory**     |
| "HR consists of a single person", 2–3/month | **HR Dashboard**         |

- The **Checklist** is the core — it directly answers "what do I do?" and structures the
  first month into Pre-Day 1 / Week 1 / Weeks 2–4 so it never feels like one giant list.
- The **Directory** solves the "I don't know anyone" pain with the framing *who do I ask
  about X?* — role + team + current project, searchable.
- The **HR Dashboard** is the business differentiator: it's what makes one HR person able
  to scale to 200 people and a steady trickle of new hires.

### How I prioritised

Highest leverage for the new hire **and** for HR, achievable end-to-end (DB → API → UI)
within the window. The demo order mirrors the priority: new-hire checklist → directory →
HR overview, ending on the bottleneck the company actually has.

### What I intentionally left out of scope

Listed here, and expanded in [WHAT_I_WOULD_DO_NEXT.md](./WHAT_I_WOULD_DO_NEXT.md):

- **Knowledge Hub / FAQ** — valuable, but the checklist covers the urgent "what do I do" need first.
- **Hybrid schedule view** ("who's in office today") — nice, but secondary to knowing *who people are*.
- **Real authentication / SSO** — replaced by an "I am …" switcher (see UX decisions).
- **Real Slack / Google Workspace integration** — the app *points to* those tools; integrating
  them is a large surface for little first-pass demo value.
- **Admin CRUD, file uploads, notifications, email** — onboarding-content management is the
  natural next build, but the seeded data proves the flow without it.

## Technical decisions

### Database structure

Three tables — `Departments`, `Employees`, `OnboardingTasks` — is the minimum that models
the domain honestly:

- An employee belongs to one department; tasks belong to one employee. A new hire is simply
  an employee who has onboarding tasks, so the HR Dashboard is a single query, not a separate
  concept to maintain.
- `Phase` is an enum persisted as a readable string ("Week1") so the DB is inspectable.
- `OrderIndex` keeps the checklist in the intended reading order within each phase;
  `CompletedAt` is stamped on toggle so progress could later become a timeline.

### Libraries / frameworks

- **ASP.NET Core + EF Core + SQLite** — matches the recommended .NET stack and SQLite is
  zero-config: no database server to install, the file is created and **seeded on startup**,
  so an evaluator is running with real data the moment they clone and `dotnet run`.
- **React + TypeScript + Vite + Tailwind** — fast dev loop, typed end-to-end against the API,
  and utility CSS to build a clean, responsive UI quickly.

### Decisions I changed during development (documented, per the brief)

- **.NET 10 instead of the .NET 8 I originally planned.** The machine had the .NET 10 SDK,
  which is the current LTS. Targeting the installed SDK means the app actually runs locally
  without a runtime mismatch. Functionally identical for this project.
- **`EnsureCreated` + a startup seeder instead of EF migrations.** Migrations add a toolchain
  step (`dotnet-ef`, migration files) that buys nothing here — there's no production database
  to evolve. `EnsureCreated` keeps "clone and run" to a single command. The trade-off (no
  incremental schema migration) is acceptable for a prototype and would be revisited for prod.

### If I had more time (technical)

- Schema migrations + an `IsActive`/archival concept rather than deleting rows.
- A small service/repository layer and automated tests (xUnit for the API, a couple of
  component tests on the frontend).
- Server-driven onboarding *templates* per role/department instead of one shared checklist.

## UX decisions

- **"I am …" switcher instead of login.** Auth is optional in the brief and real auth would
  add cost without demonstrating anything about onboarding. The switcher makes the demo
  stronger: in seconds you can view the app as the brand-new hire, then as HR — exactly the
  two perspectives that matter. It's documented here as a deliberate scope choice, not an
  oversight.
- **Phase-based checklist** rather than a flat to-do list, because "first month" is genuinely
  phased — some things happen before day one, others in week one. The phase overview cards
  give an at-a-glance "where am I."
- **Optimistic toggling** so checking a task feels instant; it reverts if the API call fails.
- **Default to the newest hire** on load so the app opens on a live, in-progress checklist
  rather than an empty state.
- **Did I test it with anyone?** Not formally — the window didn't allow a real user test.
  I "dogfooded" it against the brief's own framing (would *this* have helped me on my first
  day?) and used that to cut scope. A real onboarding test with the next actual hire is the
  first thing I'd do next.
