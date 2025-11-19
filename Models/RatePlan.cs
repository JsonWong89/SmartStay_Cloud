namespace SmartStay.Models
{
    public class RatePlan
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid HotelId { get; set; }
        public Guid RoomTypeId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int MinStay { get; set; } = 1;
        public int? MaxStay { get; set; }
        public string Status { get; set; } = "Active"; // Active, Inactive
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Hotel Hotel { get; set; } = null!;
        public RoomType RoomType { get; set; } = null!;
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
