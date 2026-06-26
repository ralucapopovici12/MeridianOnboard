namespace backend.Models;

public class Employee
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string Role { get; set; }

    public int DepartmentId { get; set; }
    public Department? Department { get; set; }

    /// <summary>Date the employee starts (or started) at Meridian.</summary>
    public DateOnly StartDate { get; set; }

    /// <summary>True for the single HR person who owns the onboarding process.</summary>
    public bool IsHR { get; set; }

    /// <summary>What the person is currently working on — answers "who do I ask about X?".</summary>
    public string? CurrentProject { get; set; }

    public List<OnboardingTask> Tasks { get; set; } = new();
}
