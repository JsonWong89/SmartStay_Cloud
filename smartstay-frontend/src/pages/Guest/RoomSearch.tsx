import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store';

interface Room {
  id: number;
  hotelName: string;
  roomType: string;
  price: number;
  available: boolean;
  imageUrl?: string;
}

const RoomSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);

  // Search filters
  const [checkInDate, setCheckInDate] = useState(searchParams.get('checkIn') || '');
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '1'));
  const [hotelFilter, setHotelFilter] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
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
        
        console.log('Fetching rooms from backend...');
        const response = await fetch('https://localhost:7168/api/rooms'); 
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        console.log('Number of rooms:', data.length);
        
        // Backend already returns the correct format, just use it directly
        const mappedRooms = data.map((r: any) => ({
          id: r.id,
          hotelName: r.hotelName,
          roomType: r.roomType,
          price: r.price,
          available: r.available,
          imageUrl: r.imageUrl
        }));

        console.log('Mapped rooms:', mappedRooms);

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
  }, []); // Empty dependency array = run once on load

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
      
      // Filter by room type
      if (roomTypeFilter && !room.roomType.toLowerCase().includes(roomTypeFilter.toLowerCase())) {
        console.log(`Room ${room.id} filtered out by room type`);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="cursor-pointer" onClick={() => navigate('/guest/dashboard')}>
              <h1 className="text-2xl font-bold text-gray-800">🏨 SmartStay</h1>
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
                  Max Price: ${maxPrice}
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$50</span>
                  <span>$1000</span>
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
                  ? `${checkInDate} to ${checkOutDate}`
                  : 'Select dates to see availability'}
              </p>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-xl text-gray-600">Loading rooms...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-8 text-center">
                <p className="text-xl text-red-600 font-semibold">⚠️ {error}</p>
                <p className="text-gray-600 mt-2">Make sure your backend is running on https://localhost:7168</p>
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
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-600">${room.price}</p>
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
