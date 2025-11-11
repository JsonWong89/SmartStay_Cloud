import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

const GuestDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((hotel) => (
              <div key={hotel} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-6xl">
                  🏨
                </div>
                <div className="p-4">
                  <h4 className="text-xl font-semibold mb-2">Hotel {hotel}</h4>
                  <p className="text-gray-600 mb-2">Premium accommodations with modern amenities</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">From $99/night</span>
                    <button
                      onClick={() => navigate('/guest/search')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                    >
                      View Rooms
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-gray-700">No recent bookings</p>
              <p className="text-sm text-gray-500">Start searching for your next stay!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuestDashboard;
