import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config';
import GuestNavbar from '../../components/GuestNavbar';

interface BookingConfirmationData {
  bookingID: number;
  guestID: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: number;
  depositAmount: number;
  bookingStatus: string;
  confirmationNumber: string;
  createdAt: string;
}

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [booking, setBooking] = useState<BookingConfirmationData | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Get booking data from navigation state
    const bookingData = location.state?.booking;
    if (bookingData) {
      setBooking(bookingData);
      // Send confirmation email automatically
      sendConfirmationEmail(bookingData);
    } else {
      // If no booking data, redirect to reservations
      navigate('/guest/reservations');
    }
  }, [location.state, navigate]);

  const sendConfirmationEmail = async (bookingData: BookingConfirmationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingData.bookingID}/send-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bookingData.guestEmail,
          guestName: bookingData.guestName,
          bookingDetails: bookingData
        })
      });

      if (response.ok) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  const downloadPDF = () => {
    if (!booking) return;

    setDownloading(true);

    const element = document.getElementById('confirmation-content');
    
    if (!element) {
      alert('Unable to generate PDF. Please try again.');
      setDownloading(false);
      return;
    }

    const opt = {
      margin: 0.5,
      filename: `Booking-Confirmation-${booking.bookingID}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        setDownloading(false);
      })
      .catch((err: Error) => {
        console.error('PDF generation error:', err);
        alert('Failed to generate PDF. Please try again.');
        setDownloading(false);
      });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar />

      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-green-50">
            Your reservation has been successfully confirmed
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Notification */}
        {emailSent && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📧</div>
              <div>
                <p className="font-semibold text-blue-800">Confirmation Email Sent!</p>
                <p className="text-sm text-blue-700">
                  A confirmation email has been sent to {booking.guestEmail}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Generating PDF...
              </>
            ) : (
              <>
                📥 Download PDF Confirmation
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/guest/reservations')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
          >
            📋 View My Reservations
          </button>
        </div>

        {/* Confirmation Content (for PDF) */}
        <div id="confirmation-content" className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="border-b-2 border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">SmartStay</h2>
                <p className="text-gray-600">Hotel Management System</p>
              </div>
              <div className="text-right">
                <div className="bg-green-100 text-green-800 font-bold px-4 py-2 rounded-lg inline-block">
                  ✓ CONFIRMED
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Booking Confirmation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Confirmation Number</p>
                <p className="text-lg font-semibold text-blue-600">
                  #{booking.bookingID.toString().padStart(6, '0')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Booking Date</p>
                <p className="text-lg font-semibold">
                  {formatDate(booking.createdAt || new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Guest Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{booking.guestName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{booking.guestEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{booking.guestPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Number of Guests</p>
                  <p className="font-semibold">{booking.totalGuests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reservation Details</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Hotel</p>
                <p className="text-lg font-bold text-blue-800">{booking.hotelName}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Room Type</p>
                <p className="font-semibold">{booking.roomType}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-semibold">{formatDate(booking.checkInDate)}</p>
                  <p className="text-xs text-gray-500">After 2:00 PM</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-semibold">{formatDate(booking.checkOutDate)}</p>
                  <p className="text-xs text-gray-500">Before 12:00 PM</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-600">Total Nights</p>
                <p className="text-2xl font-bold text-blue-600">{calculateNights()} Nights</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold">${booking.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Deposit Paid</span>
                  <span className="font-semibold">-${booking.depositAmount.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-lg font-bold">
                  <span>Balance Due at Check-in</span>
                  <span className="text-blue-600">
                    ${(booking.totalAmount - booking.depositAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <h4 className="font-bold text-yellow-800 mb-2">Important Information</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Please bring a valid ID at check-in</li>
              <li>• Deposit is non-refundable</li>
              <li>• Check-in time: 2:00 PM | Check-out time: 12:00 PM</li>
              <li>• Cancellation must be made at least 24 hours before check-in</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm pt-6 border-t border-gray-200">
            <p className="mb-2">Thank you for choosing SmartStay!</p>
            <p>For any questions, please contact our support team</p>
            <p className="mt-2">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
