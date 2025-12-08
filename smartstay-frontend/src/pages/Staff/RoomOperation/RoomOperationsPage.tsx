import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import { roomsAPI } from "../../../services/api";
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

  // Fetch rooms
  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await roomsAPI.getAllRooms({
        hotelId: user?.hotelId,
        status: filterStatus !== "all" ? filterStatus : undefined,
        roomType: filterType !== "all" ? filterType : undefined,
        minPrice: filterMinPrice !== "" ? Number(filterMinPrice) : undefined,
        maxPrice: filterMaxPrice !== "" ? Number(filterMaxPrice) : undefined,
        searchQuery: searchQuery || undefined,
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

  // Fetch single room details
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

  // Reload when filters change
  useEffect(() => {
    fetchRooms();
  }, [searchQuery, filterStatus, filterType, filterMinPrice, filterMaxPrice]);

  // Calculate stats
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

  // Loading State
  if (loading && rooms.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading rooms...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && rooms.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-800 mb-2">Error Loading Rooms</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchRooms}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activePage={activePage}
        setActivePage={() => {}}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-[230px]"
        }`}
      >
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
            filteredRooms={rooms}
            stats={stats}
            roomTypes={roomTypes}
            onViewDetails={handleViewDetails}
            handlePriceChange={handlePriceChange}
          />
        ) : (
          <RoomDetailsView room={selectedRoom!} onBack={handleBackToList} />
        )}
      </div>
    </div>
  );
}