import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config/api';
import GuestNavbar from '../../components/GuestNavbar';

interface Room {
  id: number;
  hotelName: string;
  roomType: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  city?: string;
}

// Room type capacity mapping
const ROOM_CAPACITY: Record<string, number> = {
  'Standard': 2,
  'Deluxe': 3,
  'Suite': 4,
  'Family': 6
};

const RoomSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Search filters
  const [checkInDate, setCheckInDate] = useState(searchParams.get('checkIn') || '');
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '1'));
  const [hotelFilter, setHotelFilter] = useState((location.state as { hotelName?: string })?.hotelName || '');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState(searchParams.get('location') || '');
  const [maxPrice, setMaxPrice] = useState(1000);

  // Initialize with empty array
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState('');       // Add error state

  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(''); // Clear any previous errors

        // Build API URL with location parameter if provided
        let apiUrl = `${API_BASE_URL}/api/rooms`;
        if (cityFilter) {
          apiUrl += `?location=${encodeURIComponent(cityFilter)}`;
        }

        console.log('Fetching rooms from backend:', apiUrl);
        const response = await fetch(apiUrl);

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }

        const data = await response.json();
        console.log('Received data:', data);
        console.log('Number of rooms:', data.length);

        // Backend already returns the correct format, just use it directly
        // Robust mapping to handle potentially different backend cases
        const mappedRooms = data.map((r: any) => ({
          id: r.id || r.RoomID || r.RoomId,
          hotelName: r.hotelName || r.HotelName,
          roomType: r.roomType || r.RoomType,
          price: r.price || r.Price || r.pricePerNight || r.PricePerNight,
          available: r.available || r.Available || r.isAvailable || r.IsAvailable,
          imageUrl: r.imageUrl || r.ImageUrl || r.imageURL || r.ImageURL,
          city: r.city || r.City || r.location || r.Location
        }));

        console.log('Mapped rooms:', mappedRooms);
        setRooms(mappedRooms);
        setFilteredRooms(mappedRooms);
      } catch (err) {
        console.error("API Error:", err);
        setError('Could not load rooms. Please ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [cityFilter]); // Re-fetch when cityFilter changes

  useEffect(() => {
    filterRooms();
  }, [hotelFilter, roomTypeFilter, maxPrice, guests, rooms]);

  const filterRooms = () => {
    console.log('Filtering rooms...', {
      totalRooms: rooms.length,
      hotelFilter,
      roomTypeFilter,
      maxPrice,
      guests
    });

    let filtered = rooms.filter((room) => {
      // Filter by hotel name
      if (hotelFilter && !room.hotelName.toLowerCase().includes(hotelFilter.toLowerCase())) {
        console.log(`Room ${room.id} filtered out by hotel name`);
        return false;
      }

      // City filter is now handled by backend API
      // No need to filter by city here anymore

      // Filter by room type
      if (roomTypeFilter && !room.roomType.toLowerCase().includes(roomTypeFilter.toLowerCase())) {
        console.log(`Room ${room.id} filtered out by room type`);
        return false;
      }

      // Filter by guest capacity
      const roomCapacity = ROOM_CAPACITY[room.roomType] || 2;
      if (guests > roomCapacity) {
        console.log(`Room ${room.id} (${room.roomType}) filtered out by guest capacity: ${guests} > ${roomCapacity}`);
        return false;
      }

      // Filter by price
      if (room.price > maxPrice) {
        console.log(`Room ${room.id} filtered out by price: ${room.price} > ${maxPrice}`);
        return false;
      }

      // Filter by availability
      if (!room.available) {
        console.log(`Room ${room.id} filtered out by availability`);
        return false;
      }

      return true;
    });

    console.log('Filtered rooms count:', filtered.length);
    setFilteredRooms(filtered);
  };

  const handleSearch = () => {
    filterRooms();
  };

  const handleBookNow = (roomId: number) => {
    if (!user) {
      alert('Please login to book a room');
      navigate('/login');
      return;
    }
    navigate(`/guest/booking/${roomId}?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`);
  };

  const handleViewDetails = (roomId: number) => {
    navigate(`/guest/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Search Available Rooms</h1>
          <p className="text-sm text-gray-600 mt-1">Find your perfect accommodation</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>

              {/* Date Filters */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <hr className="my-4" />

              {/* City Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  placeholder="e.g., Kuala Lumpur, Penang"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Hotel Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
                <input
                  type="text"
                  placeholder="Search by hotel name"
                  value={hotelFilter}
                  onChange={(e) => setHotelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Room Type Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                <input
                  type="text"
                  placeholder="e.g., Single, Double"
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price: RM{maxPrice}
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>RM50</span>
                  <span>RM1000</span>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Room Listings */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Available Rooms ({filteredRooms.length})
              </h2>
              <p className="text-gray-600">
                {checkInDate && checkOutDate
                  ? `${new Date(checkInDate).toLocaleDateString()} to ${new Date(checkOutDate).toLocaleDateString()}`
                  : 'Select dates to see availability'}
              </p>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                </div>
                <p className="text-xl text-gray-600">Loading rooms...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-8 text-center">
                <p className="text-xl text-red-600 font-semibold">⚠️ {error}</p>
                <p className="text-gray-600 mt-2">Make sure your backend API is running and accessible</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition"
                >
                  Retry
                </button>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-xl text-gray-600">No rooms match your criteria</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                    <div className="md:flex">
                      {/* Room Image */}
                      <div className="md:w-1/3 bg-gray-200 h-64 md:h-auto flex items-center justify-center overflow-hidden">
                        {room.imageUrl ? (
                          <img
                            src={room.imageUrl}
                            alt={room.roomType}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          /* Fallback if no image exists in DB */
                          <div className="text-6xl">🛏️</div>
                        )}
                      </div>

                      {/* Room Details */}
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{room.roomType}</h3>
                            <p className="text-gray-600">{room.hotelName}</p>
                            {room.city && <p className="text-sm text-gray-500">{room.city}</p>}
                            <p className="text-sm text-gray-500 mt-1">Max {ROOM_CAPACITY[room.roomType] || 2} guests</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-600">RM{room.price}</p>
                            <p className="text-sm text-gray-500">per night</p>
                          </div>
                        </div>



                        <div className="flex gap-3">
                          <button
                            onClick={() => handleBookNow(room.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
                          >
                            Book Now
                          </button>
                          <button
                            onClick={() => handleViewDetails(room.id)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md transition"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSearch;
