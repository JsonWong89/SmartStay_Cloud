import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config';
import html2pdf from 'html2pdf.js';

interface PaymentReceipt {
  paymentID: number;
  bookingID: number;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  status: string;
  receiptURL?: string;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  depositAmount: number;
  guestName: string;
  guestEmail: string;
}

const ReceiptPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const user = useAuthStore((state) => state.user);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!bookingId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/payments/booking/${bookingId}/receipt`);
        if (response.ok) {
          const data = await response.json();
          console.log('Receipt data:', data);
          // Handle both wrapped and unwrapped responses
          const receiptData = data.data || data;
          setReceipt(receiptData);
        } else {
          console.error('Receipt not found:', response.status);
          alert('Receipt not found');
          navigate('/guest/reservations');
        }
      } catch (error) {
        console.error('Error fetching receipt:', error);
        alert('Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [bookingId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!receiptRef.current || !receipt) {
      alert('Receipt content not available');
      return;
    }
    
    setDownloading(true);
    
    try {
      // Check if html2pdf is available
      if (typeof html2pdf !== 'function') {
        throw new Error('PDF library not loaded. Please refresh the page and try again.');
      }

      const opt = {
        margin: 0.5,
        filename: `SmartStay-Receipt-${receipt.bookingID}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      console.log('Generating PDF with options:', opt);
      await html2pdf().set(opt).from(receiptRef.current).save();
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try using the Print button instead.');
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

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Receipt not found</p>
          <button
            onClick={() => navigate('/guest/reservations')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Hidden when printing */}
      <header className="bg-white shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📄 Payment Receipt</h1>
              <p className="text-sm text-gray-600">Booking #{receipt.bookingID}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                disabled={downloading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`px-4 py-2 rounded-md transition font-medium ${
                  downloading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {downloading ? '⏳ Generating PDF...' : '⬇️ Download PDF'}
              </button>
              <button
                onClick={() => navigate('/guest/reservations')}
                disabled={downloading}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Receipt Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div 
          ref={receiptRef} 
          className="rounded-lg shadow-xl p-8 print:shadow-none receipt-content"
          style={{ backgroundColor: '#ffffff', padding: '32px' }}
        >
          {/* Company Header */}
          <div className="text-center mb-8 border-b-2 pb-6" style={{ borderColor: '#d1d5db' }}>
            <div className="text-5xl mb-3">🏨</div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1f2937' }}>SmartStay Hotels</h1>
            <p style={{ color: '#4b5563' }}>Premium Accommodations Worldwide</p>
            <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
              Email: support@smartstay.com | Phone: +1 (800) 123-4567
            </p>
          </div>

          {/* Receipt Header */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-bold mb-3" style={{ color: '#1f2937' }}>Receipt To:</h2>
              <p className="font-semibold" style={{ color: '#1f2937' }}>{receipt.guestName}</p>
              <p style={{ color: '#4b5563' }}>{receipt.guestEmail}</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold mb-3" style={{ color: '#1f2937' }}>Receipt Details:</h2>
              <p style={{ color: '#374151' }}>
                <span className="font-semibold">Receipt #:</span> {receipt.paymentID}
              </p>
              <p style={{ color: '#374151' }}>
                <span className="font-semibold">Booking #:</span> {receipt.bookingID}
              </p>
              <p style={{ color: '#374151' }}>
                <span className="font-semibold">Payment Date:</span>{' '}
                {new Date(receipt.paymentDate).toLocaleDateString()}
              </p>
              <p style={{ color: '#374151' }}>
                <span className="font-semibold">Status:</span>{' '}
                <span className="font-bold" style={{ color: receipt.status === 'Completed' ? '#16a34a' : '#eab308' }}>
                  {receipt.status}
                </span>
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 border-b pb-2" style={{ color: '#1f2937', borderColor: '#d1d5db' }}>Booking Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm" style={{ color: '#4b5563' }}>Hotel</p>
                <p className="font-semibold" style={{ color: '#1f2937' }}>{receipt.hotelName}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#4b5563' }}>Room Type</p>
                <p className="font-semibold" style={{ color: '#1f2937' }}>{receipt.roomType}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#4b5563' }}>Check-in Date</p>
                <p className="font-semibold" style={{ color: '#1f2937' }}>
                  {new Date(receipt.checkInDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#4b5563' }}>Check-out Date</p>
                <p className="font-semibold" style={{ color: '#1f2937' }}>
                  {new Date(receipt.checkOutDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 border-b pb-2" style={{ color: '#1f2937', borderColor: '#d1d5db' }}>Payment Breakdown</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: '#d1d5db' }}>
                  <th className="text-left py-2" style={{ color: '#374151' }}>Description</th>
                  <th className="text-right py-2" style={{ color: '#374151' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" style={{ borderColor: '#d1d5db' }}>
                  <td className="py-3" style={{ color: '#374151' }}>Total Booking Amount</td>
                  <td className="text-right py-3" style={{ color: '#374151' }}>
                    RM{receipt.totalAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b" style={{ borderColor: '#d1d5db' }}>
                  <td className="py-3" style={{ color: '#374151' }}>
                    Deposit Paid (20%)
                    <br />
                    <span className="text-sm" style={{ color: '#6b7280' }}>
                      Payment Method: {receipt.paymentMethod}
                    </span>
                  </td>
                  <td className="text-right py-3" style={{ color: '#374151' }}>
                    RM{receipt.amount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b-2" style={{ borderColor: '#9ca3af' }}>
                  <td className="py-3 font-semibold" style={{ color: '#374151' }}>
                    Remaining Balance
                    <br />
                    <span className="text-sm font-normal" style={{ color: '#6b7280' }}>
                      (To be paid at check-in)
                    </span>
                  </td>
                  <td className="text-right py-3 font-semibold" style={{ color: '#374151' }}>
                    RM{(receipt.totalAmount - receipt.amount).toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-4 text-lg font-bold" style={{ color: '#1f2937' }}>Amount Paid</td>
                  <td className="text-right py-4 text-lg font-bold" style={{ color: '#16a34a' }}>
                    RM{receipt.amount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Important Notes */}
          <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#eff6ff', borderColor: '#60a5fa' }}>
            <h3 className="font-semibold mb-2" style={{ color: '#1e40af' }}>Important Information:</h3>
            <ul className="text-sm space-y-1" style={{ color: '#1e3a8a' }}>
              <li>• This receipt confirms your deposit payment of 20% of the total booking amount.</li>
              <li>• The remaining balance of RM{(receipt.totalAmount - receipt.amount).toFixed(2)} must be paid at check-in.</li>
              <li>• Please bring a valid ID and this receipt at check-in.</li>
              <li>• Cancellation policy: Deposits are non-refundable.</li>
              <li>• For questions, contact us at support@smartstay.com or call +1 (800) 123-4567.</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-sm border-t pt-6" style={{ color: '#6b7280', borderColor: '#d1d5db' }}>
            <p className="mb-2">Thank you for choosing SmartStay Hotels!</p>
            <p>We look forward to welcoming you.</p>
            <p className="mt-4 text-xs">
              This is an automated receipt generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        /* Override Tailwind oklch colors with hex for PDF generation */
        .receipt-content * {
          color: inherit !important;
        }
        .receipt-content {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .receipt-content .text-gray-800,
        .receipt-content .text-gray-700,
        .receipt-content .text-gray-600,
        .receipt-content .text-gray-500 {
          color: #374151 !important;
        }
        .receipt-content .text-green-600 {
          color: #16a34a !important;
        }
        .receipt-content .text-blue-800,
        .receipt-content .text-blue-700 {
          color: #1e40af !important;
        }
        .receipt-content .bg-blue-50 {
          background-color: #eff6ff !important;
        }
        .receipt-content .border-blue-400 {
          border-color: #60a5fa !important;
        }
        .receipt-content .border-gray-300,
        .receipt-content .border-gray-400 {
          border-color: #d1d5db !important;
        }
        
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPage;
