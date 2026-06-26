using Microsoft.EntityFrameworkCore;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

const string DevCors = "DevCors";
builder.Services.AddCors(options =>
    options.AddPolicy(DevCors, policy => policy
        .WithOrigins("http://localhost:5173") // Vite dev server
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

// Create the SQLite database from the current model on startup (zero-config:
// the app is alive the moment it is cloned, no manual migrate step required).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    Seeder.Seed(db);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(DevCors);

app.UseAuthorization();

app.MapControllers();

app.Run();
