import React from "react";
import { Bed, DollarSign, Eye, Home, CheckCircle, Users, Wrench, Clock } from "lucide-react";
import { Room } from "../pages/Staff/RoomOperation/types";

export function RoomStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Available: "bg-green-100 text-green-700 border border-green-200",
    Occupied: "bg-blue-100 text-blue-700 border border-blue-200",
    Maintenance: "bg-amber-100 text-amber-700 border border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50",
    green: "bg-green-50",
    blue: "bg-blue-50",
    amber: "bg-amber-50",
    purple: "bg-purple-50",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function RoomCard({
  room,
  onView,
}: {
  room: Room;
  onView: (room: Room) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="relative h-40 overflow-hidden">
        {room.imageURL ? (
          <img
            src={room.imageURL}
            alt={`Room ${room.roomNumber}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}

        <div
          className={`absolute inset-0 ${room.imageURL ? "hidden" : ""} ${
            room.status === "Available"
              ? "bg-gradient-to-br from-green-400 to-green-600"
              : room.status === "Occupied"
              ? "bg-gradient-to-br from-blue-400 to-blue-600"
              : "bg-gradient-to-br from-amber-400 to-amber-600"
          } flex items-center justify-center`}
        >
          <Bed className="h-20 w-20 text-white opacity-90" />
        </div>
        <div className="absolute top-3 right-3">
          <RoomStatusBadge status={room.status} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            Room {room.roomNumber}
          </h3>
          <span className="text-sm font-medium text-gray-500">#{room.roomId}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{room.roomType}</p>
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="font-bold text-lg text-gray-900">
            RM {room.pricePerNight.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">/night</span>
        </div>
        <p className="text-xs text-gray-600 mb-4 line-clamp-2">{room.description}</p>
        <button
          onClick={() => onView(room)}
          className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition flex items-center justify-center gap-2"
        >
          <Eye size={16} /> View Details
        </button>
      </div>
    </div>
  );
}