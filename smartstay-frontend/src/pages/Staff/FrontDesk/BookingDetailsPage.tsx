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

  const pendingAmount = booking.TotalAmount - booking.AmountPaid;

  const handleCashPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > pendingAmount) {
      alert("Invalid amount");
      return;
    }

    try {
      const res = await paymentsAPI.processPayment(booking.BookingID, amount, "Cash");
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
    if (action === "checkin" && booking.PaymentStatus !== "Completed") {
      alert("Payment Required: Full payment must be completed before check-in.");
      return;
    }
    if (action === "checkout" && booking.PaymentStatus !== "Completed") {
      alert("Payment Required: Full payment must be completed before check-out.");
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
    await updateStatus(booking.BookingID, status);
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
              Booking #{booking.BookingID}
            </h1>
            <p className="text-gray-500 mt-1">
              {booking.GuestName} • Room {booking.RoomNumber}
            </p>
          </div>
          <div className="flex gap-3">
            <StatusBadge status={booking.BookingStatus} />
            <ActivityBadge type={booking.ActivityType} />
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
                <p className="font-medium text-gray-900">{booking.GuestName}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">IC Number</p>
                <p className="font-medium text-gray-900">
                  {booking.ICNumber || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {booking.Email}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {booking.PhoneNumber}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {booking.Address || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bed className="h-5 w-5 text-emerald-600" /> Booking Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Room Number</p>
                <p className="font-medium text-gray-900">{booking.RoomNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Room Type</p>
                <p className="font-medium text-gray-900">{booking.RoomType}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Check-In Date</p>
                <p className="font-medium text-gray-900">{booking.CheckInDate}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Check-Out Date</p>
                <p className="font-medium text-gray-900">{booking.CheckOutDate}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total Guests</p>
                <p className="font-medium text-gray-900">
                  {booking.TotalGuests} Guest(s)
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Booking Status</p>
                <StatusBadge status={booking.BookingStatus} />
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
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-gray-900 text-lg">
                  RM {booking.TotalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-green-600">
                  RM {booking.AmountPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit Amount</span>
                <span className="font-medium text-gray-700">
                  RM {booking.DepositAmount.toFixed(2)}
                </span>
              </div>
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
                booking.BookingStatus === "CheckedIn" &&
                booking.ActivityType === "Check-Out" && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium text-center">
                    Check-Out is blocked until full payment is received
                  </div>
                )}

              <div className="pt-3 border-t">
                <p className="text-gray-600 mb-2">Payment Status</p>
                <PaymentBadge status={booking.PaymentStatus} />
              </div>
            </div>

            {booking.PaymentStatus === "Pending" && pendingAmount > 0 && (
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
                      bookingId={booking.BookingID}
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
              {booking.BookingStatus === "Confirmed" &&
                (booking.PaymentStatus === "Completed" ? (
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
              {booking.BookingStatus === "CheckedIn" &&
                booking.ActivityType === "Check-Out" &&
                (booking.PaymentStatus === "Completed" ? (
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
              {(booking.BookingStatus === "Confirmed" ||
                booking.BookingStatus === "CheckedIn") && (
                <button
                  onClick={() => handleAction("cancel")}
                  className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Cancel Booking
                </button>
              )}
              {booking.BookingStatus === "CheckedIn" &&
                booking.ActivityType === "Stayover" && (
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
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
                ? "This action cannot be undone."
                : `Complete ${confirmAction} for ${booking.GuestName}?`}
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