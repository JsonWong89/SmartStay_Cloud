namespace SmartStay.Models
{
    public class Hotel
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = "Active"; // Active, Inactive
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
        public string? PostalCode { get; set; }
        public string Timezone { get; set; } = "UTC";
        public string Currency { get; set; } = "USD";
        public TimeSpan CheckInTime { get; set; } = new TimeSpan(15, 0, 0);
        public TimeSpan CheckOutTime { get; set; } = new TimeSpan(11, 0, 0);
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<HotelManager> HotelManagers { get; set; } = new List<HotelManager>();
        public ICollection<RoomType> RoomTypes { get; set; } = new List<RoomType>();
        public ICollection<RatePlan> RatePlans { get; set; } = new List<RatePlan>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<DailyMetric> DailyMetrics { get; set; } = new List<DailyMetric>();
    }
}
