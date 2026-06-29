namespace backend.Models;

/// <summary>
/// One clock-in/clock-out session for an employee on a given day ("pontaj").
/// Location is captured at clock-in from the employee's hybrid schedule (Office/Remote).
/// </summary>
public class TimeEntry
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    /// <summary>The calendar day this entry belongs to.</summary>
    public DateOnly Date { get; set; }

    public DateTime ClockIn { get; set; }

    /// <summary>Null while the session is still open (clocked in, not yet out).</summary>
    public DateTime? ClockOut { get; set; }

    /// <summary>"Office" or "Remote", derived from the hybrid schedule at clock-in time.</summary>
    public required string Location { get; set; }
}
