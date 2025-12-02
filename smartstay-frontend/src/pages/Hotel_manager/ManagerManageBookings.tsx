import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";

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
  const [loading, setLoading] = useState(true);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [guestInfo, setGuestInfo] = useState<any>(null);


  const fetchBookings = async () => {
    if (!user?.hotelId) return;

    try {
      const res = await axios.get<Booking[]>(
        `https://localhost:7168/api/bookings/hotel/${user.hotelId}`
      );
      setBookings(res.data);
    } catch (err) {
      console.error("BOOKING ERROR:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.hotelId]);


  // ACTION BUTTONS (Future Logic)
  const updateStatus = async (bookingId: number, newStatus: string) => {
    try {
      await axios.put(
        `https://localhost:7168/api/bookings/${bookingId}/status`,
        newStatus,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      alert(`Booking updated to ${newStatus}!`);
      fetchBookings(); // refresh table
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err);
      alert("Failed to update booking.");
    }
  };

  async function openGuestProfile(guestId: string) {
    try {
      const res = await axios.get(
        `https://localhost:7168/api/bookings/guestinfo/${guestId}`
      );
      setGuestInfo(res.data);
      setShowGuestPopup(true);
    } catch (err) {
      console.error("Failed to fetch guest:", err);
    }
  }




  return (
    <div className="manager-bookings">
      <h2>Manage Bookings</h2>

      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table className="booking-table">
          <thead>
            <tr>
              <th>RoomID</th>
              <th>GuestID</th>
              <th>Room Type</th>
              <th>Dates(Duration)</th>
              <th>Total number of guest</th>
              <th>Total (RM)</th>
              <th>Status</th>
              <th>Created_DateTime</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => (
              <tr key={b.bookingID}>
                <td>{b.bookingID}</td>
                <td>
                  <button
                    onClick={() => openGuestProfile(b.guestID)}
                    style={{
                      background: "none",
                      color: "#007bff",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
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

                <td>{b.bookingStatus}</td>

                <td>
                  {new Date(b.createdAt).toLocaleString("en-GB", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  }).replace(",", "")}
                </td>

                <td>
                  <button
                    className="btn btn-confirm"
                    onClick={() => updateStatus(Number(b.bookingID), "Confirmed")}
                  >
                    Confirm
                  </button>

                  <button
                    className="btn btn-cancel"
                    onClick={() => updateStatus(Number(b.bookingID), "Cancelled")}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-checkin"
                    onClick={() => updateStatus(Number(b.bookingID), "CheckedIn")}
                  >
                    Check In
                  </button>

                  <button
                    className="btn btn-checkout"
                    onClick={() => updateStatus(Number(b.bookingID), "CheckedOut")}
                  >
                    Check Out
                  </button>


                </td>
              </tr>
            ))}
          </tbody>
        </table>


      )}
      {showGuestPopup && guestInfo && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "20px",
            width: "400px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ textAlign: "center" }}>Guest Profile</h3>

            <p><strong>Guest ID:</strong> {guestInfo.guestID}</p>
            <p><strong>Name:</strong> {guestInfo.fullName}</p>
            <p><strong>Email:</strong> {guestInfo.email}</p>
            <p><strong>Phone:</strong> {guestInfo.phoneNumber}</p>
            <p><strong>Address:</strong> {guestInfo.address}</p>


            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => setShowGuestPopup(false)}
                style={{
                  padding: "8px 20px",
                  background: "#007bff",
                  border: "none",
                  color: "white",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
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
