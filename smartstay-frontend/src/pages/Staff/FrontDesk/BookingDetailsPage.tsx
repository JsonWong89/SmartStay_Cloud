import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { paymentsAPI } from "../../../services/api";
import { STRIPE_PUBLISHABLE_KEY } from "../../../config";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Bed,
  CreditCard,
  Banknote,
  CheckCircle,
  XCircle,
  Mars,
  Venus,
} from "lucide-react";
import StripeCardForm from "../../../components/StripeCardForm";
import { StatusBadge, ActivityBadge, PaymentBadge } from "../../../components/BookingBadges";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export interface Booking {
  BookingID: number;
  GuestName: string;
  RoomNumber: string;
  RoomType: string;
  CheckInDate: string;
  CheckOutDate: string;
  ActivityType: "Check-In" | "Check-Out" | "Stayover";
  BookingStatus: "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled" | "Pending";
  CheckInTime: string | null;
  CheckOutTime: string | null;
  TotalAmount: number;
  DepositAmount: number;
  PaymentStatus: "Completed" | "Pending" | "Failed";
  TotalGuests: number;
  Email: string;
  PhoneNumber: string;
  ICNumber: string;
  Address: string;
  Gender: string;
  AmountPaid: number;
  Payments?: Array<{
    paymentId: number;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    status: string;
  }>;
}

interface BookingDetailsPageProps {
  booking: Booking;
  allBookings: Booking[];
  goBack: () => void;
  updateBooking: (booking: Booking) => void;
  updateStatus: (
    id: number,
    status: "CheckedIn" | "CheckedOut" | "Cancelled"
  ) => Promise<void>;
  refreshDetails: () => void;
}

