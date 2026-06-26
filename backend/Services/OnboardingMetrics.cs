using backend.Dtos;
using backend.Models;

namespace backend.Services;

/// <summary>
/// Pure functions for turning a new hire's tasks and start date into the
/// progress / phase / status values the checklist and HR dashboard display.
/// </summary>
public static class OnboardingMetrics
{
    public static ProgressDto Progress(IEnumerable<OnboardingTask> tasks)
    {
        var list = tasks as ICollection<OnboardingTask> ?? tasks.ToList();
        var total = list.Count;
        var completed = list.Count(t => t.IsCompleted);
        var percent = total == 0 ? 0 : (int)Math.Round(100.0 * completed / total);
        return new ProgressDto(completed, total, percent);
    }

    /// <summary>The phase of the next incomplete task, or null if everything is done.</summary>
    public static OnboardingPhase? CurrentPhase(IEnumerable<OnboardingTask> tasks) =>
        tasks
            .Where(t => !t.IsCompleted)
            .OrderBy(t => Array.IndexOf(OnboardingPhaseExtensions.InOrder, t.Phase))
            .ThenBy(t => t.OrderIndex)
            .Select(t => (OnboardingPhase?)t.Phase)
            .FirstOrDefault();

    public static string CurrentPhaseLabel(IEnumerable<OnboardingTask> tasks)
    {
        var phase = CurrentPhase(tasks);
        return phase.HasValue ? phase.Value.Label() : "Complete";
    }

    /// <summary>Days until the start date: positive = upcoming, 0 = today, negative = already started.</summary>
    public static int DaysToStart(DateOnly startDate) =>
        startDate.DayNumber - DateOnly.FromDateTime(DateTime.Now).DayNumber;

    /// <summary>A short human status like "Starts in 3 days", "Day 4", or "Week 2".</summary>
    public static string Status(DateOnly startDate)
    {
        var days = DaysToStart(startDate);
        if (days > 1) return $"Starts in {days} days";
        if (days == 1) return "Starts tomorrow";
        if (days == 0) return "Starts today";

        var dayNumber = -days + 1; // first working day = Day 1
        if (dayNumber <= 7) return $"Day {dayNumber}";
        return $"Week {(dayNumber - 1) / 7 + 1}";
    }
}
