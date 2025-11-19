namespace SmartStay.Models
{
    public class AuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? UserId { get; set; }
        public string Action { get; set; } = string.Empty; // Create, Update, Delete
        public string EntityType { get; set; } = string.Empty; // User, Hotel, RoomType, etc.
        public string? EntityId { get; set; }
        public string? Changes { get; set; } // JSON
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
    }
}
