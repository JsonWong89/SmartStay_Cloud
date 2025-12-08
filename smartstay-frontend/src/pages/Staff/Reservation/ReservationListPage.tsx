import React, { useState } from "react";
import {
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Booking, FilterOptions } from "./types";
import { BookingStatusBadge } from "../../../components/ReservationBadges";

interface ReservationListPageProps {
  bookings: Booking[];
  openBookingDetails: (id: number) => void;
  refreshBookings: () => void;
}

export default function ReservationListPage({
  bookings,
  openBookingDetails,
  refreshBookings,
}: ReservationListPageProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    dateFrom: "",
    dateTo: "",
    searchQuery: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredBookings = bookings.filter((booking: Booking) => {
    const matchesStatus =
      filters.status === "all" || booking.bookingStatus === filters.status;
    const matchesSearch =
      booking.guest.fullName
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase()) ||
      booking.room.roomNumber.includes(filters.searchQuery) ||
      booking.bookingId.toString().includes(filters.searchQuery);
    const matchesDateFrom =
      !filters.dateFrom || booking.checkInDate >= filters.dateFrom;
    const matchesDateTo =
      !filters.dateTo || booking.checkInDate <= filters.dateTo;
    return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b: Booking) => b.bookingStatus === "Pending")
      .length,
    confirmed: bookings.filter((b: Booking) => b.bookingStatus === "Confirmed")
      .length,
    checkedIn: bookings.filter((b: Booking) => b.bookingStatus === "CheckedIn")
      .length,
    totalRevenue: bookings.reduce(
      (sum: number, b: Booking) => sum + b.totalPaid,
      0
    ),
    pendingPayments: bookings.reduce(
      (sum: number, b: Booking) => sum + b.pendingAmount,
      0
    ),
  };

  const exportToCSV = () => {
    const headers = [
      "Booking ID",
      "Guest Name",
      "Room",
      "Check-In",
      "Check-Out",
      "Nights",
      "Total Amount",
      "Paid",
      "Pending",
      "Status",
    ];
    const rows = filteredBookings.map((b: Booking) => [
      b.bookingId,
      b.guest.fullName,
      `${b.room.roomNumber} - ${b.room.roomType}`,
      b.checkInDate,
      b.checkOutDate,
      b.numberOfNights,
      b.totalAmount.toFixed(2),
      b.totalPaid.toFixed(2),
      b.pendingAmount.toFixed(2),
      b.bookingStatus,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reservations_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  return (
    <main className="p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 shadow-sm">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reservation Management
              </h1>
              <p className="text-sm text-gray-500">
                View and manage all hotel reservations
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium border border-gray-300 transition flex items-center gap-2 ${
                showFilters
                  ? "bg-sky-600 text-white"
                  : "bg-white text-gray-700 border hover:bg-gray-50"
              }`}
            >
              <Filter size={18} />
              Filters
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 font-medium hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Reservations"
            value={stats.total.toString()}
            icon={<FileText className="h-5 w-5 text-sky-600" />}
            color="sky"
          />
          <StatCard
            title="Checked In"
            value={stats.checkedIn.toString()}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`RM ${stats.totalRevenue.toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
            color="emerald"
          />
          <StatCard
            title="Pending Payments"
            value={`RM ${stats.pendingPayments.toFixed(2)}`}
            icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
            color="amber"
          />
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="CheckedIn">Checked In</option>
                  <option value="CheckedOut">Checked Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-In From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-In To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Guest, Room, or ID..."
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters({ ...filters, searchQuery: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() =>
                  setFilters({
                    status: "all",
                    dateFrom: "",
                    dateTo: "",
                    searchQuery: "",
                  })
                }
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="mt-4 flex justify-end">
        <a
          href="/staff/walk-in-booking"
          className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 inline-block text-center"
        >
          Register New Walk-in Guest
        </a>
      </div>

      <div className="mt-4 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border border-gray-200">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Booking ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Guest Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Room Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Check-In / Out
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Guests
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking: Booking) => (
                <tr
                  key={booking.bookingId}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900">
                        #{booking.bookingId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.createdAt}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.guest.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.guest.phoneNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.guest.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Room {booking.room.roomNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.room.roomType}
                      </p>
                      <p className="text-xs text-gray-500">
                        RM {booking.room.pricePerNight}/night
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-700">
                          {booking.checkInDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-700">
                          {booking.checkOutDate}
                        </span>
                      </div>
                      <p className="text-xs text-sky-600 mt-1 font-medium">
                        {booking.numberOfNights} night(s)
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {booking.totalGuests}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-bold text-gray-900">
                        RM {booking.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600">
                        Paid: RM {booking.totalPaid.toFixed(2)}
                      </p>
                      {booking.pendingAmount > 0 && (
                        <p className="text-xs text-amber-600 font-medium">
                          Due: RM {booking.pendingAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <BookingStatusBadge status={booking.bookingStatus} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openBookingDetails(booking.bookingId)}
                        className="p-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No reservations found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({
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
  const bgColors: Record<string, string> = {
    sky: "bg-sky-50",
    green: "bg-green-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${bgColors[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}