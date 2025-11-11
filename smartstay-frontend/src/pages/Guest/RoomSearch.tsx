import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store';

interface Room {
  id: number;
  hotelName: string;
  roomType: string;
  price: number;
  capacity: number;
  amenities: string[];
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
  const [maxPrice, setMaxPrice] = useState(500);

  // Mock room data - replace with API call
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 1,
      hotelName: 'Grand Plaza Hotel',
      roomType: 'Deluxe Single',
      price: 120,
      capacity: 1,
      amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'],
      available: true,
    },
    {
      id: 2,
      hotelName: 'Grand Plaza Hotel',
      roomType: 'Deluxe Double',
      price: 180,
      capacity: 2,
      amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service'],
      available: true,
    },
    {
      id: 3,
      hotelName: 'Seaside Resort',
      roomType: 'Ocean View Suite',
      price: 250,
      capacity: 2,
      amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Sea View'],
      available: true,
    },
    {
      id: 4,
      hotelName: 'City Center Inn',
      roomType: 'Standard Single',
      price: 80,
      capacity: 1,
      amenities: ['WiFi', 'AC', 'TV'],
      available: true,
    },
    {
      id: 5,
      hotelName: 'Luxury Heights',
      roomType: 'Presidential Suite',
      price: 450,
      capacity: 4,
      amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Kitchen', 'Jacuzzi', 'Butler Service'],
      available: true,
    },
  ]);

  const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms);

  useEffect(() => {
    filterRooms();
  }, [hotelFilter, roomTypeFilter, maxPrice, guests, rooms]);

  const filterRooms = () => {
    let filtered = rooms.filter((room) => {
      const matchesHotel = !hotelFilter || room.hotelName.toLowerCase().includes(hotelFilter.toLowerCase());
      const matchesRoomType = !roomTypeFilter || room.roomType.toLowerCase().includes(roomTypeFilter.toLowerCase());
      const matchesPrice = room.price <= maxPrice;
      const matchesCapacity = room.capacity >= guests;
      return matchesHotel && matchesRoomType && matchesPrice && matchesCapacity && room.available;
    });
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
                  max="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$50</span>
                  <span>$500</span>
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

            {filteredRooms.length === 0 ? (
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
                      <div className="md:w-1/3 bg-gradient-to-br from-blue-400 to-purple-500 h-64 md:h-auto flex items-center justify-center text-white text-6xl">
                        🛏️
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

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            👥 Capacity: {room.capacity} guest{room.capacity > 1 ? 's' : ''}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.map((amenity, index) => (
                              <span
                                key={index}
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                              >
                                {amenity}
                              </span>
                            ))}
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
