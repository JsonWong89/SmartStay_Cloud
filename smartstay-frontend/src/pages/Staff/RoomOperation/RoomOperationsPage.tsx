import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import {roomsAPI} from "../../../services/api";
import { useAuthStore } from "../../../store";
import RoomDetailsView from "./RoomDetailsView";
import RoomListView from "./RoomListView";
import { Room } from "./types";

export default function RoomOperationsPage() {
  const [activePage] = useState("Room Operation");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMinPrice, setFilterMinPrice] = useState<number | "">("");
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | "">("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "details">("list");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await roomsAPI.getAllRooms({
        hotelId: user?.hotelId,
        // status: filterStatus !== "all" ? filterStatus : undefined,
        // roomType: filterType !== "all" ? filterType : undefined,
        // minPrice: filterMinPrice !== "" ? Number(filterMinPrice) : undefined,
        // maxPrice: filterMaxPrice !== "" ? Number(filterMaxPrice) : undefined,
        // searchQuery: searchQuery || undefined,
      });

      if (result.success) {
        setRooms(result.data);
      } else {
        throw new Error("Failed to load rooms");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load rooms. Please try again.");
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomDetails = async (roomId: number) => {
    try {
      const result = await roomsAPI.getRoomById(roomId);
      if (result.success) {
        setSelectedRoom(result.data);
        setCurrentView("details");
      } else {
        throw new Error("Room not found");
      }
    } catch (err: any) {
      alert("Failed to load room details: " + err.message);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "Available").length,
    occupied: rooms.filter((r) => r.status === "Occupied").length,
    maintenance: rooms.filter((r) => r.status === "Maintenance").length,
    occupancyRate:
      rooms.length > 0
        ? ((rooms.filter((r) => r.status === "Occupied").length / rooms.length) * 100).toFixed(1)
        : "0.0",
  };
  const filteredRooms = useMemo(() => {
  return rooms.filter((room) => {
    // Search
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(query) ||
      room.roomType.toLowerCase().includes(query) ||
      (room.currentBooking?.guestName?.toLowerCase().includes(query) ?? false);

    // Status
    const matchesStatus = filterStatus === "all" || room.status === filterStatus;

    // Type
    const matchesType = filterType === "all" || room.roomType === filterType;

    // Price
    const matchesMinPrice = filterMinPrice === "" || room.pricePerNight >= Number(filterMinPrice);
    const matchesMaxPrice = filterMaxPrice === "" || room.pricePerNight <= Number(filterMaxPrice);

    return matchesSearch && matchesStatus && matchesType && matchesMinPrice && matchesMaxPrice;
  });
}, [rooms, searchQuery, filterStatus, filterType, filterMinPrice, filterMaxPrice]);

  const roomTypes = Array.from(new Set(rooms.map((r) => r.roomType)));

  const handleViewDetails = (room: Room) => {
    fetchRoomDetails(room.roomId);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedRoom(null);
  };

  const handlePriceChange = (
    setter: (val: number | "") => void,
    value: string
  ) => {
    if (value === "") setter("");
    else {
      const num = parseFloat(value);
      setter(isNaN(num) ? "" : num);
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
  setRooms(prevRooms =>
    prevRooms.map(r =>
      r.roomId === selectedRoom?.roomId ? { ...r, status: newStatus as any } : r
    )
  );
};

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Sidebar Always Visible */}
      <Sidebar
        activePage={activePage}
        setActivePage={() => {}}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-[230px]"
        }`}
      >
        {/* Loading State - Only in Content Area */}
        {loading && (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <RefreshCw className="h-14 w-14 text-sky-600 animate-spin mx-auto mb-6" />
              <p className="text-xl font-semibold text-gray-800">Loading Rooms</p>
              <p className="text-sm text-gray-500 mt-2">Fetching latest data...</p>
            </div>
          </div>
        )}

        {/* Error State - Only in Content Area */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-red-100">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Oops! Something went wrong
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchRooms}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Only Show When Not Loading/Error */}
        {!loading && !error && (
          <>
            {currentView === "list" ? (
              <RoomListView
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterType={filterType}
                setFilterType={setFilterType}
                filterMinPrice={filterMinPrice}
                setFilterMinPrice={setFilterMinPrice}
                filterMaxPrice={filterMaxPrice}
                setFilterMaxPrice={setFilterMaxPrice}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filteredRooms={filteredRooms}
                stats={stats}
                roomTypes={roomTypes}
                onViewDetails={handleViewDetails}
                handlePriceChange={handlePriceChange}
              />
            ) : (
              <RoomDetailsView 
              room={selectedRoom!} 
              onBack={handleBackToList} 
              onStatusUpdate={handleStatusUpdate}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}