import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config';
import GuestNavbar from '../../components/GuestNavbar';
import Toast, { ToastType } from '../../components/Toast';

interface GuestData {
  guestId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  icNumber: string;
}

const GuestProfile: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  // Helper function to get initials (same as navbar)
  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'G';
  };

  // Profile state
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [icNumber, setIcNumber] = useState('');

  // Account statistics
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState(0);

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch guest profile - guests endpoint requires hotelId query parameter
        const guestResponse = await fetch(`${API_BASE_URL}/api/guests/${user.id}?hotelId=1`);
        
        if (guestResponse.ok) {
          const response = await guestResponse.json();
          console.log('Profile data loaded:', response);
          
          // Extract data from wrapped response
          const data = response.data || response;
          
          // Handle both camelCase and PascalCase from backend
          setFullName(data.fullName || data.FullName || '');
          setEmail(data.email || data.Email || '');
          setPhone(data.phoneNumber || data.PhoneNumber || '');
          setAddress(data.address || data.Address || '');
          setGender(data.gender || data.Gender || '');
          setIcNumber(data.icNumber || data.ICNumber || '');
        } else {
          console.error('Failed to fetch profile:', guestResponse.status);
        }

        // Fetch bookings for statistics
        const bookingsResponse = await fetch(`${API_BASE_URL}/api/bookings/guest/${user.id}`);
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          console.log('Bookings data:', bookingsData);
          
          const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.data || []);
          setTotalBookings(bookings.length);
          
          // Calculate total spent
          const spent = bookings.reduce((sum: number, booking: any) => {
            const amount = booking.totalAmount || booking.TotalAmount || 0;
            return sum + amount;
          }, 0);
          setTotalSpent(spent);
          
          // Count upcoming bookings (not cancelled, check-in date in future)
          const today = new Date();
          const upcoming = bookings.filter((booking: any) => {
            const checkInDate = new Date(booking.checkInDate || booking.CheckInDate);
            const status = (booking.bookingStatus || booking.BookingStatus || '').toLowerCase();
            return checkInDate >= today && status !== 'cancelled';
          }).length;
          setUpcomingBookings(upcoming);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!fullName || !email || !phone) {
      showToast('⚠️ Please fill in all required fields', 'warning');
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      showToast('⚠️ Full name must be at least 2 characters', 'warning');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      showToast('📧 Please enter a valid email address', 'error');
      return;
    }

    // Validate phone number format
    const phoneNumber = phone.replace(/[\s-]/g, '');
    if (!/^\+?\d{8,15}$/.test(phoneNumber)) {
      showToast('📱 Please enter a valid phone number (8-15 digits)', 'error');
      return;
    }

    // Validate IC Number if provided
    if (icNumber) {
      const ic = icNumber.replace(/\D/g, '');
      if (ic.length < 6 || ic.length > 20) {
        showToast('🪪 Please enter a valid IC Number or Passport (6-20 characters)', 'error');
        return;
      }
    }

    if (!user?.id) {
      showToast('⚠️ User session not found. Please sign in again.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/guests/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FullName: fullName,
          Email: email,
          PhoneNumber: phone,
          Address: address,
          Gender: gender,
          ICNumber: icNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Update user in store
      setUser({ ...user, fullName, email });
      
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('⚠️ Please fill in all password fields', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('🔒 New passwords don\'t match. Please try again.', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('🔐 Password must be at least 8 characters long.', 'warning');
      return;
    }

    if (!user?.id) {
      showToast('⚠️ User session not found. Please sign in again.', 'error');
      return;
    }

    try {
      const payload = {
        GuestID: user.id,
        CurrentPassword: currentPassword,
        NewPassword: newPassword
      };
      console.log('Change password payload:', payload);

      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to change password' }));
        console.error('Change password error response:', response.status, errorData);
        console.error('Validation errors:', errorData.errors);
        
        // Extract error messages from validation errors
        let errorMessage = 'Failed to change password';
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = errorMessages || errorData.title || errorMessage;
        } else {
          errorMessage = errorData.message || errorData.title || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      showToast('✨ Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      showToast(`❌ ${error.message}`, 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to delete your account?\n\nThis action cannot be undone. All your data will be permanently deleted.'
    );

    if (confirmed) {
      const doubleConfirm = window.confirm(
        'This is your last chance!\n\nAre you ABSOLUTELY SURE you want to delete your account?'
      );

      if (doubleConfirm && user?.id) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/guests/${user.id}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error('Failed to delete account');
          }

          showToast('🗑️ Account deleted successfully. We\'re sorry to see you go!', 'success');
          setTimeout(() => {
            clearUser();
            navigate('/');
          }, 1500);
        } catch (error) {
          console.error('Error deleting account:', error);
          showToast('❌ Failed to delete account. Please contact support.', 'error');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GuestNavbar />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account information</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Account Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-blue-600">{totalBookings}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-green-600">RM{totalSpent.toFixed(2)}</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upcoming Trips</p>
                  <p className="text-3xl font-bold text-purple-600">{upcomingBookings}</p>
                </div>
                <div className="text-4xl">✈️</div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile}>
              {/* Profile Picture */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                    {getInitials(fullName)}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition shadow-md"
                      title="Change profile picture"
                    >
                      📷
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IC Number</label>
                  <input
                    type="text"
                    value={icNumber}
                    onChange={(e) => setIcNumber(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    }`}
                    placeholder="e.g., 950101-01-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Security Settings</h2>
            
            {!showPasswordChange ? (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition"
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-md transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">Danger Zone</h2>
            <p className="text-sm text-gray-700 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default GuestProfile;
