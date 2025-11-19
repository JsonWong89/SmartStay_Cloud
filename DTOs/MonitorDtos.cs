namespace SmartStay.DTOs
{
    // Monitor DTOs
    public class SystemHealthDto
    {
        public string Status { get; set; } = "Healthy"; // Healthy, Degraded, Unhealthy
        public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
        public DatabaseHealthDto Database { get; set; } = new();
        public SystemStatsDto Stats { get; set; } = new();
        public List<SystemEventDto> RecentEvents { get; set; } = new();
    }

    public class DatabaseHealthDto
    {
        public bool IsConnected { get; set; }
        public int ResponseTimeMs { get; set; }
        public int ActiveConnections { get; set; }
    }

    public class SystemStatsDto
    {
        public int ActiveBookings { get; set; }
        public int TodayCheckIns { get; set; }
        public int TodayCheckOuts { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalHotels { get; set; }
    }

    public class SystemEventDto
    {
        public Guid Id { get; set; }
        public string Level { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class AuditLogDto
    {
        public Guid Id { get; set; }
        public string? UserEmail { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string? Changes { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
