namespace backend.Models;

public static class LeaveTypeExtensions
{
    /// <summary>Human-friendly label for a leave type.</summary>
    public static string Label(this LeaveType type) => type switch
    {
        LeaveType.Annual => "Annual leave",
        LeaveType.Sick => "Sick leave",
        LeaveType.BloodDonation => "Blood donation",
        LeaveType.Personal => "Personal / unpaid",
        LeaveType.Parental => "Parental leave",
        LeaveType.Bereavement => "Bereavement",
        LeaveType.Marriage => "Marriage leave",
        LeaveType.Study => "Study / exam",
        _ => type.ToString(),
    };

    /// <summary>
    /// Days granted per year for types with a fixed allowance. Null means the type is
    /// event-based or as-needed (sick with a certificate, blood-donation days, unpaid,
    /// statutory event leave) and isn't drawn from a yearly balance.
    /// </summary>
    public static int? Entitlement(this LeaveType type) => type switch
    {
        LeaveType.Annual => 21,
        LeaveType.Study => 5,
        _ => null,
    };

    /// <summary>Leave types in the order they're presented.</summary>
    public static readonly LeaveType[] InOrder =
    {
        LeaveType.Annual,
        LeaveType.Sick,
        LeaveType.BloodDonation,
        LeaveType.Personal,
        LeaveType.Parental,
        LeaveType.Bereavement,
        LeaveType.Marriage,
        LeaveType.Study,
    };
}
