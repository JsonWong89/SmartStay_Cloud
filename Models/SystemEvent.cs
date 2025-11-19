namespace SmartStay.Models
{
    public class SystemEvent
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Level { get; set; } = "Info"; // Info, Warning, Error
        public string Source { get; set; } = string.Empty; // API, Worker, Database
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; } // JSON
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
