// Add these Hotel endpoints to your Program.cs

// GET all hotels
api.MapGet("/hotels", async (AppDbContext db) =>
{
    var hotels = await db.Hotels
        .AsNoTracking()
        .Select(h => new
        {
            h.HotelID,
            h.HotelName,
            h.Address,
            h.City,
            h.ManagerID,
            h.CreatedAt
        })
        .ToListAsync();
    
    return Results.Ok(hotels);
});

// GET hotel by ID
api.MapGet("/hotels/{id:int}", async (int id, AppDbContext db) =>
{
    var hotel = await db.Hotels
        .AsNoTracking()
        .Where(h => h.HotelID == id)
        .Select(h => new
        {
            h.HotelID,
            h.HotelName,
            h.Address,
            h.City,
            h.ManagerID,
            h.CreatedAt
        })
        .FirstOrDefaultAsync();
    
    return hotel is not null ? Results.Ok(hotel) : Results.NotFound();
});

// POST create new hotel
api.MapPost("/hotels", async (HotelCreateDto dto, AppDbContext db) =>
{
    var hotel = new Hotel
    {
        HotelName = dto.HotelName,
        Address = dto.Address,
        City = dto.City,
        ManagerID = dto.ManagerID,
        CreatedAt = DateTime.UtcNow
    };

    db.Hotels.Add(hotel);
    await db.SaveChangesAsync();

    return Results.Created($"/api/hotels/{hotel.HotelID}", new
    {
        hotel.HotelID,
        hotel.HotelName,
        hotel.Address,
        hotel.City,
        hotel.ManagerID,
        hotel.CreatedAt
    });
});

// DELETE hotel
api.MapDelete("/hotels/{id:int}", async (int id, AppDbContext db) =>
{
    var hotel = await db.Hotels.FindAsync(id);
    if (hotel is null) return Results.NotFound();

    db.Hotels.Remove(hotel);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = "Hotel deleted successfully" });
});

// DTO for creating hotels
public record HotelCreateDto(
    string HotelName,
    string? Address,
    string? City,
    int? ManagerID
);
