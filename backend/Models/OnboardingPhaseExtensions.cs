namespace backend.Models;

public static class OnboardingPhaseExtensions
{
    /// <summary>Human-friendly label for a phase, used in API responses and the UI.</summary>
    public static string Label(this OnboardingPhase phase) => phase switch
    {
        OnboardingPhase.PreDay1 => "Pre-Day 1",
        OnboardingPhase.Week1 => "Week 1",
        OnboardingPhase.Weeks2to4 => "Weeks 2–4",
        _ => phase.ToString(),
    };

    /// <summary>Phases in the order a new hire moves through them.</summary>
    public static readonly OnboardingPhase[] InOrder =
    {
        OnboardingPhase.PreDay1,
        OnboardingPhase.Week1,
        OnboardingPhase.Weeks2to4,
    };
}
