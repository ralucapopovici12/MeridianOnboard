using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Dtos;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db) => _db = db;

    /// <summary>Toggle a task between done and not done, stamping CompletedAt accordingly.</summary>
    [HttpPatch("{id:int}/toggle")]
    public async Task<ActionResult<TaskDto>> Toggle(int id)
    {
        var task = await _db.OnboardingTasks.FindAsync(id);
        if (task is null)
            return NotFound();

        task.IsCompleted = !task.IsCompleted;
        task.CompletedAt = task.IsCompleted ? DateTime.Now : null;
        await _db.SaveChangesAsync();

        return new TaskDto(
            task.Id, task.Title, task.Phase.ToString(), task.Phase.Label(),
            task.IsCompleted, task.CompletedAt, task.OrderIndex);
    }
}
