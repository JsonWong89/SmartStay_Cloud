import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

const GuestNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'G';
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div 
              className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-gray-600 transition"
              onClick={() => navigate('/')}
            >
              Smart<span className="text-blue-600">Stay</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/guest/dashboard')}
                className={`font-medium transition ${
                  isActive('/guest/dashboard')
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/guest/search')}
                className={`font-medium transition ${
                  isActive('/guest/search')
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => navigate('/guest/reservations')}
                className={`font-medium transition ${
                  isActive('/guest/reservations')
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => navigate('/guest/documents')}
                className={`font-medium transition ${
                  isActive('/guest/documents')
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => navigate('/guest/reviews')}
                className={`font-medium transition ${
                  isActive('/guest/reviews')
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Reviews
              </button>
            </div>
          </div>

          {/* User Profile or Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-gray-800">{user?.fullName || 'Guest'}</div>
                  <div className="text-xs text-gray-500">Guest Account</div>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm cursor-pointer ring-2 ring-white shadow-md hover:shadow-lg transition">
                    {getInitials(user?.fullName)}
                  </div>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <button
                        onClick={() => navigate('/guest/profile')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => navigate('/guest/reservations')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        My Reservations
                      </button>
                      <button
                        onClick={() => navigate('/guest/reviews')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        My Reviews
                      </button>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-md hover:shadow-lg"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GuestNavbar;
