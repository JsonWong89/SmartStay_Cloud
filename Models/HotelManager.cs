namespace SmartStay.Models
{
    public class HotelManager
    {
        public int UserID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }
        public string Role { get; set; } = "Manager";
        public int? HotelID { get; set; }
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
