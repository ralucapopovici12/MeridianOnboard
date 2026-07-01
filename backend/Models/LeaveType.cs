namespace backend.Models;

/// <summary>
/// Types of leave an employee can request, modelled on what larger companies
/// (e.g. Atlassian) offer, plus Romanian statutory event leave.
/// Stored as a string in the database for readability.
/// </summary>
public enum LeaveType
{
    Annual,
    Sick,
    BloodDonation,
    Personal,
    Parental,
    Bereavement,
    Marriage,
    Study,
}
