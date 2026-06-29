namespace backend.Models;

/// <summary>
/// Ticket priority, Jira/Linear-style. Stored as a readable string in the database.
/// </summary>
public enum BoardPriority
{
    Low,
    Medium,
    High,
    Urgent,
}

public static class BoardPriorityExtensions
{
    /// <summary>Human-friendly priority label.</summary>
    public static string Label(this BoardPriority priority) => priority.ToString();
}
