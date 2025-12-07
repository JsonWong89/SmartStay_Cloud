import React, { useState, useMemo } from "react";
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
  ChevronDown,
  ChevronUp,
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
}: ReservationListPageProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    dateFrom: "",
    dateTo: "",
    searchQuery: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Group active bookings only
  const groupedReservations = useMemo(() => {
    const groups = new Map<string, Booking[]>();

    bookings.forEach((booking) => {
      if (booking.bookingStatus === "Cancelled") return;

      const key = `${booking.guest.email}-${booking.checkInDate}-${booking.checkOutDate}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(booking);
    });

    return Array.from(groups.values());
  }, [bookings]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    return groupedReservations.filter((group) => {
      const main = group[0];
      const query = filters.searchQuery.toLowerCase();

      const matchesStatus = filters.status === "all" || main.bookingStatus === filters.status;
      const matchesSearch =
        main.guest.fullName.toLowerCase().includes(query) ||
        group.some((b) => b.room.roomNumber.includes(query)) ||
        group.some((b) => b.bookingId.toString().includes(query));
      const matchesDateFrom = !filters.dateFrom || main.checkInDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || main.checkInDate <= filters.dateTo;

      return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [groupedReservations, filters]);

  // Stats
  const stats = useMemo(() => {
    const total = groupedReservations.length;
    const checkedIn = groupedReservations.filter((g) => g[0].bookingStatus === "CheckedIn").length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPaid, 0);
    const pendingPayments = groupedReservations.reduce((sum, group) => {
      const amount = group.reduce((s, b) => s + b.totalAmount, 0);
      const paid = group.reduce((s, b) => s + b.totalPaid, 0);
      return sum + (amount - paid);
    }, 0);

    return { total, checkedIn, totalRevenue, pendingPayments };
  }, [bookings, groupedReservations]);

  // Export CSV
  const exportToCSV = () => {
    const headers = [
      "Reservation ID(s)",
      "Guest Name",
      "Rooms",
      "Check-In",
      "Check-Out",
      "Nights",
      "Total Amount",
      "Paid",
      "Pending",
      "Status",
    ];

    const rows = filteredGroups.map((group) => {
      const main = group[0];
      const roomList = group.map((b) => `Room ${b.room.roomNumber}`).join(" + ");
      const totalAmount = group.reduce((s, b) => s + b.totalAmount, 0);
      const totalPaid = group.reduce((s, b) => s + b.totalPaid, 0);

      return [
        group.map((b) => b.bookingId).join(" + "),
        main.guest.fullName,
        roomList,
        main.checkInDate,
        main.checkOutDate,
        main.numberOfNights,
        totalAmount.toFixed(2),
        totalPaid.toFixed(2),
        (totalAmount - totalPaid).toFixed(2),
        main.bookingStatus,
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Get financials including payments from cancelled rooms
  const getGroupFinancials = (group: Booking[]) => {
    const main = group[0];
    const totalAmount = group.reduce((s, b) => s + b.totalAmount, 0);

    const allRelated = bookings.filter(
      (b) =>
        b.guest.email === main.guest.email &&
        b.checkInDate === main.checkInDate &&
        b.checkOutDate === main.checkOutDate
    );

    const totalPaid = allRelated.reduce((s, b) => s + b.totalPaid, 0);
    const pending = totalAmount - totalPaid;

    return { totalAmount, totalPaid, pending };
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Reservation Management
              </h1>
              <p className="text-sm text-gray-500">Manage all hotel reservations</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg font-medium border flex items-center gap-2 transition ${
                showFilters
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter size={18} />
              Filters {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 rounded-lg bg-white text-gray-700 border border-gray-300 font-medium hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total" value={stats.total} icon={<FileText className="h-5 w-5 text-sky-600" />} color="sky" />
          <StatCard title="Checked In" value={stats.checkedIn} icon={<CheckCircle className="h-5 w-5 text-green-600" />} color="green" />
          <StatCard title="Revenue" value={`RM ${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-emerald-600" />} color="emerald" />
          <StatCard title="Pending" value={`RM ${stats.pendingPayments.toFixed(2)}`} icon={<AlertCircle className="h-5 w-5 text-amber-600" />} color="amber" />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FilterSelect label="Status" value={filters.status} onChange={(v) => setFilters(f => ({ ...f, status: v }))} />
              <FilterDate label="Check-In From" value={filters.dateFrom} onChange={(v) => setFilters(f => ({ ...f, dateFrom: v }))} />
              <FilterDate label="Check-In To" value={filters.dateTo} onChange={(v) => setFilters(f => ({ ...f, dateTo: v }))} />
              <FilterSearch value={filters.searchQuery} onChange={(v) => setFilters(f => ({ ...f, searchQuery: v }))} />
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setFilters({ status: "all", dateFrom: "", dateTo: "", searchQuery: "" })}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Walk-in */}
      <div className="mb-6 text-right">
        <a
          href="/staff/walk-in-booking"
          className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition shadow-sm"
        >
          + New Walk-in Guest
        </a>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Booking ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Guest</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Rooms</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Dates</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase hidden xl:table-cell">Guests</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase hidden xl:table-cell">Payment</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No reservations found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const main = group[0];
                  const roomCount = group.length;
                  const roomList = group.map((b) => b.room.roomNumber).join(" + ");
                  const { totalAmount, totalPaid, pending } = getGroupFinancials(group);

                  return (
                    <tr key={group.map((b) => b.bookingId).join("-")} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-gray-900">
                            #{main.bookingId}{roomCount > 1 && ` +${roomCount - 1}`}
                          </p>
                          <p className="text-xs text-gray-500">{main.createdAt}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{main.guest.fullName}</p>
                        </div>
                      </td>

                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-sky-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[180px]">{main.guest.fullName}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">{main.guest.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 hidden md:table-cell">
                        <p className="font-medium">Room {roomList}</p>
                        <p className="text-xs text-gray-600">{roomCount} room{roomCount > 1 ? "s" : ""}</p>
                      </td>

                      <td className="px-4 py-4 text-xs hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span>{main.checkInDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-red-600" />
                            <span>{main.checkOutDate}</span>
                          </div>
                          <p className="text-sky-600 text-xs font-medium">{main.numberOfNights} night(s)</p>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center hidden xl:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <Users size={16} className="text-gray-500" />
                          <span className="font-medium">{main.totalGuests}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right hidden xl:table-cell">
                        <div className="text-sm">
                          <p className="font-bold">RM {totalAmount.toFixed(2)}</p>
                          <p className="text-green-600 text-xs">Paid: RM {totalPaid.toFixed(2)}</p>
                          {pending > 0 && <p className="text-orange-600 text-xs">Due: RM {pending.toFixed(2)}</p>}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <BookingStatusBadge status={main.bookingStatus} />
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => openBookingDetails(main.bookingId)}
                          className="p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden">
          {filteredGroups.map((group) => {
            const main = group[0];
            const roomCount = group.length;
            const roomList = group.map((b) => b.room.roomNumber).join(" + ");
            const { totalAmount, totalPaid, pending } = getGroupFinancials(group);

            return (
              <div key={group.map((b) => b.bookingId).join("-")} className="border-b border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg">
                      #{main.bookingId}{roomCount > 1 && ` +${roomCount - 1}`}
                    </p>
                    <p className="text-sm text-gray-600">{main.guest.fullName}</p>
                  </div>
                  <BookingStatusBadge status={main.bookingStatus} />
                </div>

                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Rooms:</span> {roomList}</p>
                  <p><span className="text-gray-600">Dates:</span> {main.checkInDate} → {main.checkOutDate}</p>
                  <p><span className="text-gray-600">Guests:</span> {main.totalGuests}</p>

                  <div className="flex justify-between items-end pt-3 border-t">
                    <div>
                      <p className="font-bold">RM {totalAmount.toFixed(2)}</p>
                      {pending > 0 && <p className="text-xs text-amber-600">Due: RM {pending.toFixed(2)}</p>}
                    </div>
                    <button
                      onClick={() => openBookingDetails(main.bookingId)}
                      className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

// Reusable components
const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => {
  const colors: Record<string, string> = {
    sky: "bg-sky-50 text-sky-700",
    green: "bg-green-50 text-green-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };
  const borderColors: Record<string, string> = {
    sky: "border-l-sky-600",
    green: "border-l-green-600",
    emerald: "border-l-emerald-600",
    amber: "border-l-amber-600 ",
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border border-gray-200 border-l-8 ${borderColors[color]}`}>
      <div className="flex items-center gap-2">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        
      </div>
    </div>
  );
};

const FilterSelect = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm"
    >
      <option value="all">All Status</option>
      <option value="Pending">Pending</option>
      <option value="Confirmed">Confirmed</option>
      <option value="CheckedIn">Checked In</option>
      <option value="CheckedOut">Checked Out</option>
      <option value="Cancelled">Cancelled</option>
    </select>
  </div>
);

const FilterDate = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm"
    />
  </div>
);

const FilterSearch = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="Guest, room, ID..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm"
      />
    </div>
  </div>
);