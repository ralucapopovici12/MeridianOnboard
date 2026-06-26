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
    bool IsNewHire);

public record ProgressDto(int Completed, int Total, int Percent);

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
    IReadOnlyList<PhaseGroupDto> Groups);

public record HrOverviewItemDto(
    int EmployeeId,
    string FullName,
    string Role,
    string Department,
    DateOnly StartDate,
    int DaysToStart,
    string Status,
    string CurrentPhaseLabel,
    ProgressDto Progress);
