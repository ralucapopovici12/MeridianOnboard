using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

/// <summary>
/// Time off: employees submit leave requests (Pending); HR approves or declines
/// them. Approved requests draw down the yearly balance (where one exists) and
/// show up on the weekly attendance strip.
/// </summary>
[ApiController]
[Route("api")]
public class LeaveController : ControllerBase
{
    private readonly AppDbContext _db;

    public LeaveController(AppDbContext db) => _db = db;

    /// <summary>Balances plus this employee's own requests.</summary>
    [HttpGet("employees/{id:int}/leave")]
    public async Task<ActionResult<LeaveOverviewDto>> GetLeave(int id)
    {
        if (!await _db.Employees.AnyAsync(e => e.Id == id))
            return NotFound();

        return await BuildOverview(id);
    }

    /// <summary>Submit a new leave request (starts Pending).</summary>
    [HttpPost("employees/{id:int}/leave")]
    public async Task<ActionResult<LeaveOverviewDto>> Create(int id, [FromBody] CreateLeaveDto body)
    {
        if (!await _db.Employees.AnyAsync(e => e.Id == id))
            return NotFound();

        if (!Enum.TryParse<LeaveType>(body.Type, out var type))
            return BadRequest($"Unknown leave type '{body.Type}'.");

        if (body.EndDate < body.StartDate)
            return BadRequest("End date can't be before the start date.");

        _db.LeaveRequests.Add(new LeaveRequest
        {
            EmployeeId = id,
            Type = type,
            StartDate = body.StartDate,
            EndDate = body.EndDate,
            Note = string.IsNullOrWhiteSpace(body.Note) ? null : body.Note.Trim(),
            Status = LeaveStatus.Pending,
            CreatedAt = DateTime.Now,
        });
        await _db.SaveChangesAsync();

        return await BuildOverview(id);
    }

    /// <summary>Withdraw one of your own requests (Pending or Approved → Cancelled).</summary>
    [HttpPatch("leave-requests/{id:int}/cancel")]
    public async Task<ActionResult<LeaveOverviewDto>> Cancel(int id)
    {
        var req = await _db.LeaveRequests.FindAsync(id);
        if (req is null) return NotFound();

        if (req.Status is LeaveStatus.Pending or LeaveStatus.Approved)
        {
            req.Status = LeaveStatus.Cancelled;
            await _db.SaveChangesAsync();
        }

        return await BuildOverview(req.EmployeeId);
    }

    /// <summary>HR approves or declines a pending request.</summary>
    [HttpPatch("leave-requests/{id:int}/decision")]
    public async Task<ActionResult<LeaveRequestDto>> Decide(int id, [FromBody] LeaveDecisionDto body)
    {
        var req = await _db.LeaveRequests.FindAsync(id);
        if (req is null) return NotFound();

        if (req.Status == LeaveStatus.Pending)
        {
            req.Status = body.Approve ? LeaveStatus.Approved : LeaveStatus.Declined;
            req.DecidedAt = DateTime.Now;
            await _db.SaveChangesAsync();
        }

        return ToDto(req);
    }

    /// <summary>Every pending request across the company — HR's approval queue.</summary>
    [HttpGet("hr/leave")]
    public async Task<ActionResult<IEnumerable<PendingLeaveDto>>> GetPending()
    {
        var pending = await _db.LeaveRequests
            .Include(l => l.Employee)
            .Where(l => l.Status == LeaveStatus.Pending)
            .OrderBy(l => l.StartDate)
            .ToListAsync();

        return pending.Select(l => new PendingLeaveDto(
            l.Id,
            l.EmployeeId,
            l.Employee!.FirstName + " " + l.Employee.LastName,
            Avatars.UrlFor(l.Employee.Email),
            l.Type.ToString(),
            l.Type.Label(),
            l.StartDate,
            l.EndDate,
            WorkSchedule.WorkingDays(l.StartDate, l.EndDate),
            l.Note,
            l.CreatedAt)).ToList();
    }

    private async Task<LeaveOverviewDto> BuildOverview(int employeeId)
    {
        var requests = await _db.LeaveRequests
            .Where(l => l.EmployeeId == employeeId)
            .OrderByDescending(l => l.StartDate)
            .ToListAsync();

        var year = DateTime.Now.Year;
        var balances = LeaveTypeExtensions.InOrder.Select(type =>
        {
            var entitlement = type.Entitlement();
            var used = requests
                .Where(r => r.Type == type
                            && r.Status == LeaveStatus.Approved
                            && r.StartDate.Year == year)
                .Sum(r => WorkSchedule.WorkingDays(r.StartDate, r.EndDate));

            return new LeaveBalanceDto(
                type.ToString(),
                type.Label(),
                entitlement,
                used,
                entitlement.HasValue ? entitlement.Value - used : null);
        }).ToList();

        return new LeaveOverviewDto(employeeId, balances, requests.Select(ToDto).ToList());
    }

    private static LeaveRequestDto ToDto(LeaveRequest l) =>
        new(l.Id,
            l.Type.ToString(),
            l.Type.Label(),
            l.StartDate,
            l.EndDate,
            WorkSchedule.WorkingDays(l.StartDate, l.EndDate),
            l.Status.ToString(),
            l.Note,
            l.CreatedAt);
}
