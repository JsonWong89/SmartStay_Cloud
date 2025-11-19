namespace SmartStay.DTOs
{
    // RatePlan DTOs
    public class RatePlanDto
    {
        public Guid Id { get; set; }
        public Guid HotelId { get; set; }
        public Guid RoomTypeId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public string Currency { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int MinStay { get; set; }
        public int? MaxStay { get; set; }
        public string Status { get; set; } = string.Empty;
        public string RoomTypeName { get; set; } = string.Empty;
    }

    public class CreateRatePlanDto
    {
        public Guid HotelId { get; set; }
        public Guid RoomTypeId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int MinStay { get; set; } = 1;
        public int? MaxStay { get; set; }
    }

    public class UpdateRatePlanDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? BasePrice { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? MinStay { get; set; }
        public int? MaxStay { get; set; }
        public string? Status { get; set; }
    }
}
