using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using backend.Models;

namespace backend.Controllers;

/// <summary>
/// An employee's personal task board (Jira-style To Do / In Progress / Done).
/// </summary>
[ApiController]
[Route("api")]
public class BoardController : ControllerBase
{
    private readonly AppDbContext _db;

    public BoardController(AppDbContext db) => _db = db;

    /// <summary>The full board for one employee, grouped into the three columns.</summary>
    [HttpGet("employees/{id:int}/board")]
    public async Task<ActionResult<BoardDto>> GetBoard(int id)
    {
        if (!await _db.Employees.AnyAsync(e => e.Id == id))
            return NotFound();

        var tasks = await _db.BoardTasks
            .Include(t => t.Employee)
            .Where(t => t.EmployeeId == id)
            .ToListAsync();

        var columns = BoardStatusExtensions.InOrder
            .Select(status => new BoardColumnDto(
                status.ToString(),
                status.Label(),
                tasks.Where(t => t.Status == status)
                    .OrderBy(t => t.OrderIndex)
                    .Select(ToDto)
                    .ToList()))
            .ToList();

        return new BoardDto(id, columns);
    }

    /// <summary>
    /// The boards of everyone else — so you can see which tickets your colleagues
    /// have picked up. Read-only; tasks are grouped into the same columns and each
    /// one carries its assignee.
    /// </summary>
    [HttpGet("employees/{id:int}/team-board")]
    public async Task<ActionResult<BoardDto>> GetTeamBoard(int id)
    {
        if (!await _db.Employees.AnyAsync(e => e.Id == id))
            return NotFound();

        var tasks = await _db.BoardTasks
            .Include(t => t.Employee)
            .Where(t => t.EmployeeId != id)
            .ToListAsync();

        var columns = BoardStatusExtensions.InOrder
            .Select(status => new BoardColumnDto(
                status.ToString(),
                status.Label(),
                tasks.Where(t => t.Status == status)
                    .OrderBy(t => t.Employee!.FirstName)
                    .ThenBy(t => t.OrderIndex)
                    .Select(ToDto)
                    .ToList()))
            .ToList();

        return new BoardDto(id, columns);
    }

    /// <summary>Move a card to another column, appending it to the end of that column.</summary>
    [HttpPatch("board-tasks/{id:int}/move")]
    public async Task<ActionResult<BoardTaskDto>> Move(int id, [FromBody] BoardMoveDto body)
    {
        if (!Enum.TryParse<BoardStatus>(body.Status, out var status))
            return BadRequest($"Unknown status '{body.Status}'.");

        var task = await _db.BoardTasks.FindAsync(id);
        if (task is null) return NotFound();

        if (task.Status != status)
        {
            var maxOrder = await _db.BoardTasks
                .Where(t => t.EmployeeId == task.EmployeeId && t.Status == status)
                .Select(t => (int?)t.OrderIndex)
                .MaxAsync() ?? -1;

            task.Status = status;
            task.OrderIndex = maxOrder + 1;
            await _db.SaveChangesAsync();
        }

        return ToDto(task);
    }

    private static BoardTaskDto ToDto(BoardTask t)
    {
        var name = t.Employee is null ? "" : $"{t.Employee.FirstName} {t.Employee.LastName}";
        var avatar = t.Employee is null ? "" : Services.Avatars.UrlFor(t.Employee.Email);
        return new(
            t.Id,
            $"MER-{t.Id}",
            t.Title,
            t.Status.ToString(),
            t.Priority.ToString(),
            t.Tag,
            t.OrderIndex,
            t.EmployeeId,
            name,
            avatar);
    }
}
