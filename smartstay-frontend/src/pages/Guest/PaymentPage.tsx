import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BookingData {
  roomId: number;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalPrice: number;
  depositAmount: number;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = (location.state as { booking: BookingData })?.booking;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'ewallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if no booking data
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Booking Found</h2>
          <p className="text-gray-600 mb-6">Please start a new booking</p>
          <button
            onClick={() => navigate('/guest/search')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
          >
            Search Rooms
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        alert('Please fill in all card details');
        return;
      }
      
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Please enter a valid 16-digit card number');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Success - show confirmation and send receipt
      alert(`Payment Successful! 
      
Booking Confirmed!
Amount Paid: $${booking.depositAmount.toFixed(2)}

A confirmation email with your receipt has been sent to ${booking.guestEmail}.

You can view your booking in "My Reservations".`);
      
      navigate('/guest/reservations');
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">💳 Payment</h1>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
              disabled={isProcessing}
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Payment Method Selection */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Select Payment Method</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">💳</div>
                    <p className="font-semibold">Credit/Debit Card</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-4 rounded-lg border-2 transition ${
                      paymentMethod === 'bank'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">🏦</div>
                    <p className="font-semibold">Bank Transfer</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ewallet')}
                    className={`p-4 rounded-lg border-2 transition ${
                      paymentMethod === 'ewallet'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">📱</div>
                    <p className="font-semibold">E-Wallet</p>
                  </button>
                </div>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Card Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          if (formatted.replace(/\s/g, '').length <= 16) {
                            setCardNumber(formatted);
                          }
                        }}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="JOHN DOE"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setExpiryDate(value);
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 3) {
                              setCvv(value);
                            }
                          }}
                          placeholder="123"
                          maxLength={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Info */}
              {paymentMethod === 'bank' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Bank Transfer Details</h2>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Bank Name:</strong> SmartStay Bank
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Account Name:</strong> SmartStay Hotels Sdn Bhd
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Account Number:</strong> 1234567890
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Reference:</strong> {booking.roomId}-{Date.now()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Please use the reference number when making the transfer. Your booking will be confirmed once payment is received.
                  </p>
                </div>
              )}

              {/* E-Wallet Info */}
              {paymentMethod === 'ewallet' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">E-Wallet Payment</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button type="button" className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition">
                      <p className="font-semibold">GrabPay</p>
                    </button>
                    <button type="button" className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition">
                      <p className="font-semibold">Touch 'n Go</p>
                    </button>
                    <button type="button" className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition">
                      <p className="font-semibold">Boost</p>
                    </button>
                    <button type="button" className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition">
                      <p className="font-semibold">PayPal</p>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    You will be redirected to complete payment with your selected e-wallet provider.
                  </p>
                </div>
              )}

              {/* Submit Payment */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full font-bold py-3 px-4 rounded-md transition text-lg ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    `Pay $${booking.depositAmount.toFixed(2)} (Deposit)`
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  🔒 Your payment is secured with 256-bit SSL encryption
                </p>
              </div>
            </form>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Summary</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Hotel</p>
                  <p className="font-semibold">{booking.hotelName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Room</p>
                  <p className="font-semibold">{booking.roomType}</p>
                </div>

                <hr />

                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-semibold">{booking.checkInDate}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-semibold">{booking.checkOutDate}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Guests</p>
                  <p className="font-semibold">{booking.guests}</p>
                </div>

                <hr />

                <div>
                  <p className="text-sm text-gray-600">Guest Name</p>
                  <p className="font-semibold">{booking.guestName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-sm">{booking.guestEmail}</p>
                </div>

                <hr />

                <div>
                  <p className="text-sm text-gray-600">Total Booking Price</p>
                  <p className="text-lg font-semibold">${booking.totalPrice}</p>
                </div>

                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">Deposit (20%)</p>
                  <p className="text-2xl font-bold text-green-600">${booking.depositAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Remaining balance to be paid at check-in
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-4">
                  <p className="text-xs text-yellow-700">
                    <strong>Cancellation Policy:</strong> Deposit is non-refundable upon cancellation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
