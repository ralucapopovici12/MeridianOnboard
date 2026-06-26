namespace backend.Models;

/// <summary>
/// The three onboarding phases a new hire moves through during their first month.
/// Stored as a string in the database for readability.
/// </summary>
public enum OnboardingPhase
{
    PreDay1,
    Week1,
    Weeks2to4,
}
