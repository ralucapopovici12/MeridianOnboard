using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

/// <summary>
/// Lightweight email + password login. Verifies a PBKDF2 hash and returns the
/// employee record the client uses as its current session. (Demo-grade: there is
/// no token — the existing per-id endpoints remain open, as documented in scope.)
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db) => _db = db;

    [HttpPost("login")]
    public async Task<ActionResult<EmployeeDto>> Login([FromBody] LoginDto body)
    {
        var email = (body.Email ?? string.Empty).Trim().ToLowerInvariant();

        var employee = await _db.Employees
            .Include(e => e.Department)
            .Include(e => e.Tasks)
            .FirstOrDefaultAsync(e => e.Email.ToLower() == email);

        // Same response whether the email is unknown or the password is wrong.
        if (employee is null || !PasswordHasher.Verify(body.Password ?? string.Empty, employee.PasswordHash))
            return Unauthorized(new { message = "Incorrect email or password." });

        return new EmployeeDto(
            employee.Id, employee.FirstName, employee.LastName,
            employee.FirstName + " " + employee.LastName,
            employee.Email, employee.Role, employee.Department!.Name, employee.DepartmentId,
            employee.StartDate, employee.IsHR, employee.CurrentProject, employee.Tasks.Any(),
            employee.OfficeDays is null
                ? null
                : employee.OfficeDays.Split(',').Select(int.Parse).ToArray(),
            Avatars.UrlFor(employee.Email));
    }
}
