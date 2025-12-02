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
  const [location, setLocation] = useState('');
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
          // Get all hotels for featured section
          setHotels(data);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkInDate) params.append('checkIn', checkInDate);
    if (location) params.append('location', location);
    params.append('guests', guests.toString());
    navigate(`/guest/search?${params.toString()}`);
  };

  const popularDestinations = [
    { name: 'Kuala Lumpur', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400' },
    { name: 'Penang', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400' },
    { name: 'Johor Bahru', image: 'https://images.unsplash.com/photo-1687861717577-8ff74dd61a47?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Melaka', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar />

      {/* Hero Section with Background Image */}
      <div className="relative h-[500px] bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&q=80')"}}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        
        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center">Find Your Perfect Stay</h1>
          <p className="text-xl md:text-2xl mb-8 text-center">Discover amazing hotels to make glass memories</p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-4xl">
            <div className="bg-white rounded-xl shadow-2xl p-4 flex flex-wrap md:flex-nowrap gap-4 items-center">
              <div className="flex items-center flex-1 min-w-[200px] px-4 py-2 border-r border-gray-200">
                <span className="text-gray-400 mr-2">📍</span>
                <input
                  type="text"
                  placeholder="City in Malaysia"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full outline-none text-gray-800"
                />
              </div>
              
              <div className="flex items-center flex-1 min-w-[150px] px-4 py-2 border-r border-gray-200">
                <span className="text-gray-400 mr-2">📅</span>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  placeholder="Dates"
                  className="w-full outline-none text-gray-800"
                  required
                />
              </div>
              
              <div className="flex items-center flex-1 min-w-[120px] px-4 py-2">
                <span className="text-gray-400 mr-2">👥</span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full outline-none text-gray-800 bg-transparent"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Cities */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Popular Cities in Malaysia</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularDestinations.map((destination) => (
              <div
                key={destination.name}
                className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300"
                onClick={() => navigate(`/guest/search?location=${destination.name}`)}
              >
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h3 className="absolute bottom-4 left-4 text-white text-2xl font-bold">{destination.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Hotels Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Featured Hotels</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const container = document.getElementById('hotels-container');
                  if (container) container.scrollBy({ left: -400, behavior: 'smooth' });
                }}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition"
              >
                <span className="text-xl">←</span>
              </button>
              <button
                onClick={() => {
                  const container = document.getElementById('hotels-container');
                  if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
                }}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition"
              >
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>
          {hotelsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <p className="text-gray-600">No hotels available at the moment</p>
            </div>
          ) : (
            <div 
              id="hotels-container"
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {hotels.map((hotel) => (
                <div 
                  key={hotel.hotelID} 
                  className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group snap-start"
                >
                  <div className="relative h-56 overflow-hidden">
                    {hotel.imageUrl ? (
                      <img
                        src={hotel.imageUrl}
                        alt={hotel.hotelName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-56 bg-gradient-to-br from-blue-400 to-blue-500 items-center justify-center text-white text-6xl ${
                        hotel.imageUrl ? 'hidden' : 'flex'
                      }`}
                    >
                      🏨
                    </div>
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl font-bold text-yellow-600 shadow-lg flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span>{hotel.rating || '4.8'}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition">{hotel.hotelName}</h3>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <span className="mr-1">📍</span>
                      <span>{hotel.location}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {hotel.description || 'Premium accommodations with modern amenities'}
                    </p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div>
                        <span className="text-gray-500 text-xs block">Starting from</span>
                        <p className="text-2xl font-bold text-blue-600">$199<span className="text-sm font-normal text-gray-500">/night</span></p>
                      </div>
                      <button
                        onClick={() => navigate('/guest/search')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
            <button
              onClick={() => navigate('/guest/reservations')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View All <span>→</span>
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading bookings...</span>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="border-l-4 border-blue-500 pl-4 py-4 bg-blue-50 rounded-r-lg">
              <p className="text-gray-700 font-medium">No recent bookings</p>
              <p className="text-sm text-gray-500 mt-1">Start searching for your next stay!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.bookingID}
                  className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg hover:bg-blue-50 transition cursor-pointer"
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
                        booking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        booking.bookingStatus === 'CheckedIn' ? 'bg-blue-100 text-blue-800' :
                        booking.bookingStatus === 'CheckedOut' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
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
