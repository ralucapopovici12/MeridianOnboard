namespace backend.Models;

/// <summary>
/// A work item ("ticket") on an employee's personal task board. Distinct from the
/// onboarding checklist (<see cref="OnboardingTask"/>): these are real work tasks the
/// person moves across Backlog → To Do → In Progress → In Review → Done.
/// </summary>
public class BoardTask
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public required string Title { get; set; }

    public BoardStatus Status { get; set; }

    public BoardPriority Priority { get; set; } = BoardPriority.Medium;

    /// <summary>A single short label/tag, e.g. "backend", "setup", "content".</summary>
    public string? Tag { get; set; }

    /// <summary>Sort order within its column.</summary>
    public int OrderIndex { get; set; }
}
