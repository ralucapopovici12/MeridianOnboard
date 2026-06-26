using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<OnboardingTask> OnboardingTasks => Set<OnboardingTask>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Department>()
            .HasIndex(d => d.Name)
            .IsUnique();

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();

            entity.HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OnboardingTask>(entity =>
        {
            // Persist the phase as a readable string ("Week1") rather than an int.
            entity.Property(t => t.Phase).HasConversion<string>();

            entity.HasOne(t => t.Employee)
                .WithMany(e => e.Tasks)
                .HasForeignKey(t => t.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
