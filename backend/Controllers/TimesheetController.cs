using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

/// <summary>
/// The time clock ("pontaj"): one clock-in/clock-out session per day, with the
/// Office/Remote location taken from the employee's hybrid schedule.
/// </summary>
[ApiController]
[Route("api/employees")]
public class TimesheetController : ControllerBase
{
    private readonly AppDbContext _db;

    public TimesheetController(AppDbContext db) => _db = db;

    /// <summary>Today's session plus recent history for one employee.</summary>
    [HttpGet("{id:int}/timesheet")]
    public async Task<ActionResult<TimesheetDto>> GetTimesheet(int id)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id);
        if (employee is null) return NotFound();

        return await BuildTimesheet(employee);
    }

    /// <summary>
    /// Start today's session, recording where the person is working today.
    /// The hybrid schedule (3 office / 2 remote) only suggests a default — the
    /// employee picks Office/Remote each day. No-op if already clocked in today.
    /// </summary>
    [HttpPost("{id:int}/clock-in")]
    public async Task<ActionResult<TimesheetDto>> ClockIn(int id, [FromBody] ClockInDto? body = null)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id);
        if (employee is null) return NotFound();

        var today = DateOnly.FromDateTime(DateTime.Now);
        var existing = await _db.TimeEntries
            .FirstOrDefaultAsync(t => t.EmployeeId == id && t.Date == today);

        // Only create a session if there isn't one for today yet.
        if (existing is null)
        {
            _db.TimeEntries.Add(new TimeEntry
            {
                EmployeeId = id,
                Date = today,
                ClockIn = DateTime.Now,
                ClockOut = null,
                // Use the chosen location; fall back to the schedule's suggestion.
                Location = WorkSchedule.Normalize(body?.Location)
                           ?? WorkSchedule.LocationFor(employee.OfficeDays, today),
            });
            await _db.SaveChangesAsync();
        }

        return await BuildTimesheet(employee);
    }

    /// <summary>Change today's working location (Office/Remote) for an existing session.</summary>
    [HttpPatch("{id:int}/timesheet/location")]
    public async Task<ActionResult<TimesheetDto>> SetLocation(int id, [FromBody] LocationUpdateDto body)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id);
        if (employee is null) return NotFound();

        var location = WorkSchedule.Normalize(body.Location);
        if (location is null) return BadRequest($"Unknown location '{body.Location}'.");

        var today = DateOnly.FromDateTime(DateTime.Now);
        var entry = await _db.TimeEntries
            .FirstOrDefaultAsync(t => t.EmployeeId == id && t.Date == today);
        if (entry is null) return BadRequest("No session for today yet — clock in first.");

        entry.Location = location;
        await _db.SaveChangesAsync();

        return await BuildTimesheet(employee);
    }

    /// <summary>End today's open session. No-op if not currently clocked in.</summary>
    [HttpPost("{id:int}/clock-out")]
    public async Task<ActionResult<TimesheetDto>> ClockOut(int id)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id);
        if (employee is null) return NotFound();

        var today = DateOnly.FromDateTime(DateTime.Now);
        var open = await _db.TimeEntries
            .FirstOrDefaultAsync(t => t.EmployeeId == id && t.Date == today && t.ClockOut == null);

        if (open is not null)
        {
            open.ClockOut = DateTime.Now;
            await _db.SaveChangesAsync();
        }

        return await BuildTimesheet(employee);
    }

    /// <summary>
    /// The current week (Mon–Fri) with each day's Office/Remote/leave status and a
    /// running count toward the "3 days in office" policy. Leave days don't count.
    /// </summary>
    [HttpGet("{id:int}/week")]
    public async Task<ActionResult<WeekDto>> GetWeek(int id)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id);
        if (employee is null) return NotFound();

        var today = DateOnly.FromDateTime(DateTime.Now);
        var monday = WorkSchedule.MondayOf(today);
        var friday = monday.AddDays(4);

        var entries = await _db.TimeEntries
            .Where(t => t.EmployeeId == id && t.Date >= monday && t.Date <= friday)
            .ToListAsync();

        var leaves = await _db.LeaveRequests
            .Where(l => l.EmployeeId == id
                        && l.Status == LeaveStatus.Approved
                        && l.StartDate <= friday && l.EndDate >= monday)
            .ToListAsync();

        var days = new List<WeekDayDto>();
        var officeCount = 0;

        for (var i = 0; i < 5; i++)
        {
            var date = monday.AddDays(i);
            var leave = leaves.FirstOrDefault(l => l.StartDate <= date && l.EndDate >= date);
            var entry = entries.FirstOrDefault(t => t.Date == date);
            var location = leave is not null ? null : entry?.Location;

            if (location == "Office") officeCount++;

            days.Add(new WeekDayDto(
                date,
                date.ToString("ddd", CultureInfo.InvariantCulture),
                date.ToString("MMM d", CultureInfo.InvariantCulture),
                location,
                leave is not null,
                leave?.Type.Label(),
                date == today,
                date < today));
        }

        var weekLabel =
            $"{monday.ToString("MMM d", CultureInfo.InvariantCulture)} – {friday.ToString("MMM d", CultureInfo.InvariantCulture)}";

        return new WeekDto(id, weekLabel, officeCount, WorkSchedule.OfficeTarget, days);
    }

    private async Task<TimesheetDto> BuildTimesheet(Employee employee)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);

        var entries = await _db.TimeEntries
            .Where(t => t.EmployeeId == employee.Id)
            .OrderByDescending(t => t.Date)
            .ToListAsync();

        var todayEntry = entries.FirstOrDefault(t => t.Date == today);
        var recent = entries.Where(t => t.Date < today).Take(7).Select(ToDto).ToList();

        return new TimesheetDto(
            employee.Id,
            today.ToString("dddd, MMM d", CultureInfo.InvariantCulture),
            WorkSchedule.LocationFor(employee.OfficeDays, today),
            todayEntry is { ClockOut: null },
            todayEntry is null ? null : ToDto(todayEntry),
            recent);
    }

    private static TimeEntryDto ToDto(TimeEntry t) =>
        new(t.Id,
            t.Date,
            t.Date.ToString("ddd, MMM d", CultureInfo.InvariantCulture),
            t.ClockIn,
            t.ClockOut,
            t.Location,
            t.ClockOut is null ? null : (int)(t.ClockOut.Value - t.ClockIn).TotalMinutes);
}
