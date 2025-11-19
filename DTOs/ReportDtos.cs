namespace SmartStay.DTOs
{
    // Report DTOs
    public class DailyMetricDto
    {
        public Guid HotelId { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int RoomsAvailable { get; set; }
        public int RoomsSold { get; set; }
        public decimal OccupancyPercent { get; set; }
        public decimal AverageDailyRate { get; set; }
        public decimal RevenueTotalRooms { get; set; }
        public int BookingsCount { get; set; }
        public int CancellationsCount { get; set; }
    }

    public class RevenueReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalBookings { get; set; }
        public decimal AverageBookingValue { get; set; }
        public List<HotelRevenueDto> HotelBreakdown { get; set; } = new();
    }

    public class HotelRevenueDto
    {
        public Guid HotelId { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int BookingsCount { get; set; }
    }

    public class BookingReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int CanceledBookings { get; set; }
        public decimal CancellationRate { get; set; }
        public List<BookingSummaryDto> RecentBookings { get; set; } = new();
    }

    public class BookingSummaryDto
    {
        public string BookingNumber { get; set; } = string.Empty;
        public string HotelName { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }
}
