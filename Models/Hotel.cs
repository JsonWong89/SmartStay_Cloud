namespace SmartStay.Models
{
    public class Hotel
    {
        public int HotelID { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? City { get; set; }
        public int? ManagerID { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<RoomType> RoomTypes { get; set; } = new List<RoomType>();
        public ICollection<RatePlan> RatePlans { get; set; } = new List<RatePlan>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<DailyMetric> DailyMetrics { get; set; } = new List<DailyMetric>();
    }
}
