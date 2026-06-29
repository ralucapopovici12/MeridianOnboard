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
        var sarah = new Employee
        {
            FirstName = "Sarah", LastName = "Chen", Email = "sarah.chen@meridian.com",
            Role = "People Operations Lead", Department = hr, IsHR = true,
            StartDate = today.AddYears(-4), CurrentProject = "Onboarding revamp",
            OfficeDays = "1,2,3",
        };
        var existing = new List<Employee>
        {
            sarah,
            new() { FirstName = "Marcus", LastName = "Johnson", Email = "marcus.johnson@meridian.com",
                Role = "Engineering Manager", Department = engineering,
                StartDate = today.AddYears(-5), CurrentProject = "Platform reliability",
                OfficeDays = "1,2,4" },
            new() { FirstName = "Priya", LastName = "Patel", Email = "priya.patel@meridian.com",
                Role = "Senior Backend Engineer", Department = engineering,
                StartDate = today.AddYears(-3), CurrentProject = "Payments API",
                OfficeDays = "2,3,4" },
            new() { FirstName = "David", LastName = "Kim", Email = "david.kim@meridian.com",
                Role = "Frontend Engineer", Department = engineering,
                StartDate = today.AddYears(-2), CurrentProject = "Customer portal redesign",
                OfficeDays = "1,3,5" },
            new() { FirstName = "Elena", LastName = "Rossi", Email = "elena.rossi@meridian.com",
                Role = "DevOps Engineer", Department = engineering,
                StartDate = today.AddYears(-2), CurrentProject = "CI/CD migration",
                OfficeDays = "1,2,5" },
            new() { FirstName = "James", LastName = "Wilson", Email = "james.wilson@meridian.com",
                Role = "Sales Director", Department = sales,
                StartDate = today.AddYears(-6), CurrentProject = "Enterprise pipeline",
                OfficeDays = "2,3,4" },
            new() { FirstName = "Olivia", LastName = "Martinez", Email = "olivia.martinez@meridian.com",
                Role = "Account Executive", Department = sales,
                StartDate = today.AddYears(-1), CurrentProject = "EMEA accounts",
                OfficeDays = "1,3,4" },
            new() { FirstName = "Tom", LastName = "Anderson", Email = "tom.anderson@meridian.com",
                Role = "Marketing Lead", Department = marketing,
                StartDate = today.AddYears(-3), CurrentProject = "Q3 product launch",
                OfficeDays = "2,3,5" },
            new() { FirstName = "Nina", LastName = "Schmidt", Email = "nina.schmidt@meridian.com",
                Role = "Content Strategist", Department = marketing,
                StartDate = today.AddYears(-1), CurrentProject = "Brand refresh",
                OfficeDays = "1,2,3" },
            new() { FirstName = "Robert", LastName = "Brown", Email = "robert.brown@meridian.com",
                Role = "Finance Manager", Department = finance,
                StartDate = today.AddYears(-4), CurrentProject = "Annual budget planning",
                OfficeDays = "2,4,5" },
        };
        db.Employees.AddRange(existing);

        // --- New hires currently onboarding (these show up on the HR dashboard) ---
        // Alex is "you": the newest hire, first day still a few days out.
        var alex = new Employee
        {
            FirstName = "Alex", LastName = "Rivera", Email = "alex.rivera@meridian.com",
            Role = "Junior Backend Engineer", Department = engineering,
            StartDate = today.AddDays(3), CurrentProject = null,
        };
        var maya = new Employee
        {
            FirstName = "Maya", LastName = "Thompson", Email = "maya.thompson@meridian.com",
            Role = "Marketing Associate", Department = marketing,
            StartDate = today.AddDays(-7), CurrentProject = null,
            OfficeDays = "1,2,3",
        };
        var liam = new Employee
        {
            FirstName = "Liam", LastName = "O'Brien", Email = "liam.obrien@meridian.com",
            Role = "Sales Development Representative", Department = sales,
            StartDate = today.AddDays(-14), CurrentProject = null,
            OfficeDays = "1,3,5",
        };
        db.Employees.AddRange(alex, maya, liam);

        // Onboarding progress reflects how far each person is into their first month.
        AddOnboardingTasks(db, alex, preDone: 2, weekDone: 0, monthDone: 0, completedAround: DateTime.Now.AddDays(-1));
        AddOnboardingTasks(db, maya, preDone: 5, weekDone: 5, monthDone: 0, completedAround: DateTime.Now.AddDays(-5));
        AddOnboardingTasks(db, liam, preDone: 5, weekDone: 7, monthDone: 2, completedAround: DateTime.Now.AddDays(-10));

        db.SaveChanges();
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
