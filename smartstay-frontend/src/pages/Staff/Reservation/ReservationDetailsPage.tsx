import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "../../../config";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Bed,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Printer,
  Banknote,
  Mars,
  Venus,
} from "lucide-react";
import { Booking, Payment } from "./types";
import {
  BookingStatusBadge,
  RoomStatusBadge,
} from "../../../components/ReservationBadges";
import StripeCardForm from "../../../components/StripeCardForm";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface ReservationDetailsPageProps {
  booking: Booking;
  goBack: () => void;
  updateBookingStatus: (id: number, status: string) => Promise<void>;
  processPayment: (
    bookingId: number,
    amount: number,
    method: string
  ) => Promise<void>;
  refreshDetails: (id?: number) => void;
  refreshList: () => void;
  allBookings: Booking[];
}

export default function ReservationDetailsPage({
  booking,
  goBack,
  updateBookingStatus,
  processPayment,
  refreshDetails,
  refreshList,
  allBookings,
}: ReservationDetailsPageProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"Cash" | "Stripe">("Cash");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "confirm" | "checkin" | "checkout" | "cancel" | null
  >(null);

  // Only include ACTIVE (non-cancelled) bookings
  const allRelatedBookings = allBookings.filter(
    (b) =>
      b.guest.email === booking.guest.email &&
      b.checkInDate === booking.checkInDate &&
      b.checkOutDate === booking.checkOutDate
  );

  // Only active bookings — for display and calculations
  const activeBookings = allRelatedBookings.filter(
    (b) => b.bookingStatus !== "Cancelled"
  );

  const roomCount = activeBookings.length;
  const totalAmount = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPaid = allRelatedBookings.reduce((sum, b) => sum + b.totalPaid, 0); // ← MONEY SAFE
  const pendingAmount = totalAmount - totalPaid;

  const mainBooking =
    activeBookings.find((b) => b.payments.length > 0) ||
    activeBookings[0] ||
    allRelatedBookings[0];

  const handleCashPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > pendingAmount) {
      alert(`Invalid amount. Max: RM ${pendingAmount.toFixed(2)}`);
      return;
    }

    // Always pay on the first booking (this is where all payments go)
    const paymentBookingId = activeBookings[0].bookingId;

    await processPayment(paymentBookingId, amount, "Cash");

    setShowPaymentForm(false);
    setPaymentAmount("");
    refreshDetails();
    refreshList();
  };

  const handleStripeSuccess = () => {
    alert("Card payment successful!");
    refreshDetails();
    refreshList();
    setShowPaymentForm(false);
    setPaymentAmount("");
  };

  const handleAction = (
    action: "confirm" | "checkin" | "checkout" | "cancel"
  ) => {
    if ((action === "checkin" || action === "checkout") && pendingAmount > 0) {
      alert(
        "Payment Required: Full payment must be completed before check-in/check-out."
      );
      return;
    }
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const handleRemoveRoom = async (bookingIdToRemove: number) => {
    const roomToRemove = activeBookings.find(
      (b) => b.bookingId === bookingIdToRemove
    );
    if (!roomToRemove) return;

    if (!["Pending", "Confirmed"].includes(mainBooking.bookingStatus)) {
      alert("Cannot remove rooms after check-in has started.");
      return;
    }

    const isLastRoom = activeBookings.length === 1;

    const confirmMessage = isLastRoom
      ? "This is the last room. Removing it will CANCEL the entire reservation.\n\nProceed?"
      : `Remove Room ${roomToRemove.room.roomNumber} from this reservation?\n\nOnly this room will be cancelled. Others remain.`;

    if (!confirm(confirmMessage)) return;

    try {
      await updateBookingStatus(bookingIdToRemove, "Cancelled");

      if (isLastRoom) {
        alert("Reservation fully cancelled — no rooms remaining.");
        goBack(); // Go back to list
        return;
      }

      // Find a remaining active booking ID
      const remainingActive = activeBookings.filter(
        (b) => b.bookingId !== bookingIdToRemove
      );
      const newActiveId = remainingActive[0]?.bookingId || bookingIdToRemove;

      alert(
        `Room ${roomToRemove.room.roomNumber} removed successfully.\nReservation continues with remaining rooms.`
      );

      // Refresh with fresh data using the new active booking ID
      refreshDetails(newActiveId);
      refreshList(); // ← This updates the list
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const statusMap: Record<typeof confirmAction, string> = {
      confirm: "Confirmed",
      checkin: "CheckedIn",
      checkout: "CheckedOut",
      cancel: "Cancelled",
    };

    // Update ALL related bookings
    for (const b of activeBookings) {
      await updateBookingStatus(b.bookingId, statusMap[confirmAction]);
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
        <span className="font-medium">Back to Reservations</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Reservation #{mainBooking.bookingId}
              {roomCount > 1 && ` +${roomCount - 1}`}
            </h1>
            <p className="text-gray-500 mt-1">
              Created on {mainBooking.createdAt}
            </p>
            {roomCount > 1 && (
              <p className="text-sm text-purple-600 font-medium mt-1">
                Multi-room booking • {roomCount} rooms
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <BookingStatusBadge status={mainBooking.bookingStatus} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-sky-600" /> Guest Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">
                  {mainBooking.guest.fullName}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">IC Number</p>
                <p className="font-medium text-gray-900">
                  {mainBooking.guest.icNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email Address</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {mainBooking.guest.email}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {mainBooking.guest.phoneNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {mainBooking.guest.address}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Gender</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  {mainBooking.guest.gender === "Male" ? (
                    <Mars className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Venus className="h-4 w-4 text-gray-400" />
                  )}
                  {mainBooking.guest.gender}
                </p>
              </div>
            </div>
          </div>

          {/* Rooms Booked */}
          {/* Rooms Booked */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <Bed className="h-5 w-5 text-purple-600" /> Rooms Booked (
              {roomCount})
            </h3>
            <div className="space-y-3">
              {activeBookings.map((b) => (
                <div
                  key={b.bookingId}
                  className={`flex justify-between items-center p-4 rounded-lg border ${
                    b.bookingStatus === "Cancelled"
                      ? "bg-gray-100 border-gray-300 opacity-60"
                      : "bg-purple-50 border-purple-200"
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-bold text-purple-900">
                      Room {b.room.roomNumber}
                      {b.bookingStatus === "Cancelled" && " (Removed)"}
                    </p>
                    <p className="text-sm text-purple-700">
                      {b.room.roomType} • RM {b.totalAmount.toFixed(2)}
                    </p>
                    <div className="mt-2 flex gap-2 items-center">
                      <BookingStatusBadge status={b.bookingStatus} />
                      <RoomStatusBadge status={b.room.status} />
                    </div>
                  </div>

                  {/* REMOVE BUTTON — Show for ANY room if main status allows */}
                  {["Pending", "Confirmed"].includes(
                    mainBooking.bookingStatus
                  ) &&
                    b.bookingStatus !== "Cancelled" && (
                      <button
                        onClick={() => handleRemoveRoom(b.bookingId)}
                        className="ml-4 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition shadow-md flex items-center gap-2"
                      >
                        <XCircle size={18} />
                        {activeBookings.length === 1
                          ? "Cancel Reservation"
                          : "Remove Room"}
                      </button>
                    )}
                </div>
              ))}
            </div>

            {/* Warning */}
            {roomCount === 1 &&
              ["Pending", "Confirmed"].includes(mainBooking.bookingStatus) && (
                <p className="text-sm text-amber-700 mt-6 text-center font-medium bg-amber-50 p-4 rounded-lg">
                  Only 1 room remaining. To remove it, please cancel the entire
                  reservation.
                </p>
              )}
          </div>

          {/* Reservation Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-emerald-600" /> Stay Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Check-In Date</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {mainBooking.checkInDate}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Check-Out Date</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {mainBooking.checkOutDate}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Number of Nights</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  {mainBooking.numberOfNights} night(s)
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total Guests</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  {mainBooking.totalGuests} guest(s)
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-purple-600" /> Payment History
            </h3>
            {allRelatedBookings.flatMap((b) => b.payments).length > 0 ? (
              <div className="space-y-3">
                {allRelatedBookings
                  .flatMap((b) => b.payments)
                  .map((payment: Payment) => (
                    <div
                      key={payment.paymentId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            RM {payment.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.paymentDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <PaymentMethodBadge method={payment.paymentMethod} />
                        <PaymentStatusBadge status={payment.status} />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">
                  No payments recorded yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" /> Financial
              Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Number of Rooms</span>
                <span className="font-medium text-gray-900">{roomCount}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Number of Nights</span>
                <span className="font-medium text-gray-900">
                  {mainBooking.numberOfNights}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-gray-900 text-lg">
                  RM {totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-green-600">
                  RM {totalPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold text-gray-900">Balance Due</span>
                <span
                  className={`font-bold text-xl ${
                    pendingAmount > 0 ? "text-amber-600" : "text-green-600"
                  }`}
                >
                  RM {pendingAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {pendingAmount > 0 && mainBooking.bookingStatus !== "Cancelled" && (
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
                    min="0"
                    max={pendingAmount}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max: ${pendingAmount.toFixed(2)}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
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
                      type="button"
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
                      bookingId={mainBooking.bookingId}
                      amount={parseFloat(paymentAmount) || pendingAmount}
                      onSuccess={handleStripeSuccess}
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
              {mainBooking.bookingStatus === "Pending" && (
                <button
                  onClick={() => handleAction("confirm")}
                  className="w-full px-4 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Confirm Booking
                </button>
              )}
              {mainBooking.bookingStatus === "Confirmed" &&
                (pendingAmount === 0 ? (
                  <button
                    onClick={() => handleAction("checkin")}
                    className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Check In Guest
                  </button>
                ) : (
                  <div className="w-full px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium text-center text-sm">
                    Full Payment Required for Check-In
                  </div>
                ))}
              {mainBooking.bookingStatus === "CheckedIn" &&
                (pendingAmount === 0 ? (
                  <button
                    onClick={() => handleAction("checkout")}
                    className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Check Out Guest
                  </button>
                ) : (
                  <div className="w-full px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium text-center text-sm">
                    Full Payment Required for Check-Out
                  </div>
                ))}
              {(mainBooking.bookingStatus === "Pending" ||
                mainBooking.bookingStatus === "Confirmed") && (
                <button
                  onClick={() => handleAction("cancel")}
                  className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Cancel Reservation
                </button>
              )}
              {(mainBooking.bookingStatus === "CheckedOut" ||
                mainBooking.bookingStatus === "Cancelled") && (
                <div className="px-4 py-3 rounded-lg bg-gray-100 text-gray-600 font-medium text-center">
                  Reservation {mainBooking.bookingStatus}
                </div>
              )}
            </div>
          </div>

          <BookingTimeline booking={mainBooking} />
        </div>
      </div>

      {showConfirmDialog && confirmAction && (
        <ConfirmDialog
          action={confirmAction}
          booking={mainBooking}
          onConfirm={executeAction}
          onCancel={() => {
            setShowConfirmDialog(false);
            setConfirmAction(null);
          }}
        />
      )}
    </main>
  );
}

// Keep all your helper components exactly as you wrote them
function PaymentMethodBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    CreditCard: "bg-blue-100 text-blue-700",
    DebitCard: "bg-indigo-100 text-indigo-700",
    Cash: "bg-green-100 text-green-700",
    OnlineTransfer: "bg-purple-100 text-purple-700",
  };
  const labels: Record<string, string> = {
    CreditCard: "Credit Card",
    DebitCard: "Debit Card",
    OnlineTransfer: "Online Transfer",
  };
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${styles[method]} mb-1`}
    >
      {labels[method] || method}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Failed: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function BookingTimeline({ booking }: { booking: Booking }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Booking Timeline</h3>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <div className="w-0.5 h-full bg-gray-200 my-1"></div>
          </div>
          <div className="pb-4">
            <p className="font-medium text-gray-900">Booking Created</p>
            <p className="text-xs text-gray-500">{booking.createdAt}</p>
          </div>
        </div>
        {booking.bookingStatus !== "Pending" && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
                <CheckCircle size={16} className="text-sky-600" />
              </div>
              <div className="w-0.5 h-full bg-gray-200 my-1"></div>
            </div>
            <div className="pb-4">
              <p className="font-medium text-gray-900">Booking Confirmed</p>
              <p className="text-xs text-gray-500">Status updated</p>
            </div>
          </div>
        )}
        {(booking.bookingStatus === "CheckedIn" ||
          booking.bookingStatus === "CheckedOut") && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={16} className="text-green-600" />
              </div>
              {booking.bookingStatus === "CheckedOut" && (
                <div className="w-0.5 h-full bg-gray-200 my-1"></div>
              )}
            </div>
            <div className="pb-4">
              <p className="font-medium text-gray-900">Guest Checked In</p>
              <p className="text-xs text-gray-500">{booking.checkInDate}</p>
            </div>
          </div>
        )}
        {booking.bookingStatus === "CheckedOut" && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle size={16} className="text-blue-600" />
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">Guest Checked Out</p>
              <p className="text-xs text-gray-500">{booking.checkOutDate}</p>
            </div>
          </div>
        )}
        {booking.bookingStatus === "Cancelled" && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle size={16} className="text-red-600" />
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">Booking Cancelled</p>
              <p className="text-xs text-gray-500">Reservation terminated</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmDialog({
  action,
  booking,
  onConfirm,
  onCancel,
}: {
  action: "confirm" | "checkin" | "checkout" | "cancel";
  booking: Booking;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titles = {
    confirm: "Confirm Booking",
    checkin: "Check In Guest",
    checkout: "Check Out Guest",
    cancel: "Cancel Reservation",
  };

  const messages = {
    confirm: `Confirm reservation for ${booking.guest.fullName}?`,
    checkin: `Check in ${booking.guest.fullName} to all booked rooms?`,
    checkout: `Check out ${booking.guest.fullName} from all rooms?`,
    cancel: `Are you sure you want to cancel this reservation? This action cannot be undone.`,
  };

  const buttonColors = {
    confirm: "bg-sky-600 hover:bg-sky-700",
    checkin: "bg-green-600 hover:bg-green-700",
    checkout: "bg-blue-600 hover:bg-blue-700",
    cancel: "bg-red-600 hover:bg-red-700",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {titles[action]}
        </h3>
        <p className="text-gray-600 mb-6">{messages[action]}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition ${buttonColors[action]}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

