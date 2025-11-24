namespace SmartStay.Models
{
    public class User
    {
        // Option A: INT identity primary key (matches new Users table)
        public int UserID { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "Manager"; // Admin, Manager
        public int? HotelID { get; set; } // Optional association if a manager belongs to a hotel
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation collections
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}
