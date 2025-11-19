namespace SmartStay.Models
{
    public class DailyMetric
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid HotelId { get; set; }
        public DateTime Date { get; set; }
        public int RoomsAvailable { get; set; }
        public int RoomsSold { get; set; }
        public decimal OccupancyPercent { get; set; }
        public decimal AverageDailyRate { get; set; }
        public decimal RevenueTotalRooms { get; set; }
        public int BookingsCount { get; set; } = 0;
        public int CancellationsCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Hotel Hotel { get; set; } = null!;
    }
}
