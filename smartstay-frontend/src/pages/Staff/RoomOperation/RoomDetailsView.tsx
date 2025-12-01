import React, { useState } from "react";
import { Wifi, Tv, Wind, Coffee, ArrowLeft, Calendar, User, Mail, Phone, AlertCircle, Home, Clock, Users, Bed } from "lucide-react";
import { RoomStatusBadge } from "../../../components/RoomWidgets";
import { Room } from "./types";

interface Props {
  room: Room;
  onBack: () => void;
}

export default function RoomDetailsView({ room, onBack }: Props) {
  const [imageError, setImageError] = useState(false);

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

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium transition">
          <ArrowLeft size={20} /> Back to Room List
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 shadow-sm">
            <Bed className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room {room.roomNumber}</h1>
            <p className="text-sm text-gray-500">{room.roomType}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative h-70 rounded-2xl overflow-hidden shadow-xl">
          {room.imageURL && !imageError ? (
            <img src={room.imageURL} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover" onError={() => setImageError(true)} />
          ) : (
            <div className={`absolute inset-0 flex items-center justify-center ${
              room.status === "Available" ? "bg-gradient-to-br from-green-500 to-emerald-600"
              : room.status === "Occupied" ? "bg-gradient-to-br from-blue-500 to-indigo-600"
              : "bg-gradient-to-br from-amber-500 to-orange-600"
            }`}>
              <Bed className="h-32 w-32 text-white opacity-90" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
            <p className="text-sm text-gray-500 mb-1">Room Number</p>
            <p className="text-2xl font-bold text-gray-900">{room.roomNumber}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
            <p className="text-sm text-gray-500 mb-1">Room Type</p>
            <p className="text-2xl font-bold text-gray-900">{room.roomType}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
            <p className="text-sm text-gray-500 mb-1">Price Per Night</p>
            <p className="text-2xl font-bold text-indigo-600">RM {room.pricePerNight.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
            <p className="text-sm text-gray-500 mb-1">Current Status</p>
            <div className="mt-2"><RoomStatusBadge status={room.status} /></div>
          </div>
        </div>

        {room.status === "Occupied" && room.currentBooking?.guest && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Current Guest</h3>
                <p className="text-sm text-blue-700">Booking ID: #{room.currentBooking.bookingId}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Guest Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3"><User className="h-4 w-4 text-blue-600 mt-0.5" /><div><p className="text-gray-500 text-xs">Full Name</p><p className="font-medium text-gray-900">{room.currentBooking.guest.fullName}</p></div></div>
                  <div className="flex items-start gap-3"><Mail className="h-4 w-4 text-blue-600 mt-0.5" /><div><p className="text-gray-500 text-xs">Email</p><p className="font-medium text-gray-900">{room.currentBooking.guest.email}</p></div></div>
                  <div className="flex items-start gap-3"><Phone className="h-4 w-4 text-blue-600 mt-0.5" /><div><p className="text-gray-500 text-xs">Phone Number</p><p className="font-medium text-gray-900">{room.currentBooking.guest.phoneNumber}</p></div></div>
                  <div className="flex items-start gap-3"><AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" /><div><p className="text-gray-500 text-xs">IC Number</p><p className="font-medium text-gray-900">{room.currentBooking.guest.icNumber}</p></div></div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Booking Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3"><Calendar className="h-4 w-4 text-blue-600 mt-0.5" /><div><p className="text-gray-500 text-xs">Check-In Date</p><p className="font-medium text-gray-900">{room.currentBooking.checkInDate}</p></div></div>
                  <div className="flex items-start gap-3"><Calendar className="h-4 w-4 text-blue-600 mt-0.5" /><div><p className="text-gray-500 text-xs">Check-Out Date</p><p className="font-medium text-gray-900">{room.currentBooking.checkOutDate}</p></div></div>
                  <div className="flex items-start gap-3"><Clock className="h-4 w-4 text-blue-600 mt-0.5" /><div><p className="text-gray-500 text-xs">Nights Remaining</p><p className="font-medium text-blue-900">{calculateNightsRemaining()} night(s)</p></div></div>
                  <div className="flex items-start gap-3"><Users className="h-4 w-4 text-blue-600 mt-0.5" /><div><p className="text-gray-500 text-xs">Total Guests</p><p className="font-medium text-gray-900">{room.currentBooking.totalGuests} guest(s)</p></div></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-indigo-600" /> Room Description
          </h3>
          <p className="text-gray-700 leading-relaxed">{room.description}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-5 text-lg">Room Amenities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {amenities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">{a.icon}</div>
                <span className="text-sm font-medium text-gray-700">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}