namespace SmartStay.Models
{
    public class Booking
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid HotelId { get; set; }
        public Guid RoomTypeId { get; set; }
        public Guid? RatePlanId { get; set; }
        public string BookingNumber { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, CheckedIn, CheckedOut, Canceled
        public string GuestName { get; set; } = string.Empty;
        public string? GuestEmail { get; set; }
        public string? GuestPhone { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int Nights { get; set; }
        public int Rooms { get; set; } = 1;
        public int Adults { get; set; } = 1;
        public int Children { get; set; } = 0;
        public decimal Subtotal { get; set; }
        public decimal Taxes { get; set; } = 0;
        public decimal Total { get; set; }
        public string Currency { get; set; } = "USD";
        public string Channel { get; set; } = "Direct"; // Direct, OTA, Manual
        public Guid? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Hotel Hotel { get; set; } = null!;
        public RoomType RoomType { get; set; } = null!;
        public RatePlan? RatePlan { get; set; }
        public User? Creator { get; set; }
    }
}
