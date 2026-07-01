using backend.Models;

namespace backend.Data;

/// <summary>
/// Seeds the database with a realistic snapshot of Meridian on first run:
/// 5 departments, a directory of employees (one of whom is the single HR person),
/// and onboarding checklists for the new hires currently going through their first month.
///
/// Dates are anchored to "today" so the HR dashboard always shows a hire starting
/// in a few days and others partway through onboarding, no matter when the app is run.
/// </summary>
public static class Seeder
{
    /// <summary>Shared demo password for every seeded account (surfaced on the login screen).</summary>
    public const string DemoPassword = "meridian2026";

    public static void Seed(AppDbContext db)
    {
        if (db.Departments.Any())
            return; // already seeded

        var engineering = new Department { Name = "Engineering" };
        var sales = new Department { Name = "Sales" };
        var marketing = new Department { Name = "Marketing" };
        var hr = new Department { Name = "HR" };
        var finance = new Department { Name = "Finance" };
        db.Departments.AddRange(engineering, sales, marketing, hr, finance);

        var today = DateOnly.FromDateTime(DateTime.Now);

        // --- Existing team: the people a new hire needs to be able to find ("who do I ask about X?") ---
        var ana = new Employee
        {
            FirstName = "Ana", LastName = "Popescu", Email = "ana.popescu@meridian.com",
            Role = "People Operations Lead", Department = hr, IsHR = true,
            StartDate = today.AddYears(-4), CurrentProject = "Onboarding revamp",
            OfficeDays = "1,2,3",
        };
        var existing = new List<Employee>
        {
            ana,
            new() { FirstName = "Mihai", LastName = "Ionescu", Email = "mihai.ionescu@meridian.com",
                Role = "Engineering Manager", Department = engineering,
                StartDate = today.AddYears(-5), CurrentProject = "Platform reliability",
                OfficeDays = "1,2,4" },
            new() { FirstName = "Elena", LastName = "Dumitrescu", Email = "elena.dumitrescu@meridian.com",
                Role = "Senior Backend Engineer", Department = engineering,
                StartDate = today.AddYears(-3), CurrentProject = "Payments API",
                OfficeDays = "2,3,4" },
            new() { FirstName = "Andrei", LastName = "Popa", Email = "andrei.popa@meridian.com",
                Role = "Frontend Engineer", Department = engineering,
                StartDate = today.AddYears(-2), CurrentProject = "Customer portal redesign",
                OfficeDays = "1,3,5" },
            new() { FirstName = "Cristina", LastName = "Munteanu", Email = "cristina.munteanu@meridian.com",
                Role = "DevOps Engineer", Department = engineering,
                StartDate = today.AddYears(-2), CurrentProject = "CI/CD migration",
                OfficeDays = "1,2,5" },
            new() { FirstName = "Radu", LastName = "Constantin", Email = "radu.constantin@meridian.com",
                Role = "Sales Director", Department = sales,
                StartDate = today.AddYears(-6), CurrentProject = "Enterprise pipeline",
                OfficeDays = "2,3,4" },
            new() { FirstName = "Maria", LastName = "Stoica", Email = "maria.stoica@meridian.com",
                Role = "Account Executive", Department = sales,
                StartDate = today.AddYears(-1), CurrentProject = "EMEA accounts",
                OfficeDays = "1,3,4" },
            new() { FirstName = "Vlad", LastName = "Georgescu", Email = "vlad.georgescu@meridian.com",
                Role = "Marketing Lead", Department = marketing,
                StartDate = today.AddYears(-3), CurrentProject = "Q3 product launch",
                OfficeDays = "2,3,5" },
            new() { FirstName = "Alexandra", LastName = "Marin", Email = "alexandra.marin@meridian.com",
                Role = "Content Strategist", Department = marketing,
                StartDate = today.AddYears(-1), CurrentProject = "Brand refresh",
                OfficeDays = "1,2,3" },
            new() { FirstName = "George", LastName = "Florea", Email = "george.florea@meridian.com",
                Role = "Finance Manager", Department = finance,
                StartDate = today.AddYears(-4), CurrentProject = "Annual budget planning",
                OfficeDays = "2,4,5" },
        };
        db.Employees.AddRange(existing);

        // --- New hires currently onboarding (these show up on the HR dashboard) ---
        // Bogdan is "you": the newest hire, first day still a few days out.
        var bogdan = new Employee
        {
            FirstName = "Bogdan", LastName = "Stefanescu", Email = "bogdan.stefanescu@meridian.com",
            Role = "Junior Backend Engineer", Department = engineering,
            StartDate = today.AddDays(3), CurrentProject = null,
        };
        var ioana = new Employee
        {
            FirstName = "Ioana", LastName = "Marinescu", Email = "ioana.marinescu@meridian.com",
            Role = "Marketing Associate", Department = marketing,
            StartDate = today.AddDays(-7), CurrentProject = null,
            OfficeDays = "1,2,3",
        };
        var stefan = new Employee
        {
            FirstName = "Stefan", LastName = "Dinu", Email = "stefan.dinu@meridian.com",
            Role = "Sales Development Representative", Department = sales,
            StartDate = today.AddDays(-14), CurrentProject = null,
            OfficeDays = "1,3,5",
        };
        db.Employees.AddRange(bogdan, ioana, stefan);

        // Onboarding progress reflects how far each person is into their first month.
        AddOnboardingTasks(db, bogdan, preDone: 2, weekDone: 0, monthDone: 0, completedAround: DateTime.Now.AddDays(-1));
        AddOnboardingTasks(db, ioana, preDone: 5, weekDone: 5, monthDone: 0, completedAround: DateTime.Now.AddDays(-5));
        AddOnboardingTasks(db, stefan, preDone: 5, weekDone: 7, monthDone: 2, completedAround: DateTime.Now.AddDays(-10));

        // Personal task boards — real work tickets the new hires move across the columns.
        AddBoardTasks(db, bogdan, new[]
        {
            ("Clone the main repository and build it locally", BoardStatus.Done, BoardPriority.Medium, "setup"),
            ("Configure your IDE, formatter and linting", BoardStatus.Done, BoardPriority.Low, "setup"),
            ("Set up your local dev environment", BoardStatus.InProgress, BoardPriority.Urgent, "setup"),
            ("Read the Payments API codebase walkthrough", BoardStatus.InProgress, BoardPriority.Medium, "docs"),
            ("Fix the flaky unit test in the billing module", BoardStatus.InReview, BoardPriority.High, "backend"),
            ("Pick up your first \"good first issue\" ticket", BoardStatus.Todo, BoardPriority.Medium, "backend"),
            ("Shadow Elena on a code review", BoardStatus.Todo, BoardPriority.Low, "mentorship"),
            ("Write down the setup gotchas you ran into", BoardStatus.Backlog, BoardPriority.Low, "docs"),
        });
        AddBoardTasks(db, ioana, new[]
        {
            ("Get access to the CMS and analytics", BoardStatus.Done, BoardPriority.High, "access"),
            ("Review the brand voice guidelines", BoardStatus.Done, BoardPriority.Medium, "brand"),
            ("Audit current blog tags and categories", BoardStatus.InProgress, BoardPriority.Medium, "content"),
            ("Proof the product launch landing page copy", BoardStatus.InReview, BoardPriority.Medium, "content"),
            ("Draft the Q3 newsletter outline", BoardStatus.Todo, BoardPriority.High, "content"),
            ("Schedule the launch-week social posts", BoardStatus.Backlog, BoardPriority.Low, "social"),
        });
        AddBoardTasks(db, stefan, new[]
        {
            ("Set up your sales email signature", BoardStatus.Done, BoardPriority.Low, "setup"),
            ("Shadow 3 discovery calls", BoardStatus.Done, BoardPriority.Medium, "training"),
            ("Complete the CRM training module", BoardStatus.InProgress, BoardPriority.High, "training"),
            ("Review the qualified leads with Maria", BoardStatus.InReview, BoardPriority.Medium, "sales"),
            ("Build a prospect list for EMEA accounts", BoardStatus.Todo, BoardPriority.High, "sales"),
            ("Draft your first outbound email sequence", BoardStatus.Backlog, BoardPriority.Medium, "sales"),
        });

        // Time-clock history for those who have already started (Bogdan starts in a few days).
        AddTimeHistory(db, ioana, today, daysBack: 7);
        AddTimeHistory(db, stefan, today, daysBack: 7);

        // Everyone shares the same demo password (shown on the login screen).
        foreach (var employee in db.Employees.Local)
            employee.PasswordHash = Services.PasswordHasher.Hash(DemoPassword);

        db.SaveChanges();
    }

