namespace SmartStay.DTOs
{
    // RoomType DTOs
    public class RoomTypeDto
    {
        public Guid Id { get; set; }
        public Guid HotelId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CapacityAdults { get; set; }
        public int CapacityChildren { get; set; }
        public string? BedType { get; set; }
        public decimal? SizeSquareMeters { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateRoomTypeDto
    {
        public Guid HotelId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CapacityAdults { get; set; } = 2;
        public int CapacityChildren { get; set; } = 0;
        public string? BedType { get; set; }
        public decimal? SizeSquareMeters { get; set; }
    }

    public class UpdateRoomTypeDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? CapacityAdults { get; set; }
        public int? CapacityChildren { get; set; }
        public string? BedType { get; set; }
        public decimal? SizeSquareMeters { get; set; }
        public string? Status { get; set; }
    }
}
