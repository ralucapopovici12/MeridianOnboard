# Assumptions

The brief is deliberately open-ended ("everything else about how the company operates
is up to you"). These are the assumptions I made and why.

## About the users

- **Primary users are new hires and the single HR person.** Managers and colleagues are
  secondary — they appear *in* the directory but don't have their own workflows yet.
- **A new hire opens the app knowing almost nothing.** No vocabulary about internal tools,
  no idea who anyone is. So the UI leads with concrete next actions ("Sign your contract",
  "Install Slack and join #general") rather than abstract information.
- **The HR person is time-poor and context-switching constantly** across 2–3 simultaneous
  hires. They need a single glance to know who's behind, so the HR Dashboard is a one-screen
  summary, sorted by start date, with progress and the current phase per person.
- I assumed users are **not technical** (except some engineers), so nothing requires
  understanding the data model — you just pick "who you are" and start.

## About the data

- **HR enters the structural data.** Departments, employees, and the onboarding checklist
  template are owned by HR. In this prototype that's represented by the seed data; in a
  real build HR would manage it through an admin screen (see WHAT_I_WOULD_DO_NEXT).
- **The new hire enters their own progress** by checking tasks off. The checklist itself is
  pre-populated so day one isn't "figure out what you should be doing."
- **Information is added before the hire starts.** The checklist and directory entry exist
  during the *Pre-Day 1* phase — that's the whole point of reducing first-week chaos.
- **If data is missing**, the app degrades gracefully rather than breaking: an employee with
  no checklist shows an empty-state message instead of an error; a missing current project
  simply isn't rendered; progress with zero tasks reads 0% rather than dividing by zero.
- I assumed the onboarding checklist is **broadly the same for everyone** at this stage.
  Role-specific tasks are a clear next step, not a v1 requirement.

## About the context

- **Device on day one:** likely a personal laptop or phone — the company laptop may not have
  arrived yet. So the UI is responsive and works fine on a smaller screen / mobile browser.
- **Access before the first working day:** **yes, intentionally.** The most valuable moment
  for this app is the few days *before* you start — when you'd otherwise have nothing but
  "Welcome! See you on Monday." The seeded "you" (Alex Rivera) starts in three days and is
  already in the Pre-Day 1 phase.
- I assumed **Slack and Google Meet are the only comms tools** (per the brief), so onboarding
  tasks reference those by name and the app doesn't try to replace them — it points to them.
- No assumption of an existing identity provider, so authentication is treated as optional
  (see DECISIONS.md).
