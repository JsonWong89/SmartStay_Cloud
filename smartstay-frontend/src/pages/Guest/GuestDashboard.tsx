import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config';

interface RecentBooking {
  bookingID: number;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  bookingStatus: string;
  depositAmount: number;
}

interface Hotel {
  hotelID: number;
  hotelName: string;
  location: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
}

const GuestDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelsLoading, setHotelsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/bookings/guest/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          // Get the 3 most recent bookings
          setRecentBookings(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching recent bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBookings();
  }, [user?.id]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/hotels`);
        if (response.ok) {
          const data = await response.json();
          // Get first 3 hotels for featured section
          setHotels(data.slice(0, 3));
        } else {
          // Fallback to mock data if API endpoint doesn't exist yet
          setHotels([
            {
              hotelID: 1,
              hotelName: 'Grand Plaza Hotel',
              location: 'New York, USA',
              description: 'Luxury 5-star hotel in the heart of Manhattan with stunning city views',
              imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
              rating: 4.8
            },
            {
              hotelID: 2,
              hotelName: 'Seaside Resort',
              location: 'Miami Beach, USA',
              description: 'Beachfront paradise with world-class amenities and ocean views',
              imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
              rating: 4.6
            },
            {
              hotelID: 3,
              hotelName: 'Mountain View Lodge',
              location: 'Aspen, USA',
              description: 'Cozy mountain retreat perfect for ski enthusiasts and nature lovers',
              imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
              rating: 4.7
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
        // Use mock data on network error
        setHotels([
          {
            hotelID: 1,
            hotelName: 'Grand Plaza Hotel',
            location: 'New York, USA',
            description: 'Luxury 5-star hotel in the heart of Manhattan with stunning city views',
            imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            rating: 4.8
          },
          {
            hotelID: 2,
            hotelName: 'Seaside Resort',
            location: 'Miami Beach, USA',
            description: 'Beachfront paradise with world-class amenities and ocean views',
            imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
            rating: 4.6
          },
          {
            hotelID: 3,
            hotelName: 'Mountain View Lodge',
            location: 'Aspen, USA',
            description: 'Cozy mountain retreat perfect for ski enthusiasts and nature lovers',
            imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
            rating: 4.7
          }
        ]);
      } finally {
        setHotelsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/guest/search?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`);
  };

  const quickLinks = [
    { title: 'Search Rooms', icon: '🔍', path: '/guest/search', color: 'bg-blue-500' },
    { title: 'My Reservations', icon: '📋', path: '/guest/reservations', color: 'bg-green-500' },
    { title: 'My Profile', icon: '👤', path: '/guest/profile', color: 'bg-purple-500' },
    { title: 'Reviews', icon: '⭐', path: '/guest/reviews', color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🏨 SmartStay</h1>
              <p className="text-sm text-gray-600">Guest Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, <strong>{user?.fullName || 'Guest'}</strong></span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Search */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 mb-8 text-white">
          <h2 className="text-4xl font-bold mb-4">Find Your Perfect Stay</h2>
          <p className="text-lg mb-6">Book your ideal room with ease and comfort</p>
          
          <form onSubmit={handleSearch} className="bg-white rounded-lg p-6 text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Check-in Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Check-out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Guests</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
                >
                  Search Rooms
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <div
                key={index}
                onClick={() => navigate(link.path)}
                className={`${link.color} hover:opacity-90 rounded-lg shadow-lg p-6 text-white cursor-pointer transition transform hover:scale-105`}
              >
                <div className="text-4xl mb-3">{link.icon}</div>
                <h4 className="text-xl font-semibold">{link.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Hotels Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Featured Hotels</h3>
          {hotelsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading hotels...</div>
          ) : hotels.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No hotels available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.hotelID} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                  {hotel.imageUrl ? (
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.hotelName}
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`h-48 bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center text-white text-6xl ${
                      hotel.imageUrl ? 'hidden' : 'flex'
                    }`}
                  >
                    🏨
                  </div>
                  <div className="p-4">
                    <h4 className="text-xl font-semibold mb-1">{hotel.hotelName}</h4>
                    <p className="text-sm text-gray-500 mb-2">📍 {hotel.location}</p>
                    {hotel.rating && (
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-500">{'⭐'.repeat(Math.round(hotel.rating))}</span>
                        <span className="text-sm text-gray-600 ml-1">({hotel.rating})</span>
                      </div>
                    )}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {hotel.description || 'Premium accommodations with modern amenities'}
                    </p>
                    <button
                      onClick={() => navigate('/guest/search')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition"
                    >
                      View Rooms
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Recent Bookings</h3>
            <button
              onClick={() => navigate('/guest/reservations')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All →
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : recentBookings.length === 0 ? (
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-gray-700">No recent bookings</p>
              <p className="text-sm text-gray-500">Start searching for your next stay!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.bookingID}
                  className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-md hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => navigate('/guest/reservations')}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.hotelName}</p>
                      <p className="text-sm text-gray-600">{booking.roomType}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Check-in: {new Date(booking.checkInDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        booking.bookingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">Deposit: ${booking.depositAmount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GuestDashboard;
