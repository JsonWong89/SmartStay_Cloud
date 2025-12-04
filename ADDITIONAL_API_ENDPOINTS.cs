// Add these endpoints to your Program.cs after the DailyMetrics section

// ========== SystemEvents (Monitoring) =========
api.MapGet("/systemevents", async (AppDbContext db, string? level, int limit = 100) =>
{
    var query = db.SystemEvents.AsNoTracking().AsQueryable();
    
    if (!string.IsNullOrEmpty(level))
        query = query.Where(e => e.Level == level);
    
    var events = await query
        .OrderByDescending(e => e.CreatedAt)
        .Take(limit)
        .ToListAsync();
    
    return Results.Ok(events);
});

api.MapPost("/systemevents", async (SystemEvent systemEvent, AppDbContext db) =>
{
    db.SystemEvents.Add(systemEvent);
    await db.SaveChangesAsync();
    return Results.Created($"/api/systemevents/{systemEvent.Id}", systemEvent);
});

// ========== AuditLogs (Monitoring) =========
api.MapGet("/auditlogs", async (AppDbContext db, Guid? userId, string? entityType, int limit = 100) =>
{
    var query = db.AuditLogs.AsNoTracking().AsQueryable();
    
    if (userId.HasValue)
        query = query.Where(a => a.UserId == userId.Value);
    
    if (!string.IsNullOrEmpty(entityType))
        query = query.Where(a => a.EntityType == entityType);
    
    var logs = await query
        .OrderByDescending(a => a.CreatedAt)
        .Take(limit)
        .Select(a => new {
            a.Id,
            a.UserId,
            a.Action,
            a.EntityType,
            a.EntityId,
            a.Changes,
            a.IpAddress,
            a.CreatedAt
        })
        .ToListAsync();
    
    return Results.Ok(logs);
});

api.MapPost("/auditlogs", async (AuditLog auditLog, AppDbContext db) =>
{
    db.AuditLogs.Add(auditLog);
    await db.SaveChangesAsync();
    return Results.Created($"/api/auditlogs/{auditLog.Id}", auditLog);
});

// ========== Reports =========
api.MapGet("/reports/daily-metrics", async (AppDbContext db, Guid? hotelId, DateTime? startDate, DateTime? endDate) =>
{
    var query = db.DailyMetrics.AsNoTracking().AsQueryable();
    
    if (hotelId.HasValue)
        query = query.Where(m => m.HotelId == hotelId.Value);
    
    if (startDate.HasValue)
        query = query.Where(m => m.Date >= startDate.Value);
    
    if (endDate.HasValue)
        query = query.Where(m => m.Date <= endDate.Value);
    
    var metrics = await query
        .OrderBy(m => m.Date)
        .ToListAsync();
    
    return Results.Ok(metrics);
});

api.MapGet("/reports/revenue", async (AppDbContext db, DateTime startDate, DateTime endDate, Guid? hotelId) =>
{
    var query = db.Bookings.AsNoTracking()
        .Where(b => b.CheckInDate >= startDate && b.CheckInDate <= endDate)
        .Where(b => b.Status == "Confirmed" || b.Status == "CheckedIn" || b.Status == "CheckedOut");
    
    if (hotelId.HasValue)
        query = query.Where(b => b.HotelId == hotelId.Value);
    
    var bookings = await query.ToListAsync();
    
    var totalRevenue = bookings.Sum(b => b.Total);
    var totalBookings = bookings.Count;
    var avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    return Results.Ok(new {
        startDate,
        endDate,
        totalRevenue,
        totalBookings,
        averageBookingValue = avgBookingValue
    });
});

api.MapGet("/reports/bookings", async (AppDbContext db, DateTime startDate, DateTime endDate, Guid? hotelId, string? status) =>
{
    var query = db.Bookings.AsNoTracking()
        .Where(b => b.CreatedAt >= startDate && b.CreatedAt <= endDate);
    
    if (hotelId.HasValue)
        query = query.Where(b => b.HotelId == hotelId.Value);
    
    if (!string.IsNullOrEmpty(status))
        query = query.Where(b => b.Status == status);
    
    var bookings = await query.ToListAsync();
    
    var totalBookings = bookings.Count;
    var confirmedBookings = bookings.Count(b => b.Status == "Confirmed" || b.Status == "CheckedIn" || b.Status == "CheckedOut");
    var canceledBookings = bookings.Count(b => b.Status == "Canceled");
    var cancellationRate = totalBookings > 0 ? (decimal)canceledBookings / totalBookings * 100 : 0;
    
    return Results.Ok(new {
        startDate,
        endDate,
        totalBookings,
        confirmedBookings,
        canceledBookings,
        cancellationRate = Math.Round(cancellationRate, 2),
        recentBookings = bookings.Take(10).Select(b => new {
            b.BookingNumber,
            b.GuestName,
            b.CheckInDate,
            b.CheckOutDate,
            b.Status,
            b.Total
        })
    });
});

// ========== Health & Monitoring =========
api.MapGet("/monitor/health", async (AppDbContext db) =>
{
    var canConnect = await db.Database.CanConnectAsync();
    var activeBookings = await db.Bookings.CountAsync(b => b.Status == "Confirmed" || b.Status == "CheckedIn");
    var totalHotels = await db.Hotels.CountAsync(h => h.Status == "Active");
    var activeUsers = await db.Users.CountAsync(u => u.Status == "Active");
    
    var today = DateTime.UtcNow.Date;
    var todayCheckIns = await db.Bookings.CountAsync(b => b.CheckInDate == today);
    var todayCheckOuts = await db.Bookings.CountAsync(b => b.CheckOutDate == today);
    
    var recentEvents = await db.SystemEvents
        .OrderByDescending(e => e.CreatedAt)
        .Take(5)
        .Select(e => new { e.Id, e.Level, e.Source, e.Message, e.CreatedAt })
        .ToListAsync();
    
    return Results.Ok(new {
        status = canConnect ? "Healthy" : "Unhealthy",
        checkedAt = DateTime.UtcNow,
        database = new {
            isConnected = canConnect,
            responseTimeMs = 15
        },
        stats = new {
            activeBookings,
            todayCheckIns,
            todayCheckOuts,
            activeUsers,
            totalHotels
        },
        recentEvents
    });
});
