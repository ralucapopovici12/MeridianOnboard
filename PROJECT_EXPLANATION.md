# MeridianOnboard — Project Explanation

## What the app does

MeridianOnboard is a web app for managing the first-month onboarding experience of new employees at a fictional company called Meridian. It has three audiences:

- **New hire** — sees their personal checklist of tasks grouped by phase and can tick items off.
- **Any employee** — can browse the full people directory to find who does what.
- **HR person** — has a dashboard showing every current new hire and their progress at a glance.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core (.NET 10), Web API |
| Database | SQLite via Entity Framework Core |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Routing | react-router-dom v7 |

---

## Folder structure

```
MeridianOnboard/
├── backend/
│   ├── Controllers/          API endpoint handlers
│   ├── Data/                 DbContext + seeder
│   ├── Dtos/                 JSON response shapes
│   ├── Models/               Database entities
│   ├── Services/             Business logic
│   ├── Program.cs            App entry point
│   └── backend.csproj
└── frontend/
    ├── src/
    │   ├── api/              HTTP client + TypeScript types
    │   ├── components/       Shared UI pieces
    │   ├── context/          Global employee selection state
    │   ├── lib/              Utility hooks and helpers
    │   ├── pages/            The three pages
    │   ├── App.tsx           Router shell
    │   └── main.tsx          React mount point
    ├── vite.config.ts
    └── package.json
```

---

## Backend — step by step

### 1. Entry point — `Program.cs`

This is where the application starts. It runs through these steps in order:

1. Registers `AppDbContext` with SQLite, reading the connection string from `appsettings.json` (the file points to `backend/meridian.db`).
2. Registers a CORS policy named `DevCors` that allows the Vite dev server at `http://localhost:5173` to call the API — without this the browser would block all requests.
3. Registers all controllers so ASP.NET Core knows about the API endpoints.
4. Calls `db.Database.EnsureCreated()` — on first run this creates the SQLite file and all tables from the model automatically. No manual migration command is needed.
5. Calls `Seeder.Seed(db)` — fills the database with realistic demo data (only on first run; the seeder returns immediately if data already exists).
6. Applies the CORS middleware, maps the controller routes, and starts listening on `http://localhost:5000`.

---

### 2. Data model — `Models/`

There are three entities and one enum.

#### `Department.cs`
The simplest entity — just an `Id` and a `Name` (Engineering, Sales, Marketing, HR, Finance). Has a list of `Employee` navigation objects.

#### `Employee.cs`
The central entity. Every person at Meridian is an employee. Fields:
- `FirstName`, `LastName`, `Email`, `Role` — basic identity.
- `DepartmentId` / `Department` — which department they belong to.
- `StartDate` — the date they joined (or will join) Meridian.
- `IsHR` — marks the single HR person who owns the onboarding process.
- `CurrentProject` — a short free-text string answering "what are you working on right now?", used in the people directory.
- `Tasks` — navigation property to their onboarding checklist items. Only new hires have tasks; existing team members have none.

#### `OnboardingTask.cs`
One checkbox item in a new hire's checklist. Fields:
- `EmployeeId` / `Employee` — who this task belongs to.
- `Title` — the text of the task (e.g. "Activate your Meridian email account").
- `Phase` — which of the three phases this task belongs to.
- `OrderIndex` — position within its phase so tasks display in the intended order.
- `IsCompleted` / `CompletedAt` — whether the task is done and when it was completed.

#### `OnboardingPhase.cs` (enum)
The three phases a new hire moves through:
- `PreDay1` — paperwork before the first day
- `Week1` — first week activities
- `Weeks2to4` — deeper integration over the rest of the first month

The enum is stored as a readable string in the SQLite file (`"Week1"` not `1`) so the database is human-readable if you open it directly.

---

### 3. Database setup — `Data/AppDbContext.cs`

The EF Core `DbContext`. It exposes three `DbSet` properties (one per entity) and in `OnModelCreating` it configures constraints:
- Department names must be unique.
- Employee emails must be unique.
- Deleting a department that still has employees is blocked (`DeleteBehavior.Restrict`).
- Deleting an employee cascades and deletes all their tasks (`DeleteBehavior.Cascade`).

---

### 4. Seed data — `Data/Seeder.cs`

Runs once on first startup. Creates:

**5 departments:** Engineering, Sales, Marketing, HR, Finance.

**10 existing team members** spread across the departments — the people a new hire would look up in the directory to find who to ask about X. Examples: Marcus Johnson (Engineering Manager), Sarah Chen (People Operations Lead / the HR person), James Wilson (Sales Director).

**3 new hires** at deliberately different stages so the HR dashboard shows a meaningful spread:
- **Alex Rivera** — starts in 3 days, only completed 2 pre-day-1 tasks.
- **Maya Thompson** — started 1 week ago, finished all pre-day-1 tasks and some week-1 tasks.
- **Liam O'Brien** — started 2 weeks ago, well into the Weeks 2–4 phase.

