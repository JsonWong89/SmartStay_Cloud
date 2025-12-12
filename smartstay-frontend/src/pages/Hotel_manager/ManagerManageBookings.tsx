import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";
import { API_BASE_URL } from "../../config/api";
import "../../styles/bookings.css";
import "../../styles/modals.css";

interface Booking {
  bookingID: string;
  guestID: string;
  roomID: number;
  roomType: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: number;
  depositAmount: number;
  bookingStatus: string;
  createdAt: string;
}

export default function ManagerManageBookings() {
  const user = useAuthStore((s) => s.user);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // UI Filters
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  // Guest modal
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [guestInfo, setGuestInfo] = useState<any>(null);

  const fetchBookings = async () => {
    if (!user?.hotelId) {
      console.log("No hotelId for fetching bookings");
      return;
    }

    try {
      // Backend GET /api/bookings returns all bookings
      const res = await axios.get<any[]>(
        `${API_BASE_URL}/api/bookings`
      );

      console.log("All bookings:", res.data);

      // Filter bookings by current hotel
      const hotelBookings = res.data.filter((booking: any) =>
        (booking.hotelID || booking.HotelID) === user.hotelId
      );

      console.log(`Filtered ${hotelBookings.length} bookings for hotel ${user.hotelId}`);

      // Map to match Booking interface
      const mappedBookings = hotelBookings.map((b: any) => ({
        bookingID: String(b.bookingID || b.BookingID),
        guestID: b.guestID || b.GuestID,
        roomID: b.roomID || b.RoomID,
        roomType:
          b.roomType ||
          b.RoomType ||
          b.room?.roomType ||
          b.room?.RoomType ||
          b.Room?.roomType ||
          b.Room?.RoomType ||
          "",
        hotelName: b.hotelName || b.HotelName || "",
        checkInDate: b.checkInDate || b.CheckInDate,
        checkOutDate: b.checkOutDate || b.CheckOutDate,
        totalGuests: b.totalGuests || b.TotalGuests || 0,
        totalAmount: b.totalAmount || b.TotalAmount || 0,
        depositAmount: b.depositAmount || b.DepositAmount || 0,
        bookingStatus: b.bookingStatus || b.BookingStatus || "Pending",
        createdAt: b.createdAt || b.CreatedAt,
      }));

      setBookings(mappedBookings);
      setFilteredBookings(mappedBookings);
    } catch (err) {
      console.error("BOOKING ERROR:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.hotelId]);

  // 🔢 KPI COUNTS
  const totalBookings = bookings.length;
  const checkedInCount = bookings.filter(
    (b) => b.bookingStatus === "CheckedIn"
  ).length;
  const checkedOutCount = bookings.filter(
    (b) => b.bookingStatus === "CheckedOut"
  ).length;

  // 🔍 FILTER + SEARCH LOGIC
  useEffect(() => {
    let data = [...bookings];
    const s = search.toLowerCase();

    // TEXT SEARCH ACROSS MULTIPLE FIELDS
    if (s !== "") {
      data = data.filter((b) => {
        const fields = [
          b.bookingID,
          b.guestID,
          b.roomType,
          b.bookingStatus,
          b.totalAmount,
        ];
        return fields.some((f) => String(f ?? "").toLowerCase().includes(s));
      });
    }

    // FILTER YEAR + MONTH (by createdAt)
    if (filterYear || filterMonth) {
      data = data.filter((b) => {
        const date = b.createdAt.split("T")[0]; // 2025-11-14
        const [year, month] = date.split("-");

        if (filterYear && year !== filterYear) return false;
        if (filterMonth && month !== filterMonth) return false;

        return true;
      });
    }

    setFilteredBookings(data);
  }, [bookings, search, filterYear, filterMonth]);

  //  Update Booking Status
  async function updateStatus(id: number, newStatus: string) {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/bookings/${id}/status`,
        JSON.stringify(newStatus),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("Booking status updated!");

      //Refresh the booking table immediately after update
      fetchBookings();

      console.log(res.data);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Failed to update booking status");
    }
  }



  //  Guest Popup
  async function openGuestProfile(guestId: string) {
    try {
      const res = await axios.get<any>(
        `${API_BASE_URL}/api/guests/${guestId}?hotelId=${user?.hotelId}`
      );

      setGuestInfo(res.data.data); // ✔ pick the 'data' object from response  
      setShowGuestPopup(true);
    } catch (err) {
      console.error("Failed to fetch guest:", err);
      alert("Failed to load guest information");
    }
  }


  return (
    <div className="manager-bookings fade-in">
      <h2 className="page-title">Manage Bookings</h2>

      {/* TOP KPI CARDS (same style as rooms/staff) */}
      <div className="kpi-row">
        <div className="kpi-card available">
          <h4>Total Bookings</h4>
          <p>{totalBookings}</p>
        </div>

        <div className="kpi-card occupied">
          <h4>Checked In</h4>
          <p>{checkedInCount}</p>
        </div>

        <div className="kpi-card maintenance">
          <h4>Checked Out</h4>
          <p>{checkedOutCount}</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="booking-filters">
        <input
          className="search-bar"
          placeholder="Search booking ID, guest ID, room type, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* YEAR FILTER */}
        <select
          className="filter-select"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">Year</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>

        {/* MONTH FILTER */}
        <select
          className="filter-select"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">Month</option>
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <p>No bookings match your search/filter.</p>
      ) : (
        <table className="booking-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest</th>
              <th>Room Type</th>
              <th>Check-In → Check-Out</th>
              <th>Guests</th>
              <th>Total (RM)</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.bookingID}>
                <td>{b.bookingID}</td>

                <td>
                  <button
                    className="guest-link"
                    onClick={() => openGuestProfile(b.guestID)}
                  >
                    {b.guestID}
                  </button>
                </td>

                <td>{b.roomType}</td>

                <td>
                  {b.checkInDate.split("T")[0]} → {b.checkOutDate.split("T")[0]}
                </td>

                <td>{b.totalGuests}</td>

                <td>{b.totalAmount}</td>

                <td>
                  <span
                    className={`status-badge ${b.bookingStatus.toLowerCase()}`}
                  >
                    {b.bookingStatus}
                  </span>
                </td>

                <td>
                  {new Date(b.createdAt).toLocaleString("en-GB").replace(",", "")}
                </td>




              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* GUEST POPUP */}
      {showGuestPopup && guestInfo && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 className="modal-title">Guest Profile</h3>

            <p>
              <strong>ID:</strong> {guestInfo.guestId}
            </p>
            <p>
              <strong>Name:</strong> {guestInfo.fullName}
            </p>
            <p>
              <strong>Email:</strong> {guestInfo.email}
            </p>
            <p>
              <strong>Phone:</strong> {guestInfo.phoneNumber}
            </p>
            <p>
              <strong>Address:</strong> {guestInfo.address}
            </p>

            <div className="modal-actions">
              <button
                className="btn add"
                onClick={() => setShowGuestPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
