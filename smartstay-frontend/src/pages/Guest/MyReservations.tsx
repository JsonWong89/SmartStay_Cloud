import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config';

interface Reservation {
  bookingID: number;
  guestID: number;
  roomID: number;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: number;
  depositAmount: number;
  bookingStatus: string;
  createdAt: string;
}

const MyReservations: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/bookings/guest/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setReservations(data);
        } else {
          console.error('Failed to fetch reservations');
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user?.id]);

  const filteredReservations = reservations.filter((res) => {
    if (filterStatus === 'all') return true;
    return res.bookingStatus.toLowerCase() === filterStatus.toLowerCase();
  });

  const canCancelBooking = (booking: Reservation) => {
    const checkInDate = new Date(booking.checkInDate);
    const today = new Date();
    return booking.bookingStatus === 'Pending' || booking.bookingStatus === 'Confirmed' && checkInDate > today;
  };

  const canReviewBooking = (booking: Reservation) => {
    const checkOutDate = new Date(booking.checkOutDate);
    const today = new Date();
    return checkOutDate < today && (booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'Completed');
  };

  const handleCancelReservation = async (bookingId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation?\n\nNote: Your deposit is non-refundable.'
    );

    if (confirmed) {
      try {
        // TODO: Implement cancel booking API endpoint
        // const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, { method: 'PUT' });
        // if (response.ok) {
        setReservations((prev) =>
          prev.map((res) =>
            res.bookingID === bookingId ? { ...res, bookingStatus: 'Cancelled' } : res
          )
        );
        alert('Reservation cancelled successfully. Your deposit will not be refunded.');
        // }
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('Failed to cancel reservation. Please try again.');
      }
    }
  };

  const handleViewReceipt = (bookingId: number) => {
    // TODO: Implement receipt generation/view
    alert(`Receipt for booking #${bookingId} will be displayed/downloaded.\nReceipt will also be sent to ${user?.email}`);
  };

  const handleWriteReview = (bookingId: number) => {
    navigate(`/guest/review/${bookingId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'checked-in': 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[statusLower] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    const icons: Record<string, string> = {
      pending: '⏳',
      confirmed: '✓',
      'checked-in': '🏨',
      completed: '✓✓',
      cancelled: '✗',
    };
    return icons[statusLower] || '•';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📋 My Reservations</h1>
              <p className="text-sm text-gray-600">Manage your bookings</p>
            </div>
            <button
              onClick={() => navigate('/guest/dashboard')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Reservations
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterStatus('checked-in')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'checked-in'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Checked In
            </button>
            <button
              onClick={() => setFilterStatus('checked-out')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'checked-out'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Past Stays
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-xl text-gray-600">Loading your reservations...</div>
          </div>
        ) : (
          <>
            {/* Reservations List */}
            {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600">No reservations found</p>
            <button
              onClick={() => navigate('/guest/search')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
            >
              Search for Rooms
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div key={reservation.bookingID} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="md:flex">
                  {/* Visual Indicator */}
                  <div className="md:w-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl">
                    🏨
                  </div>

                  {/* Reservation Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{reservation.hotelName}</h3>
                        <p className="text-gray-600">{reservation.roomType}</p>
                        <p className="text-sm text-gray-500">Booking ID: #{reservation.bookingID}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                          reservation.bookingStatus
                        )}`}
                      >
                        {getStatusIcon(reservation.bookingStatus)} {reservation.bookingStatus.toUpperCase().replace('-', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="font-semibold">{reservation.checkInDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="font-semibold">{reservation.checkOutDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Guests</p>
                        <p className="font-semibold">{reservation.totalGuests} guest{reservation.totalGuests > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Total Price</p>
                        <p className="text-lg font-bold text-gray-800">${reservation.totalAmount}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Deposit Paid</p>
                        <p className="text-lg font-bold text-blue-600">${reservation.depositAmount}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewReceipt(reservation.bookingID)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm transition"
                      >
                        📄 View Receipt
                      </button>

                      {canCancelBooking(reservation) && (
                        <button
                          onClick={() => handleCancelReservation(reservation.bookingID)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition"
                        >
                          ✗ Cancel Booking
                        </button>
                      )}

                      {canReviewBooking(reservation) && (
                        <button
                          onClick={() => handleWriteReview(reservation.bookingID)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm transition"
                        >
                          ⭐ Write Review
                        </button>
                      )}

                      {reservation.bookingStatus === 'Confirmed' && (
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition">
                          ℹ️ Modify Booking
                        </button>
                      )}
                    </div>

                    {reservation.bookingStatus.toLowerCase() === 'cancelled' && (
                      <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-3">
                        <p className="text-sm text-red-700">
                          This reservation was cancelled. Deposit of ${reservation.depositAmount} was not refunded.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Card */}
        {reservations.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {reservations.filter((r) => r.bookingStatus.toLowerCase() === 'confirmed' || r.bookingStatus.toLowerCase() === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {reservations.filter((r) => r.bookingStatus.toLowerCase() === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {reservations.filter((r) => r.bookingStatus.toLowerCase() === 'cancelled').length}
                </p>
                <p className="text-sm text-gray-600">Cancelled</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{reservations.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