All dates are calculated from `DateTime.Now` at seed time, so the demo always looks live no matter when the app is first run.

The 17-task checklist template is a static list of `(title, phase)` pairs. The `AddOnboardingTasks()` helper applies it to each new hire, marking the first N items of each phase as completed based on how far along they should be.

---

### 5. Business logic — `Services/OnboardingMetrics.cs`

A static class with pure functions. Takes tasks or dates as input, returns computed display values. No database access here.

- **`Progress(tasks)`** — counts completed vs total, returns `{ completed, total, percent }`.
- **`CurrentPhase(tasks)`** — finds the phase of the first incomplete task. This is the "current phase" shown on the HR dashboard.
- **`CurrentPhaseLabel(tasks)`** — same but returns the human label ("Week 1", "Weeks 2–4", or "Complete").
- **`DaysToStart(startDate)`** — how many calendar days until the start date. Positive = upcoming, 0 = today, negative = already started.
- **`Status(startDate)`** — turns the day count into a short status string: `"Starts in 3 days"`, `"Starts tomorrow"`, `"Day 4"`, `"Week 2"`, etc.

---

### 6. DTOs — `Dtos/Dtos.cs`

C# records that define the exact JSON shape the API sends to the frontend. They exist to keep the API contract stable and independent of the database model. Key ones:

- **`EmployeeDto`** — one person in the directory (includes `IsNewHire`, which is derived at query time by checking whether they have any tasks).
- **`TaskDto`** — one checklist item, with both the raw phase enum name and a human-readable label.
- **`PhaseGroupDto`** — a phase section: its label, tasks, and per-phase completion counts.
- **`EmployeeChecklistDto`** — everything to render the onboarding page: employee info, overall progress, and all phase groups.
- **`ProgressDto`** — just the numbers: `{ completed, total, percent }`.
- **`HrOverviewItemDto`** — one row in the HR dashboard: employee identity, status label, current phase, and progress.

---

### 7. API endpoints — `Controllers/`

Five endpoints across three controllers. All return JSON.

#### `GET /api/employees` — `EmployeesController`
Returns every person at Meridian ordered by department then name. `IsNewHire` is set to `true` for anyone who has at least one task (`e.Tasks.Any()`).

#### `GET /api/employees/{id}/tasks` — `EmployeesController`
Returns the full checklist for one employee. Loads the employee with their department and tasks, groups the tasks by phase in the defined order (`PreDay1 → Week1 → Weeks2to4`), and calls `OnboardingMetrics.Progress()` for the overall numbers. Returns a `EmployeeChecklistDto`.

#### `GET /api/employees/{id}/progress` — `EmployeesController`
Returns only the progress numbers for one employee. Used when a lighter call is sufficient.

#### `PATCH /api/tasks/{id}/toggle` — `TasksController`
Flips one task between done and not done. Loads the task, inverts `IsCompleted`, stamps `CompletedAt` with the current time when marking done, clears it when undoing, saves, and returns the updated `TaskDto`.

#### `GET /api/hr/overview` — `HrController`
Returns every new hire (anyone with tasks) ordered by start date. For each, calls `OnboardingMetrics` to compute status, current phase, and progress. Returns a list of `HrOverviewItemDto`.

---

## Frontend — step by step

### 1. Dev server proxy — `vite.config.ts`

Vite is configured to proxy any request starting with `/api` to `http://localhost:5000`. This means the frontend code just calls `/api/employees` without ever mentioning a backend URL or port. In production you would configure the web server to do the same.

---

### 2. TypeScript types — `src/api/types.ts`

Interfaces that mirror every DTO the backend returns: `Employee`, `Task`, `PhaseGroup`, `EmployeeChecklist`, `Progress`, `HrOverviewItem`. Every API response in the frontend is typed against these.

---

### 3. API client — `src/api/client.ts`

A thin wrapper around `fetch`. One internal `request<T>()` function handles the `/api` prefix, throws on non-2xx responses, and deserialises the JSON body. The exported `api` object exposes one named function per endpoint:

```
api.getEmployees()
api.getChecklist(employeeId)
api.getProgress(employeeId)
api.toggleTask(taskId)
api.getHrOverview()
```

---

### 4. App entry — `src/main.tsx` and `src/App.tsx`

`main.tsx` mounts the React app. It wraps everything in two providers:
- `BrowserRouter` — enables URL-based routing.
- `CurrentEmployeeProvider` — makes the global employee selection available everywhere.

`App.tsx` renders the `Header` and, inside a centred max-width container, the three page routes:
- `/` → `OnboardingPage`
- `/people` → `PeoplePage`
- `/hr` → `HrDashboardPage`

---

### 5. Global state — `src/context/CurrentEmployeeContext.tsx`

The app has one piece of shared state that every page needs: who is the currently selected employee (the "I am …" picker in the header).

On mount, this context fetches the full employee list once via `api.getEmployees()`. It stores the selected employee id in `localStorage` so the choice survives a page refresh. If nothing is stored (or the stored id no longer exists), it defaults to the first new hire in the list — so the demo always opens on a live onboarding checklist.