    /// <summary>Seeds a personal board, appending tasks in order within each column.</summary>
    private static void AddBoardTasks(
        AppDbContext db, Employee employee,
        (string Title, BoardStatus Status, BoardPriority Priority, string Tag)[] tasks)
    {
        var orderByStatus = new Dictionary<BoardStatus, int>();
        foreach (var (title, status, priority, tag) in tasks)
        {
            var order = orderByStatus.TryGetValue(status, out var v) ? v : 0;
            orderByStatus[status] = order + 1;

            db.BoardTasks.Add(new BoardTask
            {
                Employee = employee,
                Title = title,
                Status = status,
                Priority = priority,
                Tag = tag,
                OrderIndex = order,
            });
        }
    }

    /// <summary>
    /// Seeds completed time-clock sessions for the past few weekdays, with each day's
    /// Office/Remote location taken from the employee's hybrid schedule.
    /// Today is left open so a live clock-in can be demoed.
    /// </summary>
    private static void AddTimeHistory(AppDbContext db, Employee employee, DateOnly today, int daysBack)
    {
        for (var back = daysBack; back >= 1; back--)
        {
            var date = today.AddDays(-back);
            if (date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
                continue;

            var clockIn = date.ToDateTime(new TimeOnly(9, 0)).AddMinutes(Random.Shared.Next(-8, 18));
            var clockOut = date.ToDateTime(new TimeOnly(17, 30)).AddMinutes(Random.Shared.Next(-20, 25));

            db.TimeEntries.Add(new TimeEntry
            {
                Employee = employee,
                Date = date,
                ClockIn = clockIn,
                ClockOut = clockOut,
                Location = Services.WorkSchedule.LocationFor(employee.OfficeDays, date),
            });
        }
    }

    /// <summary>The standard Meridian onboarding checklist, by phase.</summary>
    private static readonly (string Title, OnboardingPhase Phase)[] Template =
    {
        ("Sign and return your employment contract", OnboardingPhase.PreDay1),
        ("Complete payroll tax and banking forms", OnboardingPhase.PreDay1),
        ("Send your address for laptop and equipment delivery", OnboardingPhase.PreDay1),
        ("Activate your Meridian email account", OnboardingPhase.PreDay1),
        ("Read the \"Welcome to Meridian\" handbook", OnboardingPhase.PreDay1),

        ("Install Slack and join #general, #random, and your team channel", OnboardingPhase.Week1),
        ("Set up Google Meet and accept your intro-meeting invites", OnboardingPhase.Week1),
        ("Have your first 1:1 with your manager", OnboardingPhase.Week1),
        ("Meet your assigned onboarding buddy", OnboardingPhase.Week1),
        ("Pick up your office access badge for in-office days", OnboardingPhase.Week1),
        ("Complete IT security and data-privacy training", OnboardingPhase.Week1),
        ("Review the hybrid schedule (3 days office / 2 remote)", OnboardingPhase.Week1),

        ("Complete your role-specific training path", OnboardingPhase.Weeks2to4),
        ("Ship your first small task or contribution", OnboardingPhase.Weeks2to4),
        ("Meet key people in the teams you'll work with", OnboardingPhase.Weeks2to4),
        ("Book your 30-day check-in with HR", OnboardingPhase.Weeks2to4),
        ("Set your first-quarter goals with your manager", OnboardingPhase.Weeks2to4),
    };

    /// <summary>
    /// Creates the checklist for one new hire, marking the first N tasks of each phase
    /// as completed so progress reflects how far along they are.
    /// </summary>
    private static void AddOnboardingTasks(
        AppDbContext db, Employee employee,
        int preDone, int weekDone, int monthDone, DateTime completedAround)
    {
        var doneByPhase = new Dictionary<OnboardingPhase, int>
        {
            [OnboardingPhase.PreDay1] = preDone,
            [OnboardingPhase.Week1] = weekDone,
            [OnboardingPhase.Weeks2to4] = monthDone,
        };
        var orderByPhase = new Dictionary<OnboardingPhase, int>
        {
            [OnboardingPhase.PreDay1] = 0,
            [OnboardingPhase.Week1] = 0,
            [OnboardingPhase.Weeks2to4] = 0,
        };

        foreach (var (title, phase) in Template)
        {
            var order = orderByPhase[phase]++;
            var isCompleted = order < doneByPhase[phase];

            db.OnboardingTasks.Add(new OnboardingTask
            {
                Employee = employee,
                Title = title,
                Phase = phase,
                OrderIndex = order,
                IsCompleted = isCompleted,
                CompletedAt = isCompleted ? completedAround.AddHours(order) : null,
            });
        }
    }
}
