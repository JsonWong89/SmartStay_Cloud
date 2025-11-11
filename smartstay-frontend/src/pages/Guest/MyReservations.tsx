import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

interface Reservation {
  id: number;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  depositPaid: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  bookingDate: string;
  canCancel: boolean;
  canReview: boolean;
}

const MyReservations: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Mock reservations data - replace with API call
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 1,
      hotelName: 'Grand Plaza Hotel',
      roomType: 'Deluxe Double',
      checkInDate: '2025-11-20',
      checkOutDate: '2025-11-25',
      guests: 2,
      totalPrice: 900,
      depositPaid: 180,
      status: 'confirmed',
      bookingDate: '2025-11-10',
      canCancel: true,
      canReview: false,
    },
    {
      id: 2,
      hotelName: 'Seaside Resort',
      roomType: 'Ocean View Suite',
      checkInDate: '2025-11-15',
      checkOutDate: '2025-11-18',
      guests: 2,
      totalPrice: 750,
      depositPaid: 150,
      status: 'checked-out',
      bookingDate: '2025-11-01',
      canCancel: false,
      canReview: true,
    },
    {
      id: 3,
      hotelName: 'City Center Inn',
      roomType: 'Standard Single',
      checkInDate: '2025-10-10',
      checkOutDate: '2025-10-12',
      guests: 1,
      totalPrice: 160,
      depositPaid: 32,
      status: 'cancelled',
      bookingDate: '2025-10-01',
      canCancel: false,
      canReview: false,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredReservations = reservations.filter((res) => {
    if (filterStatus === 'all') return true;
    return res.status === filterStatus;
  });

  const handleCancelReservation = (reservationId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation?\n\nNote: Your deposit is non-refundable.'
    );

    if (confirmed) {
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: 'cancelled' as const, canCancel: false } : res
        )
      );
      alert('Reservation cancelled successfully. Your deposit will not be refunded.');
    }
  };

  const handleViewReceipt = (reservationId: number) => {
    // In real implementation, this would fetch and display the actual receipt
    alert(`Receipt for reservation #${reservationId} will be displayed/downloaded.\nReceipt will also be sent to ${user?.email}`);
  };

  const handleWriteReview = (reservationId: number) => {
    navigate(`/guest/review/${reservationId}`);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: 'bg-blue-100 text-blue-800',
      'checked-in': 'bg-green-100 text-green-800',
      'checked-out': 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      confirmed: '✓',
      'checked-in': '🏨',
      'checked-out': '✓✓',
      cancelled: '✗',
    };
    return icons[status as keyof typeof icons] || '•';
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
              <div key={reservation.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
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
                        <p className="text-sm text-gray-500">Booking ID: #{reservation.id}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                          reservation.status
                        )}`}
                      >
                        {getStatusIcon(reservation.status)} {reservation.status.toUpperCase().replace('-', ' ')}
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
                        <p className="font-semibold">{reservation.guests} guest{reservation.guests > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Total Price</p>
                        <p className="text-lg font-bold text-gray-800">${reservation.totalPrice}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Deposit Paid</p>
                        <p className="text-lg font-bold text-blue-600">${reservation.depositPaid}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewReceipt(reservation.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm transition"
                      >
                        📄 View Receipt
                      </button>

                      {reservation.canCancel && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition"
                        >
                          ✗ Cancel Booking
                        </button>
                      )}

                      {reservation.canReview && (
                        <button
                          onClick={() => handleWriteReview(reservation.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm transition"
                        >
                          ⭐ Write Review
                        </button>
                      )}

                      {reservation.status === 'confirmed' && (
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition">
                          ℹ️ Modify Booking
                        </button>
                      )}
                    </div>

                    {reservation.status === 'cancelled' && (
                      <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-3">
                        <p className="text-sm text-red-700">
                          This reservation was cancelled. Deposit of ${reservation.depositPaid} was not refunded.
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
                  {reservations.filter((r) => r.status === 'confirmed').length}
                </p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {reservations.filter((r) => r.status === 'checked-out').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {reservations.filter((r) => r.status === 'cancelled').length}
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
      </div>
    </div>
  );
};

export default MyReservations;
