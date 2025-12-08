import React from "react";
import {
  Bed,
  Search,
  Filter,
  Home,
  CheckCircle,
  Users,
  Wrench,
  Clock,
} from "lucide-react";
import { RoomCard, StatCard, RoomStatusBadge } from "../../../components/RoomWidgets";
import { Room } from "./types";

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  filterMinPrice: number | "";
  setFilterMinPrice: (val: number | "") => void;
  filterMaxPrice: number | "";
  setFilterMaxPrice: (val: number | "") => void;
  viewMode: "grid" | "list";
  setViewMode: (val: "grid" | "list") => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void; 
  filteredRooms: Room[];
  stats: any;
  roomTypes: string[];
  onViewDetails: (room: Room) => void;
  handlePriceChange: (setter: any, value: string) => void;
}

export default function RoomListView({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  filterMinPrice,
  setFilterMinPrice,
  filterMaxPrice,
  setFilterMaxPrice,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,          
  filteredRooms,
  stats,
  roomTypes,
  onViewDetails,
  handlePriceChange,
}: Props) {
  return (
    <main className="p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 shadow-sm">
              <Bed className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Room Operations
              </h1>
              <p className="text-sm text-gray-500">
                View room availability and current occupancy
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              showFilters
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard
            title="Total Rooms"
            value={stats.total.toString()}
            icon={<Home className="h-5 w-5 text-indigo-600" />}
            color="indigo"
          />
          <StatCard
            title="Available"
            value={stats.available.toString()}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            color="green"
          />
          <StatCard
            title="Occupied"
            value={stats.occupied.toString()}
            icon={<Users className="h-5 w-5 text-blue-600" />}
            color="blue"
          />
          <StatCard
            title="Maintenance"
            value={stats.maintenance.toString()}
            icon={<Wrench className="h-5 w-5 text-amber-600" />}
            color="amber"
          />
          <StatCard
            title="Occupancy"
            value={`${stats.occupancyRate}%`}
            icon={<Clock className="h-5 w-5 text-purple-600" />}
            color="purple"
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
              placeholder="Search by room number, type, or guest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border"
              }`}
            >
              <Home size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border"
              }`}
            >
              <Bed size={18} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Room Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">All Types</option>
                  {roomTypes.map((type: string) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (RM)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={filterMinPrice}
                  onChange={(e) =>
                    handlePriceChange(setFilterMinPrice, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (RM)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={filterMaxPrice}
                  onChange={(e) =>
                    handlePriceChange(setFilterMaxPrice, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  min="0"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilterStatus("all");
                  setFilterType("all");
                  setFilterMinPrice("");
                  setFilterMaxPrice("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </header>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <RoomCard key={room.roomId} room={room} onView={onViewDetails} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Room
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Price/Night
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Current Guest
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr
                    key={room.roomId}
                    className="border-b border-gray-300 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        Room {room.roomNumber}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{room.roomType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        RM {room.pricePerNight.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <RoomStatusBadge status={room.status} />
                    </td>
                    <td className="px-6 py-4">
                      {room.status === "Occupied" && room.currentBooking ? (
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {room.currentBooking.guestName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Until {room.currentBooking.checkOutDate}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => onViewDetails(room)}
                          className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition flex items-center gap-2"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No rooms found</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}