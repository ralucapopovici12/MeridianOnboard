namespace backend.Models;

public class OnboardingTask
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public required string Title { get; set; }
    public OnboardingPhase Phase { get; set; }

    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }

    /// <summary>Sort order within a phase so the checklist reads top-to-bottom as intended.</summary>
    public int OrderIndex { get; set; }
}
