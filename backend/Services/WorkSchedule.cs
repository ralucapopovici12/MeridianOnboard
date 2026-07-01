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

    /// <summary>How many days per week an employee is expected in the office.</summary>
    public const int OfficeTarget = 3;

    /// <summary>Monday of the week containing <paramref name="date"/>.</summary>
    public static DateOnly MondayOf(DateOnly date)
    {
        int offset = ((int)date.DayOfWeek + 6) % 7; // Mon=0 … Sun=6
        return date.AddDays(-offset);
    }

    /// <summary>Number of weekdays (Mon–Fri) in an inclusive date range.</summary>
    public static int WorkingDays(DateOnly start, DateOnly end)
    {
        if (end < start) return 0;
        int count = 0;
        for (var d = start; d <= end; d = d.AddDays(1))
        {
            if (d.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
                count++;
        }
        return count;
    }
}
