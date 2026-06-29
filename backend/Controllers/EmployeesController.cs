using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/employees")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _db;

    public EmployeesController(AppDbContext db) => _db = db;

    /// <summary>The people directory: everyone at Meridian and what they do.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll()
    {
        var rows = await _db.Employees
            .Include(e => e.Department)
            .OrderBy(e => e.Department!.Name)
            .ThenBy(e => e.FirstName)
            .ThenBy(e => e.LastName)
            .Select(e => new {
                e.Id, e.FirstName, e.LastName, e.Email, e.Role,
                Department = e.Department!.Name, e.DepartmentId,
                e.StartDate, e.IsHR, e.CurrentProject, e.OfficeDays,
                IsNewHire = e.Tasks.Any()
            })
            .ToListAsync();

        return Ok(rows.Select(e => new EmployeeDto(
            e.Id, e.FirstName, e.LastName, e.FirstName + " " + e.LastName,
            e.Email, e.Role, e.Department, e.DepartmentId,
            e.StartDate, e.IsHR, e.CurrentProject, e.IsNewHire,
            ParseOfficeDays(e.OfficeDays))));
    }

    /// <summary>A new hire's onboarding checklist, grouped by phase, with progress.</summary>
    [HttpGet("{id:int}/tasks")]
    public async Task<ActionResult<EmployeeChecklistDto>> GetTasks(int id)
    {
        var employee = await _db.Employees
            .Include(e => e.Department)
            .Include(e => e.Tasks)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee is null)
            return NotFound();

        var groups = OnboardingPhaseExtensions.InOrder
            .Select(phase =>
            {
                var tasks = employee.Tasks
                    .Where(t => t.Phase == phase)
                    .OrderBy(t => t.OrderIndex)
                    .Select(ToTaskDto)
                    .ToList();
                return new PhaseGroupDto(
                    phase.ToString(), phase.Label(),
                    tasks.Count(t => t.IsCompleted), tasks.Count, tasks);
            })
            .Where(g => g.Total > 0)
            .ToList();

        return new EmployeeChecklistDto(
            employee.Id, employee.FirstName + " " + employee.LastName,
            employee.Role, employee.Department!.Name, employee.StartDate,
            OnboardingMetrics.Progress(employee.Tasks), groups,
            ParseOfficeDays(employee.OfficeDays));
    }

    /// <summary>Completion percentage for a single new hire.</summary>
    [HttpGet("{id:int}/progress")]
    public async Task<ActionResult<ProgressDto>> GetProgress(int id)
    {
        if (!await _db.Employees.AnyAsync(e => e.Id == id))
            return NotFound();

        var tasks = await _db.OnboardingTasks.Where(t => t.EmployeeId == id).ToListAsync();
        return OnboardingMetrics.Progress(tasks);
    }

    /// <summary>Saves a new hire's chosen in-office days (must be exactly 3 distinct weekdays, 1=Mon..5=Fri).</summary>
    [HttpPatch("{id:int}/schedule")]
    public async Task<ActionResult<EmployeeDto>> UpdateSchedule(int id, [FromBody] ScheduleUpdateDto body)
    {
        if (body.OfficeDays.Length != 3
            || body.OfficeDays.Any(d => d < 1 || d > 5)
            || body.OfficeDays.Distinct().Count() != 3)
            return BadRequest("OfficeDays must be exactly 3 distinct values between 1 and 5.");

        var emp = await _db.Employees
            .Include(e => e.Department)
            .Include(e => e.Tasks)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (emp is null) return NotFound();

        emp.OfficeDays = string.Join(",", body.OfficeDays.OrderBy(d => d));
        await _db.SaveChangesAsync();

        return new EmployeeDto(
            emp.Id, emp.FirstName, emp.LastName, emp.FirstName + " " + emp.LastName,
            emp.Email, emp.Role, emp.Department!.Name, emp.DepartmentId,
            emp.StartDate, emp.IsHR, emp.CurrentProject, emp.Tasks.Any(),
            ParseOfficeDays(emp.OfficeDays));
    }

    private static int[]? ParseOfficeDays(string? raw) =>
        raw is null ? null : raw.Split(',').Select(int.Parse).ToArray();

    private static TaskDto ToTaskDto(OnboardingTask t) =>
        new(t.Id, t.Title, t.Phase.ToString(), t.Phase.Label(),
            t.IsCompleted, t.CompletedAt, t.OrderIndex);
}
