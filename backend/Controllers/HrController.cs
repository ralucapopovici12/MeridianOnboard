using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/hr")]
public class HrController : ControllerBase
{
    private readonly AppDbContext _db;

    public HrController(AppDbContext db) => _db = db;

    /// <summary>
    /// The single-screen view for Meridian's one HR person: every current new hire
    /// (anyone with an onboarding checklist) and how far through their first month they are.
    /// </summary>
    [HttpGet("overview")]
    public async Task<ActionResult<IEnumerable<HrOverviewItemDto>>> Overview()
    {
        var newHires = await _db.Employees
            .Include(e => e.Department)
            .Include(e => e.Tasks)
            .Where(e => e.Tasks.Any())
            .ToListAsync();

        return newHires
            .OrderBy(e => e.StartDate)
            .Select(e => new HrOverviewItemDto(
                e.Id, e.FirstName + " " + e.LastName, e.Role, e.Department!.Name,
                e.StartDate, OnboardingMetrics.DaysToStart(e.StartDate),
                OnboardingMetrics.Status(e.StartDate),
                OnboardingMetrics.CurrentPhaseLabel(e.Tasks),
                OnboardingMetrics.Progress(e.Tasks)))
            .ToList();
    }
}
