using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagementAPI.Models;

namespace HotelManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly HotelDbContext _context;

        public BookingsController(HotelDbContext context)
        {
            _context = context;
        }

        // GET: api/bookings/guest/{guestId}
        [HttpGet("guest/{guestId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetGuestBookings(int guestId)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Where(b => b.GuestID == guestId)
                    .Join(_context.Rooms,
                        booking => booking.RoomID,
                        room => room.RoomID,
                        (booking, room) => new
                        {
                            bookingID = booking.BookingID,
                            guestID = booking.GuestID,
                            roomID = booking.RoomID,
                            hotelName = room.Hotel.HotelName, // Assuming Room has Hotel navigation
                            roomType = room.RoomType,
                            roomImageUrl = room.ImageUrl, // Include room image
                            checkInDate = booking.CheckInDate.ToString("yyyy-MM-dd"),
                            checkOutDate = booking.CheckOutDate.ToString("yyyy-MM-dd"),
                            totalGuests = booking.TotalGuests,
                            totalAmount = booking.TotalAmount,
                            depositAmount = booking.DepositAmount,
                            bookingStatus = booking.BookingStatus,
                            createdAt = booking.CreatedAt
                        })
                    .OrderByDescending(b => b.createdAt)
                    .ToListAsync();

                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching bookings", error = ex.Message });
            }
        }

        // GET: api/bookings/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetBooking(int id)
        {
            try
            {
                var booking = await _context.Bookings
                    .Where(b => b.BookingID == id)
                    .Join(_context.Rooms,
                        b => b.RoomID,
                        r => r.RoomID,
                        (b, r) => new
                        {
                            bookingID = b.BookingID,
                            guestID = b.GuestID,
                            roomID = b.RoomID,
                            hotelName = r.Hotel.HotelName,
                            roomType = r.RoomType,
                            roomImageUrl = r.ImageUrl, // Include room image
                            checkInDate = b.CheckInDate.ToString("yyyy-MM-dd"),
                            checkOutDate = b.CheckOutDate.ToString("yyyy-MM-dd"),
                            totalGuests = b.TotalGuests,
                            totalAmount = b.TotalAmount,
                            depositAmount = b.DepositAmount,
                            bookingStatus = b.BookingStatus,
                            createdAt = b.CreatedAt
                        })
                    .FirstOrDefaultAsync();

                if (booking == null)
                {
                    return NotFound(new { message = "Booking not found" });
                }

                return Ok(booking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching booking", error = ex.Message });
            }
        }

        // POST: api/bookings
        [HttpPost]
        public async Task<ActionResult<object>> CreateBooking([FromBody] Booking booking)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                booking.CreatedAt = DateTime.UtcNow;
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetBooking), new { id = booking.BookingID }, booking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating booking", error = ex.Message });
            }
        }

        // PUT: api/bookings/{id}/cancel
        [HttpPut("{id}/cancel")]
        public async Task<ActionResult> CancelBooking(int id)
        {
            try
            {
                var booking = await _context.Bookings.FindAsync(id);
                if (booking == null)
                {
                    return NotFound(new { message = "Booking not found" });
                }

                booking.BookingStatus = "Cancelled";
                await _context.SaveChangesAsync();

                return Ok(new { message = "Booking cancelled successfully", bookingID = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error cancelling booking", error = ex.Message });
            }
        }
    }
}
