import React, { useState } from "react";
import {
  Wifi,
  Tv,
  Wind,
  Coffee,
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  AlertCircle,
  Home,
  Clock,
  Users,
  Bed,
  Wrench,
} from "lucide-react";
import { RoomStatusBadge } from "../../../components/RoomWidgets";
import { roomsAPI } from "../../../services/api";
import { Room } from "./types";

interface Props {
  room: Room;
  onBack: () => void;
  onStatusUpdate?: (newStatus: string) => void;
}

export default function RoomDetailsView({ room, onBack, onStatusUpdate }: Props) {
  const [imageError, setImageError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // This is the key: live status that updates when user changes it
  const [currentStatus, setCurrentStatus] = useState<"Available" | "Occupied" | "Maintenance">(
    room.status as any
  );

  const [selectedStatus, setSelectedStatus] = useState<"Available" | "Maintenance">(
    currentStatus === "Available" ? "Available" : "Maintenance"
  );

  const isOccupied = currentStatus === "Occupied";

  const amenities = [
    { icon: <Wifi className="h-5 w-5" />, label: "Free WiFi" },
    { icon: <Tv className="h-5 w-5" />, label: "Flat Screen TV" },
    { icon: <Wind className="h-5 w-5" />, label: "Air Conditioning" },
    { icon: <Coffee className="h-5 w-5" />, label: "Mini Fridge" },
  ];

  const calculateNightsRemaining = () => {
    if (!room.currentBooking?.checkOutDate) return 0;
    const checkOut = new Date(room.currentBooking.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((checkOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus) {
      setShowConfirmModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await roomsAPI.updateRoomStatus(room.roomId, selectedStatus);
      if (res.success) {
        setCurrentStatus(selectedStatus); // ← This updates the badge instantly!
        onStatusUpdate?.(selectedStatus);
        alert(`Room status updated to ${selectedStatus}!`);
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating room status");
    } finally {
      setIsUpdating(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium transition"
        >
          <ArrowLeft size={20} /> Back to Room List
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 shadow-sm">
              <Bed className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Room {room.roomNumber}
              </h1>
              <p className="text-sm text-gray-500">{room.roomType}</p>
            </div>
          </div>

          {/* Live Status Badge */}
          <RoomStatusBadge status={currentStatus} />
        </div>
      </div>

      {/* Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl mb-6">
        {room.imageURL && !imageError ? (
          <img
            src={room.imageURL}
            alt={`Room ${room.roomNumber}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              currentStatus === "Available"
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : currentStatus === "Occupied"
                ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                : "bg-gradient-to-br from-amber-500 to-orange-600"
            }`}
          >
            <Bed className="h-32 w-32 sm:h-40 sm:w-40 text-white opacity-90" />
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <p className="text-sm text-gray-500 mb-1">Room Number</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{room.roomNumber}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <p className="text-sm text-gray-500 mb-1">Room Type</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{room.roomType}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <p className="text-sm text-gray-500 mb-1">Price Per Night</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600">
            RM {room.pricePerNight.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <p className="text-sm text-gray-500 mb-1">Current Status</p>
          <div className="mt-2">
            <RoomStatusBadge status={currentStatus} />
          </div>
        </div>
      </div>

      {/* Current Guest */}
      {room.currentBooking?.guest && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Current Guest</h3>
              <p className="text-sm text-blue-700">
                Booking ID: #{room.currentBooking.bookingId}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-3">Guest Details</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-xs">Full Name</p>
                    <p className="font-medium text-gray-900">{room.currentBooking.guest.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="font-medium text-gray-900">{room.currentBooking.guest.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="font-medium text-gray-900">{room.currentBooking.guest.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-xs">IC Number</p>
                    <p className="font-medium text-gray-900">{room.currentBooking.guest.icNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-3">Stay Details</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-xs">Check-In</p>
                    <p className="font-medium text-gray-900">{room.currentBooking.checkInDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-xs">Check-Out</p>
                    <p className="font-medium text-gray-900">{room.currentBooking.checkOutDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-xs">Nights Remaining</p>
                    <p className="font-medium text-blue-900">{calculateNightsRemaining()} night(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-xs">Total Guests</p>
                    <p className="font-medium text-gray-900">{room.currentBooking.totalGuests} guest(s)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Description */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
          <Home className="h-5 w-5 text-indigo-600" /> Room Description
        </h3>
        <p className="text-gray-700 leading-relaxed text-base">
          {room.description || "No description available."}
        </p>
      </div>

      {/* UPDATE STATUS — BELOW DESCRIPTION, BLUE CARD */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Update Room Status</h3>
            <p className="text-sm text-gray-600">Change availability for housekeeping</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select new status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as "Available" | "Maintenance");
              setShowConfirmModal(true);
            }}
            disabled={isUpdating || isOccupied}
            className={`w-full max-w-sm px-4 py-2.5 rounded-lg border-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isOccupied
                ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                : "bg-white border-blue-300 text-blue-900 hover:border-blue-400 focus:border-blue-500"
            }`}
          >
            <option value="Available">Available</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          {isOccupied && (
            <p className="mt-3 text-sm text-amber-700 flex items-center gap-2">
              <AlertCircle size={16} />
              Cannot change room status while guest is checked in or booked the room.
            </p>
          )}
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
        <h3 className="font-semibold text-gray-900 mb-5 text-lg">Room Amenities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {amenities.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                {a.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Status Change
            </h3>
            <p className="text-gray-600 mb-6">
              Change room status to{" "}
              <span className="font-semibold text-blue-600">{selectedStatus}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-70"
              >
                {isUpdating ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}