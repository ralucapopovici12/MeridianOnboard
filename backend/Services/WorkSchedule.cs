namespace backend.Services;

/// <summary>
/// Pure helpers for the hybrid work schedule (3 days office / 2 remote).
/// </summary>
public static class WorkSchedule
{
    /// <summary>
    /// Where the employee works on the given day, based on their stored office-day
    /// numbers (1=Mon … 5=Fri). Weekends and unset schedules count as "Remote".
    /// </summary>
    public static string LocationFor(string? officeDays, DateOnly date)
    {
        int day = (int)date.DayOfWeek; // 0=Sun, 1=Mon … 6=Sat — Mon–Fri already match 1–5.
        if (day is 0 or 6) return "Remote"; // weekend

        var days = officeDays is null
            ? Enumerable.Empty<int>()
            : officeDays.Split(',').Select(int.Parse);

        return days.Contains(day) ? "Office" : "Remote";
    }

    /// <summary>
    /// Canonicalises a user-supplied location to "Office" or "Remote", accepting a few
    /// friendly aliases ("on-site", "onsite", "remote"). Returns null if unrecognised.
    /// </summary>
    public static string? Normalize(string? location) => location?.Trim().ToLowerInvariant() switch
    {
        "office" or "on-site" or "onsite" or "on site" => "Office",
        "remote" => "Remote",
        _ => null,
    };
}
