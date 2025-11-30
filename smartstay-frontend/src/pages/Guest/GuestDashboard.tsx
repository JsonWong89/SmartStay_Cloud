import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config';
import GuestNavbar from '../../components/GuestNavbar';

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

  const quickLinks = [
    { title: 'Search Rooms', icon: '🔍', path: '/guest/search', color: 'bg-gradient-to-br from-blue-500 to-blue-600', description: 'Find your perfect room' },
    { title: 'My Reservations', icon: '📋', path: '/guest/reservations', color: 'bg-gradient-to-br from-blue-600 to-blue-700', description: 'View your bookings' },
    { title: 'My Profile', icon: '👤', path: '/guest/profile', color: 'bg-gradient-to-br from-sky-500 to-blue-500', description: 'Manage your account' },
    { title: 'Reviews', icon: '⭐', path: '/guest/reviews', color: 'bg-gradient-to-br from-blue-700 to-indigo-700', description: 'Share your experience' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/guest/search?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Search */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">Find Your Perfect Stay</h2>
          <p className="text-lg md:text-xl mb-8 text-blue-50">Discover amazing hotels and book your ideal room with ease</p>
          
          <form onSubmit={handleSearch} className="bg-white rounded-xl p-6 shadow-lg text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Check-in Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Check-out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Guests</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                >
                  🔍 Search Rooms
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickLinks.map((link) => (
              <button
                key={link.title}
                onClick={() => navigate(link.path)}
                className={`${link.color} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden group`}
              >
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">{link.icon}</div>
                  <h4 className="font-bold text-lg mb-1">{link.title}</h4>
                  <p className="text-xs text-blue-100 opacity-90">{link.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Hotels Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Featured Hotels</h3>
          {hotelsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">Loading hotels...</span>
            </div>
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
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading bookings...</span>
            </div>
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
