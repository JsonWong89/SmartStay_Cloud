// Add these User endpoints to your Program.cs

// GET all users
app.MapGet("/api/users", async (SmartStayDbContext db) =>
{
    var users = await db.Users
        .AsNoTracking()
        .Select(u => new
        {
            u.UserID,
            u.FullName,
            u.Email,
            u.Role,
            u.HotelID,
            u.CreatedAt
            // DO NOT return PasswordHash for security
        })
        .ToListAsync();
    
    return Results.Ok(users);
})
.WithName("GetAllUsers")
.WithOpenApi();

// GET user by ID
app.MapGet("/api/users/{id:int}", async (int id, SmartStayDbContext db) =>
{
    var user = await db.Users
        .AsNoTracking()
        .Where(u => u.UserID == id)
        .Select(u => new
        {
            u.UserID,
            u.FullName,
            u.Email,
            u.Role,
            u.HotelID,
            u.CreatedAt
        })
        .FirstOrDefaultAsync();
    
    return user is not null ? Results.Ok(user) : Results.NotFound();
})
.WithName("GetUserById")
.WithOpenApi();

// POST create new user (registration)
app.MapPost("/api/users", async (UserCreateDto dto, SmartStayDbContext db) =>
{
    // Check if email already exists
    if (await db.Users.AnyAsync(u => u.Email == dto.Email))
    {
        return Results.BadRequest(new { message = "Email already exists" });
    }

    // Hash the password (use proper hashing in production!)
    var passwordHash = HashPassword(dto.PasswordHash); // Implement proper hashing

    var user = new User
    {
        FullName = dto.FullName,
        Email = dto.Email,
        PasswordHash = passwordHash,
        Role = dto.Role ?? "Manager",
        HotelID = dto.HotelId,
        CreatedAt = DateTime.UtcNow
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Created($"/api/users/{user.UserID}", new
    {
        user.UserID,
        user.FullName,
        user.Email,
        user.Role,
        user.HotelID,
        user.CreatedAt
    });
})
.WithName("CreateUser")
.WithOpenApi();

// Helper function for password hashing (use proper library like BCrypt in production)
string HashPassword(string password)
{
    using var sha256 = System.Security.Cryptography.SHA256.Create();
    var bytes = System.Text.Encoding.UTF8.GetBytes(password);
    var hash = sha256.ComputeHash(bytes);
    return Convert.ToBase64String(hash);
}

// DTO for creating users
public record UserCreateDto(
    string FullName,
    string Email,
    string PasswordHash, // Should be called "password" but keeping consistent with your frontend
    string? Role,
    int? HotelId
);
