import React from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  CheckCircle,
  TrendingUp,
  User,
} from "lucide-react";
import { StatCard } from "../../../components/GuestWidgets";
import { Guest } from "./types";

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterStatus: "all" | "active";
  setFilterStatus: (s: "all" | "active") => void;
  filterMinBookings: number | "";
  setFilterMinBookings: (n: number | "") => void;
  showFilters: boolean;
  setShowFilters: (b: boolean) => void;
  sortBy: string;
  setSortBy: (s: "name" | "bookings" | "spent" | "recent") => void;
  filteredGuests: Guest[];
  stats: any;
  onViewDetails: (g: Guest) => void;
  exportToCSV: () => void;
}

export default function GuestListView({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterMinBookings,
  setFilterMinBookings,
  showFilters,
  setShowFilters,
  sortBy,
  setSortBy,
  filteredGuests,
  stats,
  onViewDetails,
  exportToCSV,
}: Props) {
  return (
    <main className="p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 shadow-sm">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Guest Management
              </h1>
              <p className="text-sm text-gray-500">
                View and manage all guest profiles
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium border border-gray-300 transition flex items-center gap-2 ${
                showFilters
                  ? "bg-indigo-600 text-white"
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
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total Guests"
            value={stats.total.toString()}
            icon={<Users className="h-5 w-5 text-purple-600" />}
            color="purple"
          />
          <StatCard
            title="Currently Staying"
            value={stats.active.toString()}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            color="green"
          />
          <StatCard
            title="New This Month"
            value={stats.newThisMonth.toString()}
            icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
            color="amber"
          />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email, phone, or IC number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="bookings">Sort by Bookings</option>
            <option value="spent">Sort by Spending</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="all">All Guests</option>
                  <option value="active">Currently Staying</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Bookings
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={filterMinBookings}
                  onChange={(e) =>
                    setFilterMinBookings(
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilterStatus("all");
                  setFilterMinBookings("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Guest Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Member Since
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Bookings
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Last Visit
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
              {filteredGuests.map((guest) => (
                <tr
                  key={guest.guestId}
                  className="border-b border-gray-300 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {guest.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {guest.guestId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {guest.email}
                      </p>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {guest.phoneNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {new Date(guest.createdAt).toLocaleDateString("en-MY", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-900">
                        {guest.totalBookings}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      {guest.lastBookingDate
                        ? new Date(guest.lastBookingDate).toLocaleDateString(
                            "en-MY",
                            { month: "short", day: "numeric", year: "numeric" }
                          )
                        : "Never"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {guest.isActive ? (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        In Hotel
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                        Not Staying
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => onViewDetails(guest)}
                        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition flex items-center gap-2"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGuests.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No guests found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </main>
  );
}