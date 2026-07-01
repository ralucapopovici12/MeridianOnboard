namespace backend.Models;

/// <summary>
/// A request for time off. Submitted by an employee (Pending), then Approved or
/// Declined by HR. Approved requests count against the yearly balance (for types
/// that have one) and show as leave on the weekly attendance strip.
/// </summary>
public class LeaveRequest
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public LeaveType Type { get; set; }

    /// <summary>Inclusive first day off.</summary>
    public DateOnly StartDate { get; set; }

    /// <summary>Inclusive last day off (same as StartDate for a single day).</summary>
    public DateOnly EndDate { get; set; }

    public string? Note { get; set; }

    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;

    public DateTime CreatedAt { get; set; }

    /// <summary>When HR approved or declined it; null while Pending.</summary>
    public DateTime? DecidedAt { get; set; }
}
