import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { paymentsAPI, bookingsAPI } from '../../services/api';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Download, Printer } from 'lucide-react';

interface Payment {
  paymentId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

interface BookingDetails {
  bookingId: number;
  guest: {
    fullName: string;
    email: string;
  };
  room: {
    hotelName: string;    
    roomType: string;
  };
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  depositAmount: number;
}

const ReceiptPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadReceiptData = async () => {
      if (!bookingId) return;

      try {
        const bookingRes = await bookingsAPI.getBookingById(Number(bookingId));
        if (!bookingRes.success || !bookingRes.data) {
          throw new Error("Booking not found");
        }

        const paymentsRes = await paymentsAPI.getPaymentsByBooking(Number(bookingId));
        if (!paymentsRes.success || paymentsRes.data.length === 0) {
          throw new Error("No payment found");
        }

        // FIX 1: Don't use undefined type "bookingAPI" → just use the data directly
        const apiBooking = bookingRes.data;

        const mappedBooking: BookingDetails = {
          bookingId: apiBooking.bookingId,
          guest: {
            fullName: apiBooking.guest.fullName,
            email: apiBooking.guest.email,
          },
          room: {
            hotelName: apiBooking.room.hotelName,     // Correct: flat field from your API
            roomType: apiBooking.room.roomType,
          },
          checkInDate: apiBooking.checkInDate,
          checkOutDate: apiBooking.checkOutDate,
          totalAmount: apiBooking.totalAmount,
          depositAmount: apiBooking.depositAmount,
        };

        setBooking(mappedBooking);
        setPayments(paymentsRes.data);
      } catch (err) {
        console.error("Receipt load error:", err);
        alert("Unable to load receipt. Please try again.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadReceiptData();
  }, [bookingId, navigate]);

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    if (!receiptRef.current || !booking) return;
    setDownloading(true);

    // FIX 2: Add `as const` to satisfy html2pdf strict types
    const opt = {
      margin: 0.5,
      filename: `SmartStay-Receipt-B${booking.bookingId}.pdf`,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading receipt...</div>
      </div>
    );
  }

  if (!booking || payments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Receipt not available</p>
          <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const latestPayment = payments[0];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold">Payment Receipt</h1>
              <p className="text-sm text-gray-600">Booking #{booking.bookingId}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <Download size={18} />
              {downloading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </header>

      {/* Receipt Body */}
      <div className="max-w-4xl mx-auto p-6">
        <div ref={receiptRef} className="bg-white rounded-lg shadow-xl p-10">
          <div className="text-center mb-8 border-b-2 border-gray-200 pb-8">
            <div className="text-5xl mb-3">🏨</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">SmartStay Hotels</h1>
            <p className=" text-gray-600 mt-2">Premium Accommodation Experience</p>
            <p className="text-sm text-gray-500 mt-2">
              Email: support@smartstay.com | Phone: +1 (800) 123-4567
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="font-bold text-lg mb-3">Bill To:</h3>
              <p className="font-semibold">{booking.guest.fullName}</p>
              <p className="text-gray-600">{booking.guest.email}</p>
            </div>
            <div className="text-right">
              <p><strong>Receipt #:</strong> P{latestPayment.paymentId.toString().padStart(6, '0')}</p>
              <p><strong>Booking #:</strong> B{booking.bookingId}</p>
              <p><strong>Date:</strong> {new Date(latestPayment.paymentDate).toLocaleDateString('en-MY')}</p>
              <p><strong>Status:</strong> <span className="text-green-600 font-bold">{latestPayment.status}</span></p>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Stay Details</h3>
            <div className="grid grid-cols-2 gap-6 text-gray-700">
              {/* FIX 3: You mapped hotelName correctly → use it directly! */}
              <div><strong>Hotel:</strong> {booking.room.hotelName}</div>
              <div><strong>Room Type:</strong> {booking.room.roomType}</div>
              <div><strong>Check-in:</strong> {new Date(booking.checkInDate).toLocaleDateString('en-MY')}</div>
              <div><strong>Check-out:</strong> {new Date(booking.checkOutDate).toLocaleDateString('en-MY')}</div>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Payment Summary</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Total Booking Amount</td>
                  <td className="text-right">RM {booking.totalAmount.toFixed(2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">
                    Deposit Paid ({latestPayment.paymentMethod})
                  </td>
                  <td className="text-right font-semibold text-green-600">
                    RM {latestPayment.amount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b-2 border-gray-400">
                  <td className="py-4 font-bold text-lg">Amount Paid Today</td>
                  <td className="text-right text-lg font-bold text-green-600">
                    RM {latestPayment.amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded">
            <p className="font-semibold text-blue-900 mb-2">Thank you for your payment!</p>
            <p className="text-sm text-blue-700">
              Remaining balance of <strong>RM {(booking.totalAmount - booking.depositAmount).toFixed(2)}</strong> is due upon check-in.
            </p>
          </div>

          <div className="text-center text-sm text-gray-500 mt-10 pt-8 border-t">
            <p>SmartStay Hotels • support@smartstay.com • +60 12-345 6789</p>
            <p className="mt-2">This is a system-generated receipt • {new Date().toLocaleString('en-MY')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;