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
        return await _db.Employees
            .Include(e => e.Department)
            .OrderBy(e => e.Department!.Name)
            .ThenBy(e => e.FirstName)
            .ThenBy(e => e.LastName)
            .Select(e => new EmployeeDto(
                e.Id, e.FirstName, e.LastName, e.FirstName + " " + e.LastName,
                e.Email, e.Role, e.Department!.Name, e.DepartmentId,
                e.StartDate, e.IsHR, e.CurrentProject, e.Tasks.Any()))
            .ToListAsync();
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
            OnboardingMetrics.Progress(employee.Tasks), groups);
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

    private static TaskDto ToTaskDto(OnboardingTask t) =>
        new(t.Id, t.Title, t.Phase.ToString(), t.Phase.Label(),
            t.IsCompleted, t.CompletedAt, t.OrderIndex);
}
