# SmartStay Database Models & Setup Guide

## 📦 What's Included

### Entity Models (9 Tables)
✅ `User.cs` - User accounts and authentication
✅ `Hotel.cs` - Hotel properties
✅ `HotelManager.cs` - User-Hotel assignments
✅ `RoomType.cs` - Room type definitions
✅ `RatePlan.cs` - Pricing structures
✅ `Booking.cs` - Booking records
✅ `SystemEvent.cs` - System logs
✅ `AuditLog.cs` - Audit trail
✅ `DailyMetric.cs` - Daily analytics

### DbContext
✅ `SmartStayDbContext.cs` - Entity Framework configuration with relationships and indexes

### DTOs (Data Transfer Objects)
✅ `UserDtos.cs` - User API contracts
✅ `HotelDtos.cs` - Hotel API contracts
✅ `RoomTypeDtos.cs` - Room type API contracts
✅ `RatePlanDtos.cs` - Rate plan API contracts
✅ `ReportDtos.cs` - Report API contracts
✅ `MonitorDtos.cs` - Monitoring API contracts

---

## 🚀 Setup Instructions for Visual Studio 2022

### Step 1: Add Required NuGet Packages

Open **Package Manager Console** in Visual Studio and run:

```powershell
Install-Package Microsoft.EntityFrameworkCore
Install-Package Microsoft.EntityFrameworkCore.SqlServer
Install-Package Microsoft.EntityFrameworkCore.Tools
Install-Package Microsoft.EntityFrameworkCore.Design
Install-Package BCrypt.Net-Next
```

### Step 2: Update appsettings.json

Add your database connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SmartStayDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

For SQL Server Express, use:
```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=SmartStayDB;Trusted_Connection=True;TrustServerCertificate=True;"
```

### Step 3: Register DbContext in Program.cs

Add these lines to your `Program.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using SmartStay.Data;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<SmartStayDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();
```

### Step 4: Create Database Migration

In **Package Manager Console**, run:

```powershell
Add-Migration InitialCreate
Update-Database
```

This will:
1. Create a migration file with all table definitions
2. Apply the migration to create the database
3. Set up all tables, indexes, and foreign keys

### Step 5: Verify Database Creation

1. Open **SQL Server Object Explorer** in Visual Studio
2. Expand your server → Databases
3. You should see **SmartStayDB** with 9 tables

---

## 📊 Database Schema Overview

### Core Tables

**Users** - Authentication & Authorization
- Stores admin and manager accounts
- Supports role-based access (Admin, Manager, Staff)
- Tracks login activity

**Hotels** - Property Management
- Hotel details and configuration
- Address, contact info, timezone
- Check-in/out times

**HotelManagers** - Access Control
- Links users to hotels they manage
- Supports multi-hotel management

**RoomTypes** - Room Configuration
- Room categories (Standard, Deluxe, Suite, etc.)
- Capacity, bed types, amenities
- Size and features

**RatePlans** - Pricing Strategy
- Base pricing per room type
- Date ranges for seasonal pricing
- Minimum/maximum stay rules

**Bookings** - Reservations
- Guest information
- Check-in/out dates
- Pricing and payment status
- Booking source tracking

**DailyMetrics** - Analytics
- Daily performance data per hotel
- Occupancy, ADR, RevPAR
- Booking and cancellation counts

**SystemEvents** - Monitoring
- System-level logs
- Error tracking
- Performance events

**AuditLogs** - Compliance
- User activity tracking
- Data change history
- Security audit trail

---

## 🔧 Next Steps: Create API Controllers

### Example: UsersController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStay.Data;
using SmartStay.DTOs;
using SmartStay.Models;

namespace SmartStay.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly SmartStayDbContext _context;

        public UsersController(SmartStayDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .Where(u => u.Role == "Manager" || u.Role == "Admin")
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FullName = u.FullName,
                    Role = u.Role,
                    Status = u.Status,
                    LastLoginAt = u.LastLoginAt,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = passwordHash,
                FullName = dto.FullName,
                Role = dto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                Status = user.Status,
                CreatedAt = user.CreatedAt
            };

            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, userDto);
        }

        // PUT: api/users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            if (dto.FullName != null) user.FullName = dto.FullName;
            if (dto.Role != null) user.Role = dto.Role;
            if (dto.Status != null) user.Status = dto.Status;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
```

---

## 📝 Required Controllers for Frontend

Create these controller files in your `Controllers` folder:

1. **UsersController.cs** - Manage user accounts
2. **HotelsController.cs** - Hotel CRUD operations
3. **RoomTypesController.cs** - Room type management
4. **RatePlansController.cs** - Pricing configuration
5. **ReportsController.cs** - Analytics and reports
6. **MonitorController.cs** - System health monitoring
7. **AuthController.cs** - Login/logout

---

## 🔐 Authentication Setup

Update your **LoginPage.tsx** API call to:

```typescript
const response = await fetch("http://localhost:5163/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

---

## ✅ Verification Checklist

- [ ] NuGet packages installed
- [ ] Connection string configured
- [ ] DbContext registered in Program.cs
- [ ] Migration created and applied
- [ ] Database exists in SQL Server
- [ ] All 9 tables created
- [ ] Controllers created
- [ ] CORS enabled for frontend
- [ ] API tested with Swagger (http://localhost:5163/swagger)

---

## 📚 Additional Resources

### Entity Framework Commands

```powershell
# Create new migration
Add-Migration MigrationName

# Apply migrations
Update-Database

# Remove last migration
Remove-Migration

# Generate SQL script
Script-Migration

# Drop database (careful!)
Drop-Database
```

### Seed Sample Data

Create `DbInitializer.cs` to add test data:

```csharp
public static class DbInitializer
{
    public static void Seed(SmartStayDbContext context)
    {
        if (context.Users.Any()) return; // Already seeded

        var adminUser = new User
        {
            Email = "admin@smartstay.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            FullName = "System Administrator",
            Role = "Admin",
            Status = "Active"
        };

        context.Users.Add(adminUser);
        context.SaveChanges();
    }
}
```

Call in `Program.cs`:
```csharp
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<SmartStayDbContext>();
    DbInitializer.Seed(context);
}
```

---

## 🐛 Troubleshooting

**Migration fails:**
- Check connection string
- Ensure SQL Server is running
- Verify credentials

**Port 5163 already in use:**
- Change port in `launchSettings.json`
- Update frontend API calls

**CORS errors:**
- Verify CORS policy in Program.cs
- Check frontend URL matches allowed origins

---

## 📞 Support

For issues:
1. Check SQL Server Object Explorer for database
2. Test API endpoints with Swagger
3. Review console logs for errors
4. Verify all using statements are correct

Your backend is now ready to support all admin navigation features! 🎉
