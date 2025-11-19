namespace SmartStay.Models
{
    public class RoomType
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid HotelId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CapacityAdults { get; set; } = 2;
        public int CapacityChildren { get; set; } = 0;
        public string? BedType { get; set; }
        public decimal? SizeSquareMeters { get; set; }
        public string Status { get; set; } = "Active"; // Active, Inactive
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Hotel Hotel { get; set; } = null!;
        public ICollection<RatePlan> RatePlans { get; set; } = new List<RatePlan>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
