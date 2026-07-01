namespace backend.Models;

/// <summary>Lifecycle of a leave request. Stored as a string for readability.</summary>
public enum LeaveStatus
{
    Pending,
    Approved,
    Declined,
    Cancelled,
}