Any component can call `useCurrentEmployee()` to get:
- `employees` — the full list
- `current` — the currently selected `Employee` object
- `currentId` — just the id
- `setCurrentId(id)` — to change the selection (also updates localStorage)
- `loading` / `error` — while the employee list is fetching

---

### 6. Header — `src/components/Header.tsx`

Displayed on every page. Contains:
- The Meridian logo and wordmark on the left.
- Navigation links to the three pages (Onboarding / People / HR Dashboard). The active link is highlighted via react-router's `NavLink`.
- An "I am …" dropdown on the right that lists all employees. Changing it calls `setCurrentId()`, which updates the global context and localStorage instantly.

---

### 7. Onboarding page — `src/pages/OnboardingPage.tsx`

Route: `/`

What it does:
1. Reads `currentId` from context.
2. Fetches `api.getChecklist(currentId)` whenever the selected employee changes.
3. If the selected person has no tasks (not a new hire), shows a friendly message telling the user to pick a new hire from the dropdown.
4. Otherwise renders:
   - A welcome heading with the employee's name, role, department, and start date.
   - A `PhaseCarousel` — a horizontal strip showing the three phases with per-phase completion counts.
   - An overall progress card: percentage number and a `ProgressBar`.
   - Three task sections (one per phase), each with a clickable row per task.

**Optimistic task toggling:** When the user clicks a checkbox, the UI updates immediately (the task appears checked/unchecked instantly). The `PATCH /api/tasks/{id}/toggle` call happens in the background. If the API call fails, the state rolls back to what it was before. This makes the checklist feel instant even on a slow connection.

---

### 8. People page — `src/pages/PeoplePage.tsx`

Route: `/people`

Reads the employee list directly from context (it was already fetched). Provides a live search box — as the user types, the list is filtered in memory against each person's name, role, department, and current project. No API call needed.

Results are grouped by department alphabetically and displayed as a card grid. Each card shows:
- An avatar (coloured circle with initials).
- Name, role, current project.
- An email link.
- Badges for HR or New Hire status.

---

### 9. HR dashboard — `src/pages/HrDashboardPage.tsx`

Route: `/hr`

Fetches `api.getHrOverview()` on mount. Renders:
1. Three summary stat cards: how many people are currently onboarding, average progress across all of them, and how many have not yet started.
2. A table of new hire rows. Each row shows avatar, name, role, department, a status badge (e.g. "Starts in 3 days", "Day 4"), the current phase they are working through, a progress bar with numbers, and a "View checklist" button.

**"View checklist"** sets that employee as the current selection in context and navigates to `/`. The HR person can jump directly into any new hire's checklist from this one screen.

---

### 10. Shared components — `src/components/`

**`Avatar.tsx`** — a circle with the person's initials. The background colour is derived from the name (same person always gets the same colour) so avatars are visually distinct without storing any colour data.

**`ProgressBar.tsx`** — a thin horizontal bar that fills based on a `percent` prop (0–100).

**`PhaseCarousel.tsx`** — the three-phase summary strip at the top of the onboarding page. Shows each phase name, how many tasks are done out of total, and highlights the active phase.

---

### 11. Utilities — `src/lib/`

**`useAsync.ts`** — a custom hook that takes an async function, runs it when dependencies change, and returns `{ data, loading, error }`. Prevents state updates on unmounted components. Used by `HrDashboardPage` and `CurrentEmployeeContext`.

**`format.ts`** — formats ISO date strings (`yyyy-MM-dd`) into readable dates for display.

---

## Full request flow — example: toggling a task

```
User clicks a task checkbox on the Onboarding page
    │
    ▼
OnboardingPage.toggle(taskId) is called
    │
    ├─► recompute(checklist, taskId) updates local state immediately
    │       → task appears checked/unchecked instantly (optimistic update)
    │
    └─► api.toggleTask(taskId)
            │
            ▼
        fetch PATCH /api/tasks/{id}/toggle
            │
            ▼  (proxied by Vite to http://localhost:5000)
        TasksController.Toggle(id)
            │
            ├─ loads task from SQLite
            ├─ flips IsCompleted (true → false or false → true)
            ├─ sets CompletedAt = DateTime.Now  (or clears it)
            ├─ db.SaveChangesAsync()
            └─ returns TaskDto as JSON
            │
            ◄── response arrives
                │
                ├─ success → local state is already correct, nothing to do
                └─ failure → setChecklist(previous) restores the old state
```

---

## How to run

**Backend (terminal 1):**
```
cd backend
dotnet run
```
Starts on http://localhost:5000. On first run it creates `backend/meridian.db` and seeds it with all demo data automatically.

**Frontend (terminal 2):**
```
cd frontend
npm install
npm run dev
```
Starts on http://localhost:5173. Open this URL in the browser. All `/api` calls are forwarded to the backend by Vite.
