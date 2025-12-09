import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { STRIPE_PUBLISHABLE_KEY, API_BASE_URL } from '../../config';
import { useAuthStore } from '../../store';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface BookingData {
  bookingID: number;
  roomType: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: number;
  depositAmount: number;
  guestID?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

const CheckoutForm: React.FC<{ booking: BookingData }> = ({ booking }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      // Validate booking ID exists
      if (!booking.bookingID) {
        console.error('No booking ID found:', booking);
        setError('Invalid booking data. Please try booking again.');
        return;
      }

      try {
        console.log('Creating payment intent for booking:', booking.bookingID);
        const response = await fetch(`${API_BASE_URL}/api/payments/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            BookingID: booking.bookingID,
            Amount: booking.depositAmount
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Payment intent error:', errorText);
          throw new Error(`Failed to create payment intent (HTTP ${response.status})`);
        }

        const data = await response.json();
        console.log('Payment intent created:', data);
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again or contact support.');
      }
    };

    createPaymentIntent();
  }, [booking]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      // Confirm payment in backend
      try {
        const response = await fetch(`${API_BASE_URL}/api/Payments/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            BookingID: booking.bookingID,
            Amount: booking.depositAmount,
            PaymentMethod: 'Card'
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Payment confirmation failed' }));
          console.error('Payment confirmation error:', errorData);
          throw new Error(errorData.message || 'Failed to confirm payment');
        }

        setSucceeded(true);
        setProcessing(false);

        // Redirect to booking confirmation page
        setTimeout(() => {
          navigate('/guest/booking-confirmation', {
            state: {
              booking: {
                bookingID: booking.bookingID,
                guestID: user?.id || '',
                guestName: user?.fullName || booking.guestName || '',
                guestEmail: user?.email || booking.guestEmail || '',
                guestPhone: booking.guestPhone || '',
                hotelName: booking.hotelName,
                roomType: booking.roomType,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                totalGuests: booking.totalGuests,
                totalAmount: booking.totalAmount,
                depositAmount: booking.depositAmount,
                bookingStatus: 'Confirmed',
                confirmationNumber: `BK${booking.bookingID}`,
                createdAt: new Date().toISOString()
              }
            }
          });
        }, 1500);
      } catch (err) {
        console.error('Error confirming payment:', err);
        setError(err instanceof Error ? err.message : 'Payment succeeded but confirmation failed. Please contact support with booking ID: ' + booking.bookingID);
        setProcessing(false);
      }
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Information</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement options={cardStyle} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {succeeded && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-green-600 text-sm font-semibold">
              ✓ Payment succeeded! Redirecting...
            </p>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Test Mode:</strong> Use test card <code>4242 4242 4242 4242</code> with any future expiry date and any 3-digit CVC.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || processing || succeeded}
          className={`w-full py-3 px-4 rounded-md font-semibold text-white transition ${
            processing || succeeded
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {processing ? 'Processing...' : succeeded ? 'Payment Successful!' : `Pay $${booking.depositAmount.toFixed(2)}`}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Secure Payment</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-blue-600">Powered by Stripe</span>
          </div>
        </div>
      </div>
    </form>
  );
};

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking as BookingData;

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Booking Found</h2>
          <p className="text-gray-600 mb-6">Please complete the booking form first.</p>
          <button
            onClick={() => navigate('/guest/search')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
          >
            Browse Rooms
          </button>
        </div>
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

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
            <Elements stripe={stripePromise}>
              <CheckoutForm booking={booking} />
            </Elements>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-semibold">#{booking.bookingID}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Hotel</p>
                  <p className="font-semibold">{booking.hotelName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Room Type</p>
                  <p className="font-semibold">{booking.roomType}</p>
                </div>

                <hr />

                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-semibold">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-semibold">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{nights} night{nights !== 1 ? 's' : ''}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Guests</p>
                  <p className="font-semibold">{booking.totalGuests} guest{booking.totalGuests !== 1 ? 's' : ''}</p>
                </div>

                <hr />

                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-xl font-bold text-gray-800">${booking.totalAmount.toFixed(2)}</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Amount to Pay Now (20% Deposit)</p>
                  <p className="text-2xl font-bold text-blue-600">${booking.depositAmount.toFixed(2)}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Remaining Balance (Pay at hotel)</p>
                  <p className="text-lg font-semibold text-gray-700">
                    ${(booking.totalAmount - booking.depositAmount).toFixed(2)}
                  </p>
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
    </div>
  );
};

export default PaymentPage;
