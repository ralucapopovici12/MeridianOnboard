namespace backend.Dtos;

public record EmployeeDto(
    int Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string Role,
    string Department,
    int DepartmentId,
    DateOnly StartDate,
    bool IsHR,
    string? CurrentProject,
    bool IsNewHire,
    int[]? OfficeDays,
    string AvatarUrl);

public record ProgressDto(int Completed, int Total, int Percent);

/// <summary>Credentials for the login endpoint.</summary>
public record LoginDto(string Email, string Password);

public record TaskDto(
    int Id,
    string Title,
    string Phase,
    string PhaseLabel,
    bool IsCompleted,
    DateTime? CompletedAt,
    int OrderIndex);

public record PhaseGroupDto(
    string Phase,
    string Label,
    int Completed,
    int Total,
    IReadOnlyList<TaskDto> Tasks);

public record EmployeeChecklistDto(
    int EmployeeId,
    string FullName,
    string Role,
    string Department,
    DateOnly StartDate,
    ProgressDto Progress,
    IReadOnlyList<PhaseGroupDto> Groups,
    int[]? OfficeDays);

public record ScheduleUpdateDto(int[] OfficeDays);

public record HrOverviewItemDto(
    int EmployeeId,
    string FullName,
    string Role,
    string Department,
    DateOnly StartDate,
    int DaysToStart,
    string Status,
    string CurrentPhaseLabel,
    ProgressDto Progress,
    string AvatarUrl);

// --- Time clock ("pontaj") ---

public record TimeEntryDto(
    int Id,
    DateOnly Date,
    string DateLabel,
    DateTime ClockIn,
    DateTime? ClockOut,
    string Location,
    int? Minutes);

/// <summary>Optional location chosen when starting the day ("Office" or "Remote").</summary>
public record ClockInDto(string? Location);

/// <summary>Change today's location after the fact ("Office" or "Remote").</summary>
public record LocationUpdateDto(string Location);

public record TimesheetDto(
    int EmployeeId,
    string TodayLabel,
    string TodayLocation,
    bool IsClockedIn,
    TimeEntryDto? Today,
    IReadOnlyList<TimeEntryDto> Recent);

// --- Personal task board ---

public record BoardTaskDto(
    int Id,
    string Key,
    string Title,
    string Status,
    string Priority,
    string? Tag,
    int OrderIndex,
    int AssigneeId,
    string AssigneeName,
    string AssigneeAvatarUrl);

public record BoardColumnDto(
    string Status,
    string Label,
    IReadOnlyList<BoardTaskDto> Tasks);

public record BoardDto(int EmployeeId, IReadOnlyList<BoardColumnDto> Columns);

public record BoardMoveDto(string Status);
