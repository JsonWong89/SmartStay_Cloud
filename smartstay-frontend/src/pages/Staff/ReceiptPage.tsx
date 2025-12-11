import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { paymentsAPI, bookingsAPI } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import { ArrowLeft, Download, Printer } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useAuthStore } from "../../store";

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
  room: { hotelName: string; roomNumber: string; roomType: string };
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
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [relatedBookings, setRelatedBookings] = useState<any[]>([]);
  const [mainBooking, setMainBooking] = useState<any>(null);

  useEffect(() => {
    const loadReceiptData = async () => {
      if (!bookingId) {
        setError("Invalid booking ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Get the main booking
        const mainBookingRes = await bookingsAPI.getBookingById(
          Number(bookingId)
        );
        if (!mainBookingRes.success || !mainBookingRes.data) {
          throw new Error("Booking not found");
        }
        const mainBooking = mainBookingRes.data;
        setMainBooking(mainBooking);

        // 2. Get ALL related bookings (same guest + same dates)
        const allBookingsRes = await bookingsAPI.getAllBookings({
          hotelId: user?.hotelId || 1,
          guestId: mainBooking.guest.guestId,
          dateFrom: mainBooking.checkInDate,
          dateTo: mainBooking.checkOutDate,
        });

        const relatedBookings = allBookingsRes.success
          ? allBookingsRes.data
          : [mainBooking];
        setRelatedBookings(relatedBookings);

        // 3. Calculate total amount from ALL rooms
        const totalAmount = relatedBookings.reduce(
          (sum: number, b: any) => sum + b.totalAmount,
          0
        );

        // 4. Fetch payments for every booking ID
        const allPayments: Payment[] = [];
        for (const booking of relatedBookings) {
          const paymentsRes = await paymentsAPI.getPaymentsByBooking(
            booking.bookingId
          );
          if (paymentsRes.success && paymentsRes.data) {
            allPayments.push(...paymentsRes.data);
          }
        }

        // Remove duplicate payments
        const uniquePayments = allPayments.filter(
          (p, index, self) =>
            self.findIndex((x) => x.paymentId === p.paymentId) === index
        );

        setPayments(uniquePayments);

        // 5. Set booking info with combined data
        setBooking({
          bookingId: relatedBookings
            .map((booking: any) => booking.bookingId)
            .join(" + "),
          bookingStatus: mainBooking.bookingStatus,
          guest: mainBooking.guest,
          room: mainBooking.room,
          checkInDate: mainBooking.checkInDate.split("T")[0],
          checkOutDate: mainBooking.checkOutDate.split("T")[0],
          totalAmount,
          depositAmount: mainBooking.depositAmount || 0,
          numberOfNights: mainBooking.numberOfNights || 1,
          totalGuests: mainBooking.totalGuests || 1,
        });
      } catch (err: any) {
        setError(err.message || "Unable to load receipt");
      } finally {
        setLoading(false);
      }
    };

    loadReceiptData();
  }, [bookingId, user?.hotelId]);
  const handlePrint = () => window.print();

  const handleDownload = async () => {
    if (!receiptRef.current || !booking) {
      alert("Receipt content not available");
      return;
    }

    setDownloading(true);

    try {
      const opt = {
        margin: [0.4, 0.4, 0.4, 0.4] as [number, number, number, number], // Fixed: proper tuple
        filename: `SmartStay-Receipt-${booking.bookingId}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff", // Ensures clean background
        },
        jsPDF: {
          unit: "in" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
      };

      await html2pdf().set(opt).from(receiptRef.current).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Use Print → Save as PDF instead.");
    } finally {
      setDownloading(false);
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = booking ? booking.totalAmount - totalPaid : 0;
  const isCancelled = booking?.bookingStatus === "Cancelled";
  const hasNoPayments = payments.length === 0;

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-xl">
        Loading receipt...
      </div>
    );
  if (error || !booking)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-xl text-red-600">
        {error || "Receipt not found"}
      </div>
    );

  return (
    <>
      {/* Compact & Beautiful CSS - Fits on 1 A4 Page */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #receipt-to-print, #receipt-to-print * { visibility: visible !important; }
          #receipt-to-print {
            position: absolute !important;
            left: 0 !important; top: 0 !important;
            width: 100% !important; margin: 0 !important; padding: 0 !important;
            box-shadow: none !important; border-radius: 0 !important;
          }
          .print-hidden { display: none !important; }
          @page { margin: 0.4cm; size: A4; }
        }
        .receipt-wrapper { font-family: system-ui, -apple-system, sans-serif; line-height: 1.4; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; margin-bottom: 16px; }
        .header-icon { font-size: 42px; margin-bottom: 8px; }
        .header-title { font-size: 28px; font-weight: bold; margin: 0 0 4px 0; color: #1f2937; }
        .header-subtitle { font-size: 15px; color: #6b7280; margin: 0; }
        .header-contact { font-size: 13px; color: #6b7280; margin-top: 8px; }
        .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center; margin: 16px 0; padding: 12px 0; background: #faf5ff; border-radius: 8px; }
        .info-item-label { font-size: 11px; color: #9333ea; font-weight: 600; }
        .info-item-value { font-size: 14px; font-weight: bold; color: #581c87; }
        .section-title { font-size: 17px; font-weight: bold; color: #1f2937; margin: 20px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .box { background: #f9fafb; padding: 14px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .box-purple { background: #faf5ff; border-color: #e9d5ff; }
        .box-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #1f2937; }
        .box-text { font-size: 13.5px; color: #4b5563; }
        .stay-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; margin: 12px 0; }
        .stay-label { font-size: 13px; color: #6b7280; }
        .stay-value { font-size: 15px; font-weight: bold; color: #1f2937; }
        .table { width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden; margin: 12px 0; }
        .table th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; }
        .table th:last-child { text-align: right; }
        .table td { padding: 10px 12px; border-top: 1px solid #e5e7162; font-size: 13.5px; }
        .table td:last-child { text-align: right; font-weight: 600; }
        .total-row { background: #faf5ff !important; border-top: 2px solid #e9d5ff; }
        .total-label { font-size: 16px !important; font-weight: bold !important; }
        .total-value { font-size: 18px !important; color: #16a34a !important; }
        .balance-row { background: #fffbeb !important; }
        .balance-value { color: #d97706 !important; }
        .alert { padding: 14px; border-left: 4px solid; border-radius: 0 6px 6px 0; margin: 16px 0; font-size: 14px; }
        .alert-cancelled { background: #fef2f2; border-color: #ef4444; color: #7f1d1d; }
        .alert-warning { background: #fffbeb; border-color: #f59e0b; color: #78350f; }
        .alert-success { background: #f0fdf4; border-color: #22c55e; color: #166534; }
        .alert-info { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; margin-top: 20px; font-size: 13px; color: #6b7280; }
        /* Fix for html2canvas - Override Tailwind oklch colors with hex */
       
        #receipt-to-print .bg-white { background-color: #ffffff !important; }
        #receipt-to-print .text-gray-600 { color: #4b5563 !important; }
        #receipt-to-print .text-purple-700 { color: #7e22ce !important; }
        #receipt-to-print .text-purple-600 { color: #9333ea !important; }
        #receipt-to-print .text-red-600 { color: #dc2626 !important; }
        #receipt-to-print .border-purple-200 { border-color: #e9d5ff !important; }
        #receipt-to-print .space-y-2 > * + * { margin-top: 0.5rem !important; }
      `}</style>

      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          activePage="Manage Guests"
          setActivePage={() => {}}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-[230px]"
          }`}
        >
          {loading && (
            <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">
              Loading receipt...
            </div>
          )}

          {!loading && error && (
            <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && booking && (
            <>
              {/* Top Buttons */}
              <header className="bg-white print-hidden">
                <div className="px-6 py-4 flex justify-between items-center flex-wrap gap-4">
                  <button
                    onClick={() => {
                      const guestId = (location.state as any)?.returnToGuestId;

                      if (guestId) {
                        // Go back to the guest management page and open the same guest
                        navigate("/staff/manage-guests", {
                          state: { openGuestId: guestId },
                          replace: true, // optional: cleans URL history
                        });
                      } else {
                        navigate(-1); // fallback if something went wrong
                      }
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    <ArrowLeft size={20} />
                    Back to {booking?.guest.fullName || "Guest Details"}
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrint}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2"
                    >
                      <Printer size={18} /> Print
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white px-5 py-2.5 rounded-lg flex items-center gap-2"
                    >
                      {downloading ? (
                        "Generating..."
                      ) : (
                        <>
                          <Download size={18} /> Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </header>

              {/* Receipt - Fits on 1 Page */}
              <div className="p-4 print:p-0">
                <div className="max-w-4xl mx-auto">
                  <div
                    id="receipt-to-print"
                    ref={receiptRef}
                    className="receipt-wrapper bg-white"
                    style={{ padding: "20px", fontSize: "13.5px" }}
                  >
                    {/* Compact Header */}
                    <div className="header">
                      <div className="header-icon">Hotel</div>
                      <h1 className="header-title">SmartStay Hotels</h1>
                      <p className="header-subtitle">
                        Premium Accommodation Experience
                      </p>
                      <p className="header-contact">
                        support@smartstay.com | +60 12-345 6789
                      </p>
                    </div>

                    {/* Info Bar */}
                    <div className="info-grid">
                      <div>
                        <p className="info-item-label">Receipt Number</p>
                        <p className="info-item-value">
                          {hasNoPayments
                            ? "N/A"
                            : `RCP-${payments[0].paymentId
                                .toString()
                                .padStart(6, "0")}`}
                        </p>
                      </div>
                      <div>
                        <p className="info-item-label">Booking ID</p>
                        <p className="info-item-value">#{booking.bookingId}</p>
                      </div>
                      <div>
                        <p className="info-item-label">Receipt Date</p>
                        <p className="info-item-value">
                          {hasNoPayments
                            ? "N/A"
                            : new Date(
                                payments[0].paymentDate
                              ).toLocaleDateString("en-MY")}
                        </p>
                      </div>
                      <div>
                        <p className="info-item-label">Status</p>
                        <p className="info-item-value">
                          <span
                            className={
                              isCancelled
                                ? "alert-cancelled"
                                : hasNoPayments
                                ? "alert-warning"
                                : "alert-success"
                            }
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                            }}
                          >
                            {isCancelled
                              ? "Cancelled"
                              : hasNoPayments
                              ? "No Payment"
                              : payments[0].status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Guest & Hotel Info */}
                    <div className="grid-2">
                      <div className="box">
                        <div className="box-title">Bill To</div>
                        <div className="box-text">
                          <p className="font-semibold text-base">
                            {booking.guest.fullName}
                          </p>
                          <p>{booking.guest.email}</p>
                          <p>{booking.guest.phoneNumber}</p>
                          <p>IC: {booking.guest.icNumber}</p>
                        </div>
                      </div>
                      <div className="box box-purple">
                        <div className="box-title">
                          Hotel Information{" "}
                          {relatedBookings.length > 1 &&
                            `(${relatedBookings.length} Rooms)`}
                        </div>
                        <div className="box-text space-y-2">
                          <p className="font-semibold text-base">
                            {mainBooking.room.hotelName || "SmartStay Hotel"}
                          </p>

                          {/* Show ALL rooms */}
                          {relatedBookings.map((b: any, index: number) => (
                            <div key={b.bookingId} className="py-1">
                              <span className="font-medium">
                                Room {b.room.roomNumber} - {b.room.roomType}
                              </span>
                              <span className="text-purple-700 ml-3">
                                RM {b.totalAmount.toFixed(2)}
                              </span>
                              {relatedBookings.length > 1 && (
                                <span className="text-xs text-purple-600 ml-2">
                                  (Booking #{b.bookingId})
                                </span>
                              )}
                            </div>
                          ))}

                          <div className="border-t border-purple-200 pt-2 mt-2">
                            <p>{booking?.totalGuests} Guest(s)</p>
                            <p>{booking?.numberOfNights} Night(s)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stay Details */}
                    <div className="section-title">Stay Details</div>
                    <div className="stay-grid">
                      <div>
                        <p className="stay-label">Check-In</p>
                        <p className="stay-value">
                          {new Date(booking.checkInDate).toLocaleDateString(
                            "en-MY",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="stay-label">Check-Out</p>
                        <p className="stay-value">
                          {new Date(booking.checkOutDate).toLocaleDateString(
                            "en-MY",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="stay-label">Duration</p>
                        <p className="stay-value">
                          {booking.numberOfNights} Nights
                        </p>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="section-title">Payment Summary</div>
                    {hasNoPayments ? (
                      <div className="alert alert-warning">
                        <strong>No Payments Recorded</strong> — Total amount
                        due: RM {booking.totalAmount.toFixed(2)}
                      </div>
                    ) : (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Total Booking Amount</td>
                            <td>RM {booking.totalAmount.toFixed(2)}</td>
                          </tr>
                          {payments.map((p, i) => (
                            <tr key={p.paymentId}>
                              <td>
                                Payment {i + 1} ({p.paymentMethod})
                                <br />
                                <span
                                  style={{ fontSize: "11px", color: "#6b7280" }}
                                >
                                  {new Date(p.paymentDate).toLocaleDateString(
                                    "en-MY"
                                  )}
                                </span>
                              </td>
                              <td className="payment-amount-paid">
                                - RM {p.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          <tr className="total-row">
                            <td className="total-label">Total Paid</td>
                            <td className="total-value">
                              RM {totalPaid.toFixed(2)}
                            </td>
                          </tr>
                          {remainingBalance > 0 && (
                            <tr className="balance-row">
                              <td className="total-label">Remaining Balance</td>
                              <td className="total-value balance-value">
                                RM {remainingBalance.toFixed(2)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {/* Final Message */}
                    {isCancelled ? (
                      <div className="alert alert-cancelled">
                        <strong>Booking Cancelled</strong> — Refund will be
                        processed according to policy.
                      </div>
                    ) : remainingBalance === 0 ? (
                      <div className="alert alert-success">
                        <strong>Payment Complete!</strong> Your booking is fully
                        paid and confirmed.
                      </div>
                    ) : hasNoPayments ? (
                      <div className="alert alert-warning">
                        <strong>Payment Required</strong> — Full payment needed
                        to confirm booking.
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        <strong>Thank you for your payment!</strong> Remaining:
                        RM {remainingBalance.toFixed(2)} due on check-in.
                      </div>
                    )}

                    {/* Footer */}
                    <div className="footer">
                      <p>
                        <strong>SmartStay Hotels</strong> •
                        support@smartstay.com • +60 12-345 6789
                      </p>
                      <p className="text-xs mt-2">
                        System-generated receipt •{" "}
                        {new Date().toLocaleString("en-MY")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ReceiptPage;
