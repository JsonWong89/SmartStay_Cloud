import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { paymentsAPI, bookingsAPI } from '../../services/api';
import html2pdf from 'html2pdf.js';
import Sidebar from '../../components/Sidebar';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Mail, 
  Phone, 
  Calendar,
  Bed,
  User,
  DollarSign,
  Receipt as ReceiptIcon,
  CheckCircle,
  Home,
  AlertCircle,
  XCircle,
  FileX
} from 'lucide-react';

interface Payment {
  paymentId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

interface BookingDetails {
  bookingId: number;
  bookingStatus: string;
  guest: {
    fullName: string;
    email: string;
    phoneNumber: string;
    icNumber: string;
  };
  room: {
    hotelName: string;
    roomNumber: string;
    roomType: string;
  };
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  depositAmount: number;
  numberOfNights: number;
  totalGuests: number;
}

const ReceiptPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine where we came from
  const referrer = location.state?.from || 'guests'; // default to guests if no state

  useEffect(() => {
    const loadReceiptData = async () => {
      if (!bookingId) {
        setError("Invalid booking ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load booking details
        const bookingRes = await bookingsAPI.getBookingById(Number(bookingId));
        if (!bookingRes.success || !bookingRes.data) {
          throw new Error("Booking not found");
        }

        const apiBooking = bookingRes.data;

        // Calculate number of nights
        const checkIn = new Date(apiBooking.checkInDate);
        const checkOut = new Date(apiBooking.checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        const mappedBooking: BookingDetails = {
          bookingId: apiBooking.bookingId,
          bookingStatus: apiBooking.bookingStatus,
          guest: {
            fullName: apiBooking.guest.fullName,
            email: apiBooking.guest.email,
            phoneNumber: apiBooking.guest.phoneNumber || "N/A",
            icNumber: apiBooking.guest.icNumber || "N/A",
          },
          room: {
            hotelName: apiBooking.room.hotelName || "SmartStay Hotel",
            roomNumber: apiBooking.room.roomNumber,
            roomType: apiBooking.room.roomType,
          },
          checkInDate: apiBooking.checkInDate.split('T')[0],
          checkOutDate: apiBooking.checkOutDate.split('T')[0],
          totalAmount: apiBooking.totalAmount,
          depositAmount: apiBooking.depositAmount || 0,
          numberOfNights: apiBooking.numberOfNights || nights,
          totalGuests: apiBooking.totalGuests || 1,
        };

        setBooking(mappedBooking);

        // Load payments
        try {
          const paymentsRes = await paymentsAPI.getPaymentsByBooking(Number(bookingId));
          if (paymentsRes.success && paymentsRes.data) {
            setPayments(paymentsRes.data);
          }
        } catch (paymentErr) {
          console.warn("No payments found:", paymentErr);
          setPayments([]);
        }

      } catch (err: any) {
        console.error("Receipt load error:", err);
        setError(err.message || "Unable to load receipt");
      } finally {
        setLoading(false);
      }
    };

    loadReceiptData();
  }, [bookingId]);

  const handleGoBack = () => {
    // Navigate based on where we came from
    if (referrer === 'reservation') {
      navigate('/staff/reservation');
    } else if (referrer === 'frontdesk') {
      navigate('/staff/frontDesk');
    } else {
      // Default: go to guest management
      navigate('/staff/manage-guests');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!receiptRef.current || !booking) return;
    setDownloading(true);

    const opt = {
      margin: 0.5,
      filename: `SmartStay-Receipt-${booking.bookingId}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const },
    };

    try {
      await html2pdf().set(opt).from(receiptRef.current).save();
    } catch (err) {
      alert("PDF generation failed. Try printing instead.");
    } finally {
      setDownloading(false);
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = booking ? booking.totalAmount - totalPaid : 0;
  const isCancelled = booking?.bookingStatus === "Cancelled";
  const hasNoPayments = payments.length === 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activePage="Reservation"
        setActivePage={() => {}}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-[230px]"
        }`}
      >
        {/* Loading State */}
        {loading && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading receipt...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Receipt</p>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={handleGoBack} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Receipt Content */}
        {!loading && !error && booking && (
          <>
            {/* Header - Hidden on print */}
            <header className="bg-white shadow-sm print:hidden border-b">
              <div className="px-6 py-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => navigate(-1)} 
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <div className="border-l pl-4">
                      <h1 className="text-2xl font-bold text-gray-900">Payment Receipt</h1>
                      <p className="text-sm text-gray-600">Booking #{booking.bookingId}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handlePrint} 
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm"
                    >
                      <Printer size={18} />
                      Print
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={18} />
                      {downloading ? "Generating..." : "Download PDF"}
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Cancelled Booking Alert */}
            {isCancelled && (
              <div className="px-6 pt-6 print:hidden">
                <div className="max-w-5xl mx-auto">
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-5">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-900 text-lg mb-1">Booking Cancelled</p>
                        <p className="text-red-700">
                          This booking has been cancelled. This receipt is for reference only.
                          {totalPaid > 0 && " Please contact support regarding refund processing."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Payments Alert */}
            {!isCancelled && hasNoPayments && (
              <div className="px-6 pt-6 print:hidden">
                <div className="max-w-5xl mx-auto">
                  <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-amber-900 text-lg mb-1">No Payments Recorded</p>
                        <p className="text-amber-700">
                          No payments have been made for this booking yet. Total amount due: <strong>RM {booking.totalAmount.toFixed(2)}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Body */}
            <div className="p-6">
              <div className="max-w-5xl mx-auto">
                <div ref={receiptRef} className="bg-white rounded-xl shadow-xl overflow-hidden">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-10 text-center">
                    <div className="text-6xl mb-4">🏨</div>
                    <h1 className="text-4xl font-bold mb-2">SmartStay Hotels</h1>
                    <p className="text-purple-100 text-lg mb-3">Premium Accommodation Experience</p>
                    <div className="flex items-center justify-center gap-6 text-sm text-purple-100">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>support@smartstay.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <span>+60 12-345 6789</span>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Info Bar */}
                  <div className="bg-purple-50 border-b-2 border-purple-200 px-10 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-xs text-purple-600 font-medium mb-1">Receipt Number</p>
                        <p className="font-bold text-purple-900">
                          {hasNoPayments ? "N/A" : `RCP-${payments[0].paymentId.toString().padStart(6, '0')}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-medium mb-1">Booking ID</p>
                        <p className="font-bold text-purple-900">#{booking.bookingId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-medium mb-1">Receipt Date</p>
                        <p className="font-bold text-purple-900">
                          {hasNoPayments 
                            ? new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
                            : new Date(payments[0].paymentDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-medium mb-1">Status</p>
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                            <XCircle size={14} />
                            Cancelled
                          </span>
                        ) : hasNoPayments ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
                            <AlertCircle size={14} />
                            No Payment
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                            <CheckCircle size={14} />
                            {payments[0].status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="p-10">
                    {/* Guest & Hotel Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                          <User className="h-5 w-5 text-purple-600" />
                          Bill To
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold text-gray-900 text-base">{booking.guest.fullName}</p>
                          <div className="flex items-start gap-2 text-gray-600">
                            <Mail size={14} className="mt-0.5 flex-shrink-0" />
                            <span>{booking.guest.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={14} className="flex-shrink-0" />
                            <span>{booking.guest.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <ReceiptIcon size={14} className="flex-shrink-0" />
                            <span>IC: {booking.guest.icNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                          <Home className="h-5 w-5 text-purple-600" />
                          Hotel Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold text-gray-900 text-base">{booking.room.hotelName}</p>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Bed size={14} />
                            <span>Room {booking.room.roomNumber} - {booking.room.roomType}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <User size={14} />
                            <span>{booking.totalGuests} Guest(s)</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={14} />
                            <span>{booking.numberOfNights} Night(s)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stay Details */}
                    <div className="mb-10">
                      <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-200 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        Stay Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 rounded-lg p-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Check-In</p>
                          <p className="font-bold text-gray-900">
                            {new Date(booking.checkInDate).toLocaleDateString('en-MY', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Check-Out</p>
                          <p className="font-bold text-gray-900">
                            {new Date(booking.checkOutDate).toLocaleDateString('en-MY', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Duration</p>
                          <p className="font-bold text-gray-900">{booking.numberOfNights} Night(s)</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="mb-10">
                      <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-200 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        Payment Summary
                      </h3>

                      {hasNoPayments ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
                          <FileX className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                          <p className="font-bold text-amber-900 text-lg mb-2">No Payments Recorded</p>
                          <p className="text-amber-700 mb-4">
                            No payment transactions have been made for this booking.
                          </p>
                          <div className="bg-white rounded-lg p-4 inline-block">
                            <p className="text-sm text-gray-600 mb-1">Total Amount Due</p>
                            <p className="text-3xl font-bold text-amber-600">
                              RM {booking.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                          <table className="w-full">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Description</th>
                                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              <tr>
                                <td className="px-6 py-4 text-gray-700">Total Booking Amount</td>
                                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                  RM {booking.totalAmount.toFixed(2)}
                                </td>
                              </tr>
                              {payments.map((payment, index) => (
                                <tr key={payment.paymentId}>
                                  <td className="px-6 py-4 text-gray-700">
                                    Payment {index + 1} ({payment.paymentMethod})
                                    <span className="text-xs text-gray-500 ml-2">
                                      • {new Date(payment.paymentDate).toLocaleDateString('en-MY')}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right font-semibold text-green-600">
                                    - RM {payment.amount.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-purple-50 border-t-2 border-purple-200">
                                <td className="px-6 py-4 font-bold text-gray-900 text-lg">Total Paid</td>
                                <td className="px-6 py-4 text-right text-lg font-bold text-green-600">
                                  RM {totalPaid.toFixed(2)}
                                </td>
                              </tr>
                              {remainingBalance > 0 && (
                                <tr className="bg-amber-50 border-t border-amber-200">
                                  <td className="px-6 py-4 font-bold text-gray-900">Remaining Balance</td>
                                  <td className="px-6 py-4 text-right font-bold text-amber-600">
                                    RM {remainingBalance.toFixed(2)}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Status Messages */}
                    {isCancelled ? (
                      <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 mb-8">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-red-900 mb-1 text-lg">Booking Cancelled</p>
                            <p className="text-red-700">
                              This booking has been cancelled. {totalPaid > 0 
                                ? "Refund process will be initiated according to our cancellation policy." 
                                : "No refund applicable as no payment was made."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : hasNoPayments ? (
                      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6 mb-8">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-amber-900 mb-1 text-lg">Payment Required</p>
                            <p className="text-amber-700">
                              Full payment of <strong>RM {booking.totalAmount.toFixed(2)}</strong> is required to confirm this booking.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : remainingBalance === 0 ? (
                      <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6 mb-8">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-green-900 mb-1 text-lg">Payment Complete!</p>
                            <p className="text-green-700">
                              Thank you for your payment. Your booking is fully paid and confirmed.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-8">
                        <div className="flex items-start gap-3">
                          <ReceiptIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-blue-900 mb-1 text-lg">Thank you for your payment!</p>
                            <p className="text-blue-700">
                              Remaining balance of <strong>RM {remainingBalance.toFixed(2)}</strong> is due upon check-in.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Terms & Conditions */}
                    <div className="border-t-2 border-gray-200 pt-6 mb-8">
                      <h4 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Check-in time: 2:00 PM | Check-out time: 12:00 PM</li>
                        <li>• Valid ID required at check-in</li>
                        <li>• Cancellation policy applies as per booking terms</li>
                        <li>• Smoking is prohibited in all rooms</li>
                      </ul>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 border-t-2 border-gray-200 px-10 py-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>SmartStay Hotels</strong> • support@smartstay.com • +60 12-345 6789
                    </p>
                    <p className="text-xs text-gray-500">
                      This is a system-generated receipt • Generated on {new Date().toLocaleString('en-MY')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiptPage;