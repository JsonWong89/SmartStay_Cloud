import React, { useMemo } from "react";
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
  IdCard,
} from "lucide-react";
import { BookingStatusBadge } from "../../../components/GuestWidgets";
import { Guest } from "./types";
import { API_BASE_URL } from "../../../config";
import { useNavigate } from "react-router-dom";

const API_URL = API_BASE_URL;

interface Props {
  guest: Guest;
  onBack: () => void;
  onVerifyDocument: (id: number) => void;
  onEdit: () => void;
  // navigate: (path: string) => void;
}

export default function GuestDetailsView({
  guest,
  onBack,
  onVerifyDocument,
  onEdit,
}: // navigate,
  Props) {
  const navigate = useNavigate();
  const isActive = guest.isActive;
  const hasRegisteredAccount = guest.hasAccount;

  // Group bookings by email + dates (for multi-room support)
  const groupedBookings = useMemo(() => {
    const groups = new Map<string, typeof guest.bookingHistory>();

    guest.bookingHistory.forEach((booking) => {
      const key = `${guest.email}-${booking.checkInDate}-${booking.checkOutDate}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(booking);
    });

    // Convert to array and sort by date (newest first)
    return Array.from(groups.values())
      .map((group) => {
        // Only count non-cancelled for active rooms
        const activeRooms = group.filter(
          (b) => b.bookingStatus !== "Cancelled"
        );
        const totalAmount = activeRooms.reduce(
          (sum, b) => sum + b.totalAmount,
          0
        );
        const totalPaid = group.reduce((sum, b) => sum + (b.totalPaid || 0), 0); // Include cancelled for money safety

        return {
          bookings: group,
          activeBookings: activeRooms,
          mainBooking: activeRooms[0] || group[0],
          roomCount: activeRooms.length,
          totalAmount,
          totalPaid,
          pendingAmount: totalAmount - totalPaid,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.mainBooking.checkInDate).getTime() -
          new Date(a.mainBooking.checkInDate).getTime()
      );
  }, [guest.bookingHistory, guest.email]);

  // Find active multi-room booking if exists
  const activeMultiRoomBooking = useMemo(() => {
    return groupedBookings.find((group) =>
      group.activeBookings.some((b) => b.bookingStatus === "CheckedIn")
    );
  }, [groupedBookings]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={16}
            className={
              i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }
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
                Account created:{" "}
                {new Date(guest.createdAt).toLocaleDateString("en-MY", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
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
          <p className="text-2xl font-bold text-gray-900">
            {guest.totalBookings}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {
              guest.bookingHistory.filter(
                (b) => b.bookingStatus === "CheckedOut"
              ).length
            }{" "}
            completed
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
              ? new Date(guest.lastBookingDate).toLocaleDateString("en-MY", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
              : "N/A"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {guest.lastBookingDate
              ? new Date(guest.lastBookingDate).toLocaleDateString("en-MY", {
                year: "numeric",
              })
              : "Never booked"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-sm text-gray-500">Documents</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {guest.uploadedDocuments.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {
              guest.uploadedDocuments.filter((d) => d.status === "Verified")
                .length
            }{" "}
            verified
          </p>
        </div>
      </div>

      {/* Active Stay Alert - Updated for Multi-Room */}
      {isActive && activeMultiRoomBooking && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                Currently Staying
                {activeMultiRoomBooking.roomCount > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-green-600 text-white text-xs font-bold">
                    {activeMultiRoomBooking.roomCount} Rooms
                  </span>
                )}
              </h3>
              <p className="text-sm text-green-700 mb-3">
                {activeMultiRoomBooking.roomCount === 1 ? (
                  <>
                    Room {activeMultiRoomBooking.mainBooking.roomNumber} (
                    {activeMultiRoomBooking.mainBooking.roomType})
                  </>
                ) : (
                  <>
                    Rooms:{" "}
                    {activeMultiRoomBooking.activeBookings
                      .map((b) => b.roomNumber)
                      .join(", ")}
                  </>
                )}
                {" • "}Check-out:{" "}
                {activeMultiRoomBooking.mainBooking.checkOutDate}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-green-600 text-xs">Booking ID(s)</p>
                  <p className="font-medium text-green-900">
                    #{activeMultiRoomBooking.mainBooking.bookingId}
                    {activeMultiRoomBooking.roomCount > 1 &&
                      ` +${activeMultiRoomBooking.roomCount - 1}`}
                  </p>
                </div>
                <div>
                  <p className="text-green-600 text-xs">Total Guests</p>
                  <p className="font-medium text-green-900">
                    {activeMultiRoomBooking.mainBooking.totalGuests} guest(s)
                  </p>
                </div>
                <div>
                  <p className="text-green-600 text-xs">Total Amount</p>
                  <p className="font-medium text-green-900">
                    RM {activeMultiRoomBooking.totalAmount.toFixed(2)}
                  </p>
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
                  <p className="font-medium text-gray-900">
                    {guest.phoneNumber}
                  </p>
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
                  <p className="font-medium text-gray-900">
                    {guest.address || "Not provided"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Gender</p>
                <div className="flex items-start gap-2 text-sm">
                  <VenusAndMars className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="font-medium text-gray-900">
                    {guest.gender || "Not provided"}
                  </p>
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
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    No Register
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Stay</span>
                {isActive ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    In Hotel
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    Not Staying
                  </span>
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
              <button
                onClick={onEdit}
                className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit Guest Info
              </button>
              <button
                onClick={() =>
                  navigate("/staff/walk-in-booking", {
                    state: {
                      guestInfo: {
                        FullName: guest.fullName,
                        ICNumber: guest.icNumber,
                        Email: guest.email,
                        PhoneNumber: guest.phoneNumber,
                        Gender: guest.gender || "",
                        Address: guest.address || "",
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Booking
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Booking History - Updated for Multi-Room */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300">
            <div className="px-6 py-5 border-b border-gray-300">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-purple-600" />
                Booking History
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Complete record of all bookings
              </p>
            </div>

            <div className="p-6">
              {groupedBookings.length > 0 ? (
                <div className="space-y-4">
                  {groupedBookings.map((group, groupIndex) => {
                    const main = group.mainBooking;
                    const roomCount = group.roomCount;
                    const roomList = group.activeBookings
                      .map((b) => b.roomNumber)
                      .join(", ");

                    return (
                      <div
                        key={`${main.bookingId}-${groupIndex}`}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-gray-900">
                                Booking #{main.bookingId}
                                {roomCount > 1 && ` +${roomCount - 1}`}
                              </h4>
                              <BookingStatusBadge status={main.bookingStatus} />
                              {roomCount > 1 && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                                  {roomCount} Rooms
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {roomCount === 1 ? (
                                <>
                                  Room {main.roomNumber} - {main.roomType}
                                </>
                              ) : (
                                <>Rooms: {roomList}</>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">
                              RM {group.totalAmount.toFixed(2)}
                            </p>
                            {group.totalPaid > 0 && (
                              <p className="text-xs text-green-600">
                                Paid: RM {group.totalPaid.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">
                              Check-In
                            </p>
                            <p className="font-medium text-gray-900">
                              {main.checkInDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">
                              Check-Out
                            </p>
                            <p className="font-medium text-gray-900">
                              {main.checkOutDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Guests</p>
                            <p className="font-medium text-gray-900">
                              {main.totalGuests} guest(s)
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Rooms</p>
                            <p className="font-medium text-gray-900">
                              {roomCount} room(s)
                            </p>
                          </div>
                        </div>

                        {/* Show all rooms in group if multi-room */}
                        {roomCount > 1 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-600 mb-2">
                              Room Details:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {group.activeBookings.map((booking) => (
                                <div
                                  key={booking.bookingId}
                                  className="text-xs bg-purple-50 rounded p-2"
                                >
                                  <p className="font-medium text-purple-900">
                                    Room {booking.roomNumber} -{" "}
                                    {booking.roomType}
                                  </p>
                                  <p className="text-purple-700">
                                    RM {booking.totalAmount.toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Booked on{" "}
                            {new Date(main.createdAt).toLocaleDateString(
                              "en-MY"
                            )}
                          </p>
                          <button
                            onClick={() =>
                              navigate("/staff/receipt/" + main.bookingId, {
                                state: { returnToGuestId: guest.guestId }, // ← This is all you need
                              })
                            }
                            className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"
                          >
                            <Eye size={14} />
                            View Receipt
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No booking history
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    This guest hasn't made any bookings yet
                  </p>
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
                {
                  guest.uploadedDocuments.filter((d) => d.status === "Verified")
                    .length
                }
                /{guest.uploadedDocuments.length} verified
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
                          <p className="font-medium text-gray-900">
                            {doc.fileName}
                          </p>
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
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(`${API_BASE_URL}/api/documents/view/${doc.documentId}`, "_blank");
                          }}
                          className="text-gray-600 hover:text-purple-600 transition"
                          title="View Document"
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
                  <p className="text-gray-500 font-medium">
                    No documents uploaded
                  </p>
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
              <p className="text-sm text-gray-500 mt-1">
                Feedback from previous stays
              </p>
            </div>

            <div className="p-6">
              {guest.reviews.length > 0 ? (
                <div className="space-y-4">
                  {guest.reviews.map((review) => (
                    <div
                      key={review.reviewId}
                      className="border border-gray-200 rounded-lg p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {renderStars(review.rating)}
                            <span className="text-sm font-medium text-gray-600">
                              {review.rating}.0
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {review.hotelName} • Room {review.roomNumber} (
                            {review.roomType})
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.reviewDate).toLocaleDateString(
                            "en-MY",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 italic">
                          "{review.comment}"
                        </p>
                      )}
                      {!review.comment && (
                        <p className="text-sm text-gray-400">
                          No comment provided
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No reviews yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    This guest hasn't left any reviews
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
