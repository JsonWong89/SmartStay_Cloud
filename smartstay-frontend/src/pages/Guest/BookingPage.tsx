import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config';
import GuestNavbar from '../../components/GuestNavbar';

interface RoomDetails {
  id: number;
  hotelName: string;
  roomType: string;
  price: number;
  imageUrl?: string;
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);

  // Editable dates - initialize from search params
  const [checkInDate, setCheckInDate] = useState(searchParams.get('checkIn') || '');
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOut') || '');
  const guests = parseInt(searchParams.get('guests') || '1');

  // Guest Information
  const [guestName, setGuestName] = useState(user?.fullName || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestAddress, setGuestAddress] = useState('');
  //const [specialRequests, setSpecialRequests] = useState('');

  // Document Upload
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [additionalDoc, setAdditionalDoc] = useState<File | null>(null);
  const [stayDuration, setStayDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Room data from API
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [isLongTermStay, setIsLongTermStay] = useState(false);

  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch room details');
        }
        
        const data = await response.json();
        console.log('Room data received:', data);
        
        // Handle both camelCase and PascalCase field names
        setRoom({
          id: data.roomId || data.RoomId || data.id,
          hotelName: data.hotelName || data.HotelName,
          roomType: data.roomType || data.RoomType,
          price: data.pricePerNight || data.PricePerNight || data.price,
          imageUrl: data.imageURL || data.ImageURL || data.imageUrl
        });
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Could not load room details');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  // Fetch guest profile data to pre-fill phone and address
  useEffect(() => {
    const fetchGuestProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/Guests/profile/${user.id}`);
        if (response.ok) {
          const responseData = await response.json();
          // Extract data from the success response structure
          const guestData = responseData.data || responseData;
          
          // Pre-fill fields if not already set
          if (!guestPhone) {
            setGuestPhone(guestData.phoneNumber || '');
          }
          if (!guestAddress) {
            setGuestAddress(guestData.address || '');
          }
        }
      } catch (error) {
        console.error('Error fetching guest profile:', error);
      }
    };

    fetchGuestProfile();
  }, [user?.id]);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setStayDuration(diffDays);
      setIsLongTermStay(diffDays > 30); // Long-term stay if more than 30 days
    }
  }, [checkInDate, checkOutDate]);

  const totalPrice = room ? room.price * stayDuration : 0;
  const depositAmount = totalPrice * 0.2; // 20% deposit

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdDocument(e.target.files[0]);
    }
  };

  const handleAdditionalDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAdditionalDoc(e.target.files[0]);
    }
  };

  const uploadDocument = async (file: File, documentType: string, guestId: string) => {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('GuestID', guestId);
    formData.append('DocumentType', documentType);

    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to upload document' }));
      throw new Error(errorData.message || 'Failed to upload document');
    }

    return await response.json();
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!room || !user?.id) {
      alert('Missing room or user information');
      return;
    }

    // Validation
    if (!guestName || !guestEmail || !guestPhone || !guestAddress) {
      alert('Please fill in all required guest information');
      return;
    }

    // Validate guest name
    if (guestName.trim().length < 2) {
      alert('❌ Guest name must be at least 2 characters');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(guestEmail.trim())) {
      alert('❌ Please enter a valid email address');
      return;
    }

    // Validate phone number format
    const phoneNumber = guestPhone.replace(/[\s-]/g, '');
    if (!/^\+?\d{8,15}$/.test(phoneNumber)) {
      alert('❌ Please enter a valid phone number (8-15 digits)');
      return;
    }

    // Validate address
    if (guestAddress.trim().length < 5) {
      alert('❌ Please enter a complete address (at least 5 characters)');
      return;
    }

    // MANDATORY: ID document (IC) must be uploaded
    if (!idDocument) {
      alert('❌ ID Document (IC) is mandatory for all bookings. Please upload your identification card.');
      return;
    }

    // CONDITIONAL: Additional proof required for long-term stays (> 30 days)
    if (isLongTermStay && !additionalDoc) {
      alert(`❌ Additional proof document is required for long-term stays (${stayDuration} days). Please upload Visa, Employment Letter, or Work Permit.`);
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
      alert('❌ Check-in date cannot be in the past. Please select today or a future date.');
      return;
    }

    // Validation: Check-out must be after check-in
    if (checkOut <= checkIn) {
      alert('❌ Check-out date must be at least one day after check-in date.');
      return;
    }

    // Validation: Max booking window (1 year in advance)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (checkIn > oneYearFromNow) {
      alert('❌ Bookings can only be made up to 1 year in advance.');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Upload ID document
      console.log('Uploading ID document...');
      await uploadDocument(idDocument, 'ID', user.id);

      // Step 2: Upload additional document if required
      if (isLongTermStay && additionalDoc) {
        console.log('Uploading additional document...');
        const docType = additionalDoc.name.toLowerCase().includes('visa') ? 'Visa' : 
                       additionalDoc.name.toLowerCase().includes('employment') ? 'EmploymentLetter' : 
                       'WorkPermit';
        await uploadDocument(additionalDoc, docType, user.id);
      }

      const bookingRequest = {
        GuestID: user.id,
        RoomID: room.id,
        CheckInDate: checkInDate,
        CheckOutDate: checkOutDate,
        TotalGuests: guests,
        TotalAmount: totalPrice,
        DepositPaid: depositAmount,
        PaymentMethod: "Card", 
        //SpecialRequests: specialRequests
      };

      console.log('Creating booking with payload:', bookingRequest);

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingRequest)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create booking' }));
        throw new Error(errorData.message || `Booking failed (HTTP ${response.status})`);
      }

      const result = await response.json();
      console.log('Booking API response:', result);
      console.log('Full response structure:', JSON.stringify(result, null, 2));

      // Extract booking data from response - handle different response structures
      const bookingData = result.data || result;
      console.log('Extracted booking data:', bookingData);
      console.log('Full booking data:', JSON.stringify(bookingData, null, 2));
      console.log('All keys in bookingData:', Object.keys(bookingData));

      // ASP.NET Core serializes BookingID as bookingId (camelCase)
      // Check all possible variations
      const extractedBookingId = 
        bookingData.bookingId || 
        bookingData.bookingID || 
        bookingData.BookingID || 
        bookingData.BookingId || 
        bookingData.id ||
        bookingData.Id ||
        bookingData.ID;
      
      console.log('Final extracted booking ID:', extractedBookingId);
      console.log('Type of booking ID:', typeof extractedBookingId);

      if (!extractedBookingId) {
        console.error('Failed to extract booking ID from:', bookingData);
        console.error('Available keys:', Object.keys(bookingData));
        throw new Error('Booking was created but no booking ID was returned from the server. Please contact support.');
      }

      // Navigate to payment page with booking data
      navigate(`/guest/payment`, { 
        state: { 
          booking: {
            bookingID: extractedBookingId, // Use bookingID (uppercase) for PaymentPage
            bookingStatus: bookingData.bookingStatus || bookingData.BookingStatus,
            totalAmount: bookingData.totalAmount || bookingData.TotalAmount || totalPrice,
            depositAmount: bookingData.depositAmount || bookingData.DepositAmount || depositAmount,
            hotelName: room.hotelName,
            roomType: room.roomType,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            totalGuests: guests
          }
        } 
      });
    } catch (err: any) {
      console.error('Booking error:', err);
      alert(`Failed to create booking: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Complete Your Booking</h1>
              <p className="text-sm text-gray-600 mt-1">Fill in your details to confirm reservation</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {loading && !room ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
            <p className="text-xl text-gray-600">Loading room details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-red-600 font-semibold">⚠️ {error}</p>
            <button 
              onClick={() => navigate(-1)} 
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition"
            >
              Go Back
            </button>
          </div>
        </div>
      ) : !room ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600">Room not found</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Form */}
            <div className="lg:col-span-2">
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              {/* Guest Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Guest Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+60123456789"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guestAddress}
                      onChange={(e) => setGuestAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requests or preferences..."
                  />
                </div> */}
              </div>

              {/* Document Upload */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📄 Document Upload</h2>
                
                {/* Mandatory Notice */}
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-red-800">
                        🔒 MANDATORY: ID Document (IC) Required / Visa Card / Passport
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        All guests must upload a valid identification card / Visa Card / Passport to be verified before check-in.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Upload ID Document (IC) <span className="text-red-600 text-lg">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleIdUpload}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                    {idDocument ? (
                      <p className="mt-2 text-sm text-green-600 font-medium">
                        ✓ {idDocument.name} uploaded successfully
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-red-600 font-medium">
                        ⚠ Please upload your IC/Passport before proceeding
                      </p>
                    )}
                  </div>

                  {isLongTermStay && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-orange-800">
                            ⏱ Long-Term Stay Detected: {stayDuration} Days
                          </p>
                          <p className="text-xs text-orange-700 mt-1">
                            Stays exceeding 30 days require additional verification documents
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isLongTermStay && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        📎 Additional Proof Document <span className="text-red-600 text-lg">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleAdditionalDocUpload}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required={isLongTermStay}
                      />
                      {additionalDoc ? (
                        <p className="mt-2 text-sm text-green-600 font-medium">
                          ✓ {additionalDoc.name} uploaded successfully
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-orange-600 font-medium">
                          ⚠ Required: Work permit, student visa, or employment letter
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Accepted documents:</strong> Work Permit, Student Visa, Employment Letter, Sponsorship Letter
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition text-lg"
                >
                  Proceed to Payment →
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  By proceeding, you agree to the terms and conditions
                </p>
              </div>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Hotel</p>
                  <p className="font-semibold text-gray-800">{room.hotelName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Room Type</p>
                  <p className="font-semibold text-gray-800">{room.roomType}</p>
                </div>

                <hr className="border-gray-200" />

                {/* Editable Check-in Date */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Editable Check-out Date */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate ? new Date(new Date(checkInDate).setDate(new Date(checkInDate).getDate() + 1)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-800">{stayDuration} night{stayDuration !== 1 ? 's' : ''}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Guests</p>
                  <p className="font-semibold text-gray-800">{guests} guest{guests !== 1 ? 's' : ''}</p>
                </div>

                <hr className="border-gray-200" />

                <div>
                  <p className="text-sm text-gray-600">Price per night</p>
                  <p className="font-semibold text-gray-800">RM{room.price}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-2xl font-bold text-blue-600">RM{totalPrice.toFixed(2)}</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Deposit Required (20%)</p>
                  <p className="text-xl font-bold text-blue-600">RM{depositAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Pay now to secure your reservation</p>
                </div>

                <hr />

                <div>
                  <p className="text-xs text-gray-500">
                    <strong>Note:</strong> Deposit is non-refundable upon cancellation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