export default function BookingDetailsPage({
  booking,
  allBookings,
  goBack,
  updateBooking,
  updateStatus,
  refreshDetails,
}: BookingDetailsPageProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"Cash" | "Stripe">("Cash");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"checkin" | "checkout" | "cancel" | null>(null);

  // Find all related bookings (same guest, same dates)
  const allRelatedBookings = allBookings.filter(
    (b) =>
      b.Email === booking.Email &&
      b.CheckInDate === booking.CheckInDate &&
      b.CheckOutDate === booking.CheckOutDate
  );

  // Only active bookings (non-cancelled) for display and calculations
  const activeBookings = allRelatedBookings.filter(
    (b) => b.BookingStatus !== "Cancelled"
  );

  const roomCount = activeBookings.length;
  const totalAmount = activeBookings.reduce((sum, b) => sum + b.TotalAmount, 0);
  const totalPaid = allRelatedBookings.reduce((sum, b) => sum + b.AmountPaid, 0); // Include cancelled for money safety
  const pendingAmount = totalAmount - totalPaid;

  const mainBooking =
    activeBookings.find((b) => b.Payments && b.Payments.length > 0) ||
    activeBookings[0] ||
    allRelatedBookings[0];

  const handleCashPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > pendingAmount) {
      alert(`Invalid amount. Max: RM ${pendingAmount.toFixed(2)}`);
      return;
    }

    try {
      // Always pay on the first active booking
      const paymentBookingId = activeBookings[0].BookingID;
      const res = await paymentsAPI.processPayment(paymentBookingId, amount, "Cash");
      if (res.success) {
        alert("Cash payment recorded!");
        refreshDetails();
        setShowPaymentForm(false);
        setPaymentAmount("");
      }
    } catch (err: any) {
      alert("Payment failed: " + (err.message || "Unknown error"));
    }
  };

  const handleAction = (action: "checkin" | "checkout" | "cancel") => {
    if ((action === "checkin" || action === "checkout") && pendingAmount > 0) {
      alert("Payment Required: Full payment must be completed before check-in/check-out.");
      return;
    }
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    let status: "CheckedIn" | "CheckedOut" | "Cancelled" = "Cancelled";
    if (confirmAction === "checkin") status = "CheckedIn";
    if (confirmAction === "checkout") status = "CheckedOut";

    // Update ALL active bookings with the same status
    for (const b of activeBookings) {
      await updateStatus(b.BookingID, status);
    }

    setShowConfirmDialog(false);
    setConfirmAction(null);
    refreshDetails();
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Front Desk</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Booking #{mainBooking.BookingID}
              {roomCount > 1 && ` +${roomCount - 1}`}
            </h1>
            <p className="text-gray-500 mt-1">
              {mainBooking.GuestName} • Room {mainBooking.RoomNumber}
              {roomCount > 1 && ` +${roomCount - 1} more`}
            </p>
            {roomCount > 1 && (
              <p className="text-sm text-purple-600 font-medium mt-1">
                Multi-room booking • {roomCount} rooms
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <StatusBadge status={mainBooking.BookingStatus} />
            <ActivityBadge type={mainBooking.ActivityType} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-sky-600" /> Guest Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{mainBooking.GuestName}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">IC Number</p>
                <p className="font-medium text-gray-900">
                  {mainBooking.ICNumber || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {mainBooking.Email}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {mainBooking.PhoneNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {mainBooking.Address}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Gender</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  {mainBooking.Gender === "Male" ? (
                    <Mars className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Venus className="h-4 w-4 text-gray-400" />
                  )}
                  {mainBooking.Gender}
                </p>
              </div>
            </div>
          </div>

          {/* Rooms Booked - NEW SECTION */}
          {roomCount > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bed className="h-5 w-5 text-purple-600" /> Rooms Booked ({roomCount})
              </h3>
              <div className="space-y-3">
                {activeBookings.map((b) => (
                  <div
                    key={b.BookingID}
                    className="flex justify-between items-center p-4 rounded-lg border bg-purple-50 border-purple-200"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-purple-900">
                        Room {b.RoomNumber}
                      </p>
                      <p className="text-sm text-purple-700">
                        {b.RoomType} • RM {b.TotalAmount.toFixed(2)}
                      </p>
                      <div className="mt-2 flex gap-2 items-center">
                        <StatusBadge status={b.BookingStatus} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bed className="h-5 w-5 text-emerald-600" /> Booking Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {roomCount === 1 && (
                <>
                  <div>
                    <p className="text-gray-500 mb-1">Room Number</p>
                    <p className="font-medium text-gray-900">{mainBooking.RoomNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Room Type</p>
                    <p className="font-medium text-gray-900">{mainBooking.RoomType}</p>
                  </div>
                </>
              )}
              {roomCount > 1 && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 mb-1">Rooms</p>
                  <p className="font-medium text-gray-900">
                    {activeBookings.map((b) => `Room ${b.RoomNumber}`).join(", ")}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-500 mb-1">Check-In Date</p>
                <p className="font-medium text-gray-900">{mainBooking.CheckInDate}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Check-Out Date</p>
                <p className="font-medium text-gray-900">{mainBooking.CheckOutDate}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total Guests</p>
                <p className="font-medium text-gray-900">
                  {mainBooking.TotalGuests} Guest(s)
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Booking Status</p>
                <StatusBadge status={mainBooking.BookingStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary & Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" /> Payment Summary
            </h3>
            <div className="space-y-3 text-sm">
              {roomCount > 1 && (
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Number of Rooms</span>
                  <span className="font-medium text-gray-900">{roomCount}</span>
                </div>
              )}
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-gray-900 text-lg">
                  RM {totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-green-600">
                  RM {totalPaid.toFixed(2)}
                </span>
              </div>
              {roomCount === 1 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit Amount</span>
                  <span className="font-medium text-gray-700">
                    RM {mainBooking.DepositAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t">
                <span className="font-semibold text-gray-900">Pending Amount</span>
                <span
                  className={`font-bold text-lg ${
                    pendingAmount > 0 ? "text-amber-600" : "text-green-600"
                  }`}
                >
                  RM {pendingAmount.toFixed(2)}
                </span>
              </div>

              {pendingAmount > 0 &&
                mainBooking.BookingStatus === "CheckedIn" &&
                mainBooking.ActivityType === "Check-Out" && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium text-center">
                    Check-Out is blocked until full payment is received
                  </div>
                )}

              <div className="pt-3 border-t">
                <p className="text-gray-600 mb-2">Payment Status</p>
                <PaymentBadge status={pendingAmount > 0 ? "Pending" : "Completed"} />
              </div>
            </div>

            {pendingAmount > 0 && mainBooking.BookingStatus !== "Cancelled" && (
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="w-full mt-4 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition flex items-center justify-center gap-2"
              >
                <Banknote size={18} /> Make Payment
              </button>
            )}

            {showPaymentForm && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max: ${pendingAmount.toFixed(2)}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentType("Cash")}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                        paymentType === "Cash"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-300 bg-white text-gray-700"
                      }`}
                    >
                      <Banknote className="inline h-4 w-4 mr-1" /> Cash
                    </button>
                    <button
                      onClick={() => setPaymentType("Stripe")}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                        paymentType === "Stripe"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-300 bg-white text-gray-700"
                      }`}
                    >
                      <CreditCard className="inline h-4 w-4 mr-1" /> Card
                    </button>
                  </div>
                </div>

                {paymentType === "Cash" && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowPaymentForm(false);
                        setPaymentAmount("");
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCashPayment}
                      className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
                    >
                      Confirm Cash Payment
                    </button>
                  </div>
                )}

                {paymentType === "Stripe" && (
                  <Elements stripe={stripePromise}>
                    <StripeCardForm
                      bookingId={activeBookings[0].BookingID}
                      amount={parseFloat(paymentAmount) || pendingAmount}
                      onSuccess={() => {
                        alert("Card payment successful!");
                        setShowPaymentForm(false);
                        setPaymentAmount("");
                        refreshDetails();
                      }}
                      onCancel={() => setShowPaymentForm(false)}
                    />
                  </Elements>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {mainBooking.BookingStatus === "Confirmed" &&
                (pendingAmount === 0 ? (
                  <button
                    onClick={() => handleAction("checkin")}
                    className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Complete Check-In
                  </button>
                ) : (
                  <div className="w-full px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium text-center flex items-center justify-center gap-2">
                    <XCircle size={18} /> Full Payment Required for Check-In
                  </div>
                ))}
              {mainBooking.BookingStatus === "CheckedIn" &&
                mainBooking.ActivityType === "Check-Out" &&
                (pendingAmount === 0 ? (
                  <button
                    onClick={() => handleAction("checkout")}
                    className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Complete Check-Out
                  </button>
                ) : (
                  <div className="w-full px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium text-center flex items-center justify-center gap-2">
                    <XCircle size={18} /> Full Payment Required for Check-Out
                  </div>
                ))}
              {(mainBooking.BookingStatus === "Confirmed" ||
                mainBooking.BookingStatus === "CheckedIn") && (
                <button
                  onClick={() => handleAction("cancel")}
                  className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Cancel Booking
                </button>
              )}
              {mainBooking.BookingStatus === "CheckedIn" &&
                mainBooking.ActivityType === "Stayover" && (
                  <div className="px-4 py-3 rounded-lg bg-amber-100 text-amber-700 font-medium text-center">
                    Guest Currently In-House
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction === "checkin"
                ? "Confirm Check-In"
                : confirmAction === "checkout"
                ? "Confirm Check-Out"
                : "Cancel Booking"}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmAction === "cancel"
                ? `This action will cancel ${roomCount > 1 ? `all ${roomCount} rooms` : "this booking"}. This cannot be undone.`
                : `Complete ${confirmAction} for ${mainBooking.GuestName}${roomCount > 1 ? ` (${roomCount} rooms)` : ""}?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition ${
                  confirmAction === "cancel"
                    ? "bg-red-600 hover:bg-red-700"
                    : confirmAction === "checkin"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}