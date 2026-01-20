import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config';
import GuestNavbar from '../../components/GuestNavbar';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

interface Reservation {
  bookingID: number;
  guestID: number;
  roomID: number;
  hotelName: string;
  roomType: string;
  imageUrl?: string;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedBookingId = searchParams.get('bookingId');
  const bookingRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast, showSuccess, showError, hideToast } = useToast();

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/guest/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Reservations data:', data);
          // Handle both wrapped and unwrapped responses
          const bookings = data.data || data;
          const bookingsArray = Array.isArray(bookings) ? bookings : [];

          const mappedReservations = bookingsArray.map((r: any) => ({
            bookingID: r.bookingID || r.BookingID || r.id || r.Id,
            guestID: r.guestID || r.GuestID,
            roomID: r.roomID || r.RoomID,
            hotelName: r.hotelName || r.HotelName,
            roomType: r.roomType || r.RoomType,
            imageUrl: r.imageUrl || r.ImageUrl || r.imageURL || r.ImageURL,
            checkInDate: r.checkInDate || r.CheckInDate,
            checkOutDate: r.checkOutDate || r.CheckOutDate,
            totalGuests: r.totalGuests || r.TotalGuests,
            totalAmount: r.totalAmount || r.TotalAmount,
            depositAmount: r.depositAmount || r.DepositAmount,
            bookingStatus: r.bookingStatus || r.BookingStatus,
            createdAt: r.createdAt || r.CreatedAt
          }));

          setReservations(mappedReservations);
        } else {
          console.error('Failed to fetch reservations:', response.status);
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user?.id]);

  // Scroll to highlighted booking after reservations load
  useEffect(() => {
    if (highlightedBookingId && !loading && reservations.length > 0) {
      const bookingId = parseInt(highlightedBookingId);
      const element = bookingRefs.current[bookingId];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Clear the query param after scrolling
          setTimeout(() => setSearchParams({}), 2000);
        }, 100);
      }
    }
  }, [highlightedBookingId, loading, reservations, setSearchParams]);

  const filteredReservations = reservations.filter((res) => {
    if (filterStatus === 'all') {
      // 'All' means all bookings regardless of status
      return true;
    }
    if (filterStatus === 'confirmed') {
      return res.bookingStatus === 'Confirmed';
    }
    if (filterStatus === 'checkedin') {
      return res.bookingStatus === 'CheckedIn';
    }
    if (filterStatus === 'checkedout') {
      return res.bookingStatus === 'CheckedOut';
    }
    if (filterStatus === 'cancelled') {
      return res.bookingStatus === 'Cancelled';
    }
    return res.bookingStatus.toLowerCase() === filterStatus.toLowerCase();
  });

  const canCancelBooking = (booking: Reservation) => {
    return booking.bookingStatus === 'Confirmed';
  };

  const canReviewBooking = (booking: Reservation) => {
    const checkOutDate = new Date(booking.checkOutDate);
    const today = new Date();
    // Can only review CheckedOut bookings after check-out
    return checkOutDate < today && booking.bookingStatus === 'CheckedOut';
  };

  const handleCancelReservation = async (bookingId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation?\n\nIMPORTANT: Your deposit is non-refundable and will not be returned.'
    );

    if (confirmed) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Cancellation failed' }));
          throw new Error(errorData.message || 'Failed to cancel reservation');
        }

        const result = await response.json();

        // Update local state
        setReservations((prev) =>
          prev.map((res) =>
            res.bookingID === bookingId ? { ...res, bookingStatus: 'Cancelled' } : res
          )
        );

        showSuccess('✅ Reservation cancelled successfully. Note: Your deposit is non-refundable.');
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        showError(error instanceof Error ? `❌ ${error.message}` : '❌ Failed to cancel reservation. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewReceipt = (bookingId: number) => {
    navigate(`/guest/receipt/${bookingId}`);
  };

  const handleWriteReview = (bookingId: number) => {
    navigate(`/guest/review/${bookingId}`);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      Confirmed: 'bg-blue-100 text-blue-800',
      CheckedIn: 'bg-green-100 text-green-800',
      CheckedOut: 'bg-purple-100 text-purple-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      Confirmed: '✓',
      CheckedIn: '🏨',
      CheckedOut: '✅',
      Cancelled: '✗',
    };
    return icons[status] || '•';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">My Reservations</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and track all your bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All Reservations
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === 'confirmed'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterStatus('checkedin')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === 'checkedin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Checked In
            </button>
            <button
              onClick={() => setFilterStatus('checkedout')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === 'checkedout'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Checked Out
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === 'cancelled'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
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
                {filteredReservations.map((reservation) => {
                  const isHighlighted = highlightedBookingId === String(reservation.bookingID);
                  return (
                    <div
                      key={reservation.bookingID}
                      ref={(el) => {
                        if (el) bookingRefs.current[reservation.bookingID] = el;
                      }}
                      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition ${isHighlighted ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                        }`}
                      style={isHighlighted ? { animation: 'pulse 2s ease-in-out' } : undefined}
                    >
                      <div className="md:flex">
                        {/* Room Image */}
                        <div className="md:w-48 h-48 md:h-auto">
                          {reservation.imageUrl ? (
                            <img
                              src={reservation.imageUrl}
                              alt={reservation.roomType}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl">
                              🏨
                            </div>
                          )}
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
                              <p className="font-semibold">{new Date(reservation.checkInDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Check-out</p>
                              <p className="font-semibold">{new Date(reservation.checkOutDate).toLocaleDateString()}</p>
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
                              View Receipt
                            </button>

                            {canCancelBooking(reservation) && (
                              <button
                                onClick={() => handleCancelReservation(reservation.bookingID)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition"
                              >
                                Cancel Booking
                              </button>
                            )}

                            {canReviewBooking(reservation) && (
                              <button
                                onClick={() => handleWriteReview(reservation.bookingID)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"
                              >
                                Write Review
                              </button>
                            )}
                          </div>

                          {/* Status Messages */}
                          {reservation.bookingStatus.toLowerCase() === 'confirmed' && (
                            <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3">
                              <p className="text-sm text-yellow-700">
                                ⏳ <strong>Payment Received:</strong> Your deposit has been paid. Please check in on {reservation.checkInDate} to complete your payment.
                              </p>
                            </div>
                          )}

                          {reservation.bookingStatus.toLowerCase() === 'checkedout' && (
                            <div className="mt-3 bg-green-50 border-l-4 border-green-400 p-3">
                              <p className="text-sm text-green-700">
                                ✓ <strong>Stay Completed:</strong> Thank you for choosing SmartStay! We hope you enjoyed your stay.
                              </p>
                            </div>
                          )}

                          {reservation.bookingStatus.toLowerCase() === 'cancelled' && (
                            <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-3">
                              <p className="text-sm text-red-700">
                                ✗ <strong>Cancelled:</strong> This reservation was cancelled. Your deposit of ${reservation.depositAmount} is non-refundable.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      <ToastContainer toast={toast} onClose={hideToast} />
    </div>
  );
}; export default MyReservations;
