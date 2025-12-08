import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  Bed,
  DollarSign,
  History,
  AlertCircle,
  Award,
  FileCheck,
  Download as DownloadIcon,
  Check,
  Edit,
  Plus,
  User,
  Star,
  Eye,
  VenusAndMars,
  IdCard
} from "lucide-react";
import { BookingStatusBadge } from "../../../components/GuestWidgets";
import { Guest } from "./types";

interface Props {
  guest: Guest;
  onBack: () => void;
  onVerifyDocument: (id: number) => void;
  navigate: (path: string) => void;
}

export default function GuestDetailsView({ guest, onBack, onVerifyDocument, navigate }: Props) {
  const isActive = guest.isActive;
  const activeBooking = guest.bookingHistory.find((b) => b.bookingStatus === "CheckedIn");
  const hasRegisteredAccount = guest.hasAccount;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={16}
            className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition"
      >
        <ArrowLeft size={20} />
        Back to Guest List
      </button>

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{guest.fullName}</h1>
                {hasRegisteredAccount && (
                  <span className="px-3 py-1 rounded-full bg-blue-400 text-blue-900 text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Registered
                  </span>
                )}
              </div>
              <p className="text-purple-100">Guest ID: {guest.guestId}</p>
              <p className="text-purple-100 text-sm mt-1">
                Account created: {new Date(guest.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-purple-100 text-sm mb-1">Total Bookings</p>
            <p className="text-4xl font-bold">{guest.totalBookings}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bed className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{guest.totalBookings}</p>
          <p className="text-xs text-gray-500 mt-1">
            {guest.bookingHistory.filter((b) => b.bookingStatus === "CheckedOut").length} completed
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">Last Visit</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {guest.lastBookingDate
              ? new Date(guest.lastBookingDate).toLocaleDateString("en-MY", { month: "short", day: "numeric", year: "numeric" })
              : "N/A"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {guest.lastBookingDate ? new Date(guest.lastBookingDate).toLocaleDateString("en-MY", { year: "numeric" }) : "Never booked"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-sm text-gray-500">Documents</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{guest.uploadedDocuments.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {guest.uploadedDocuments.filter((d) => d.status === "Verified").length} verified
          </p>
        </div>
      </div>

      {isActive && activeBooking && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">Currently Staying</h3>
              <p className="text-sm text-green-700 mb-3">
                Room {activeBooking.roomNumber} ({activeBooking.roomType}) • Check-out: {activeBooking.checkOutDate}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-600 text-xs">Booking ID</p>
                  <p className="font-medium text-green-900">#{activeBooking.bookingId}</p>
                </div>
                <div>
                  <p className="text-green-600 text-xs">Total Guests</p>
                  <p className="font-medium text-green-900">{activeBooking.totalGuests} guest(s)</p>
                </div>
                <div>
                  <p className="text-green-600 text-xs">Total Amount</p>
                  <p className="font-medium text-green-900">RM {activeBooking.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IdCard className="h-5 w-5 text-purple-600" />
              Guest Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Email Address</p>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{guest.email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{guest.phoneNumber}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">IC/Passport Number</p>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{guest.icNumber}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="font-medium text-gray-900">{guest.address || "Not provided"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Gender</p>
                <div className="flex items-start gap-2 text-sm">
                  <VenusAndMars className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="font-medium text-gray-900">{guest.gender || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              Guest Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Type</span>
                {hasRegisteredAccount ? (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Registered
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">No Register</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Stay</span>
                {isActive ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">In Hotel</span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">Not Staying</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents</span>
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                  {guest.uploadedDocuments.length} Files
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition flex items-center justify-center gap-2">
                <Edit size={16} />
                Edit Guest Info
              </button>
              <button className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition flex items-center justify-center gap-2">
                <Plus size={16} />
                New Booking
              </button>
              <button className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <Mail size={16} />
                Send Email
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-300">
            <div className="px-6 py-5 border-b border-gray-300">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-purple-600" />
                Booking History
              </h3>
              <p className="text-sm text-gray-500 mt-1">Complete record of all bookings</p>
            </div>

            <div className="p-6">
              {guest.bookingHistory.length > 0 ? (
                <div className="space-y-4">
                  {guest.bookingHistory.map((booking) => (
                    <div
                      key={booking.bookingId}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">Booking #{booking.bookingId}</h4>
                            <BookingStatusBadge status={booking.bookingStatus} />
                          </div>
                          <p className="text-sm text-gray-600">Room {booking.roomNumber} - {booking.roomType}</p>
                        </div>
                        <p className="font-bold text-lg text-gray-900">RM {booking.totalAmount.toFixed(2)}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Check-In</p>
                          <p className="font-medium text-gray-900">{booking.checkInDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Check-Out</p>
                          <p className="font-medium text-gray-900">{booking.checkOutDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Guests</p>
                          <p className="font-medium text-gray-900">{booking.totalGuests} guest(s)</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Deposit</p>
                          <p className="font-medium text-gray-900">RM {booking.depositAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Booked on {new Date(booking.createdAt).toLocaleDateString("en-MY")}
                        </p>
                        <button
                          onClick={() => navigate(`/staff/receipt/${booking.bookingId}`)}
                          className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"
                        >
                          <Eye size={14} />
                          View Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No booking history</p>
                  <p className="text-sm text-gray-400 mt-1">This guest hasn't made any bookings yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-300">
            <div className="px-6 py-5 border-b border-gray-300 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                <FileCheck className="h-5 w-5 text-purple-600" />
                Uploaded Documents
              </h3>
              <span className="text-sm text-gray-500">
                {guest.uploadedDocuments.filter((d) => d.status === "Verified").length}/{guest.uploadedDocuments.length} verified
              </span>
            </div>

            <div className="p-6">
              {guest.uploadedDocuments.length > 0 ? (
                <div className="space-y-4">
                  {guest.uploadedDocuments.map((doc) => (
                    <div
                      key={doc.documentId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {doc.documentType} • Uploaded {doc.uploadDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {doc.status === "Pending" ? (
                          <button
                            onClick={() => onVerifyDocument(doc.documentId)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md flex items-center gap-1.5"
                          >
                            <Check size={14} />
                            Verify
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-md flex items-center gap-1.5">
                            <Check size={14} />
                            Verified
                          </span>
                        )}
                        <a
                          href={doc.fileUrl.startsWith("http") ? `https://localhost:7168${doc.fileUrl}` : doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <DownloadIcon size={18} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No documents uploaded</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-300">
            <div className="px-6 py-5 border-b border-gray-300">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Guest Reviews
              </h3>
              <p className="text-sm text-gray-500 mt-1">Feedback from previous stays</p>
            </div>

            <div className="p-6">
              {guest.reviews.length > 0 ? (
                <div className="space-y-4">
                  {guest.reviews.map((review) => (
                    <div key={review.reviewId} className="border border-gray-200 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {renderStars(review.rating)}
                            <span className="text-sm font-medium text-gray-600">{review.rating}.0</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {review.hotelName} • Room {review.roomNumber} ({review.roomType})
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.reviewDate).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      {review.comment && <p className="text-gray-700 italic">"{review.comment}"</p>}
                      {!review.comment && <p className="text-sm text-gray-400">No comment provided</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No reviews yet</p>
                  <p className="text-sm text-gray-400 mt-1">This guest hasn't left any reviews</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}