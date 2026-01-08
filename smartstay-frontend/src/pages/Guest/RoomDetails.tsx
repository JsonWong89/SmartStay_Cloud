import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config/api';
import GuestNavbar from '../../components/GuestNavbar';

interface RoomDetail {
  id: number;
  hotelName: string;
  roomType: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  city?: string;
  description?: string;
  roomNumber?: string;
  hotelID?: number;
}

const RoomDetails: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const user = useAuthStore((state) => state.user);

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch room details');
        }

        const data = await response.json();
        const normalizedRoom: RoomDetail = {
          id: data.id || data.RoomID || data.RoomId,
          hotelName: data.hotelName || data.HotelName,
          roomType: data.roomType || data.RoomType,
          price: data.price || data.Price || data.pricePerNight || data.PricePerNight,
          available: data.available || data.Available || data.isAvailable || data.IsAvailable,
          imageUrl: data.imageUrl || data.ImageUrl || data.imageURL || data.ImageURL,
          city: data.city || data.City || data.location || data.Location,
          description: data.description || data.Description,
          roomNumber: data.roomNumber || data.RoomNumber,
          hotelID: data.hotelID || data.HotelID
        };
        setRoom(normalizedRoom);
      } catch (err) {
        console.error('API Error:', err);
        setError('Could not load room details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  const handleBookNow = () => {
    if (!user) {
      alert('Please login to book a room');
      navigate('/login');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    // Validation: No past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn < today) {
      alert('Check-in date cannot be in the past. Please select today or a future date.');
      return;
    }

    // Validation: Check-out must be after check-in
    if (checkOut <= checkIn) {
      alert('Check-out date must be at least one day after check-in date.');
      return;
    }

    // Validation: Max booking window (1 year in advance)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (checkIn > oneYearFromNow) {
      alert('Bookings can only be made up to 1 year in advance.');
      return;
    }

    navigate(`/guest/booking/${roomId}?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GuestNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GuestNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-xl text-red-600 font-semibold">⚠️ {error || 'Room not found'}</p>
            <button
              onClick={() => navigate('/guest/search')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/guest/search')}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <span className="mr-2">←</span> Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Room Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="h-96 bg-gray-200 flex items-center justify-center">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl}
                    alt={room.roomType}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-9xl">🛏️</div>
                )}
              </div>
            </div>

            {/* Room Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.roomType}</h1>
                  <p className="text-xl text-gray-600">{room.hotelName}</p>
                  {room.city && (
                    <p className="text-gray-500 mt-2 flex items-center">
                      <span className="mr-2">📍</span>
                      {room.city}
                    </p>
                  )}
                  {room.roomNumber && (
                    <p className="text-gray-500 mt-1">
                      Room Number: <span className="font-semibold">{room.roomNumber}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-blue-600">RM{room.price}</p>
                  <p className="text-gray-500">per night</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${room.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {room.available ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>

              {room.description && (
                <div className="border-t pt-4 mt-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-600 leading-relaxed">{room.description}</p>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">📶</span> Free WiFi
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">❄️</span> Air Conditioning
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">📺</span> Flat Screen TV
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">🚿</span> Private Bathroom
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">🧴</span> Toiletries
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">🔒</span> Safe Box
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Book This Room</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate ? new Date(new Date(checkInDate).setDate(new Date(checkInDate).getDate() + 1)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} Guest{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {checkInDate && checkOutDate && (
                <div className="bg-gray-50 rounded-md p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Price per night:</span>
                    <span className="font-semibold">RM{room.price}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Number of nights:</span>
                    <span className="font-semibold">
                      {Math.ceil(
                        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        $
                        {room.price *
                          Math.ceil(
                            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookNow}
                disabled={!room.available || !checkInDate || !checkOutDate}
                className={`w-full py-3 px-4 rounded-md font-semibold transition ${room.available && checkInDate && checkOutDate
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {room.available ? 'Book Now' : 'Not Available'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Free cancellation within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
