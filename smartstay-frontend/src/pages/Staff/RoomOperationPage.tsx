import React, { useState } from "react";
import {
  Bed,
  Search,
  Filter,
  Eye,
  Wrench,
  CheckCircle,
  Clock,
  DollarSign,
  Home,
  Users,
  Wifi,
  Tv,
  Coffee,
  Wind,
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";

// TypeScript Interfaces based on your database
interface Guest {
  GuestID: number;
  FullName: string;
  ICNumber: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
}

interface Booking {
  BookingID: number;
  GuestID: number;
  RoomID: number;
  CheckInDate: string;
  CheckOutDate: string;
  TotalGuests: number;
  TotalAmount: number;
  DepositAmount: number;
  BookingStatus: "Pending" | "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled";
  CreatedAt: string;
  // Joined data
  Guest?: Guest;
}

interface Room {
  RoomID: number;
  HotelID: number;
  RoomNumber: string;
  RoomType: string;
  PricePerNight: number;
  Status: "Available" | "Occupied" | "Maintenance";
  Description: string;
  CreatedAt?: string;
  // Current booking if occupied
  CurrentBooking?: Booking;
}


// Main Component
export default function RoomOperationsPage() {
  const [activePage, setActivePage] = useState("Room Operation");
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

  // Mock data with current bookings
  const [rooms] = useState<Room[]>([
    {
      RoomID: 101,
      HotelID: 1,
      RoomNumber: "101",
      RoomType: "Standard Room",
      PricePerNight: 150.0,
      Status: "Available",
      Description: "Cozy room with queen bed, air conditioning, flat-screen TV, mini-fridge, and complimentary WiFi. Perfect for solo travelers or couples.",
      CreatedAt: "2024-01-15 10:00:00",
    },
    {
      RoomID: 102,
      HotelID: 1,
      RoomNumber: "102",
      RoomType: "Standard Room",
      PricePerNight: 150.0,
      Status: "Occupied",
      Description: "Cozy room with queen bed, air conditioning, flat-screen TV, mini-fridge, and complimentary WiFi. Perfect for solo travelers or couples.",
      CreatedAt: "2024-01-15 10:00:00",
      CurrentBooking: {
        BookingID: 1001,
        GuestID: 501,
        RoomID: 102,
        CheckInDate: "2025-11-20",
        CheckOutDate: "2025-11-25",
        TotalGuests: 2,
        TotalAmount: 750.00,
        DepositAmount: 225.00,
        BookingStatus: "CheckedIn",
        CreatedAt: "2025-11-15 14:30:00",
        Guest: {
          GuestID: 501,
          FullName: "Sarah Lim Wei Ling",
          ICNumber: "920318-10-5432",
          Email: "sarah.lim@email.com",
          PhoneNumber: "+60123456789",
          Address: "45 Jalan Ampang, Kuala Lumpur, 50450"
        }
      }
    },
    {
      RoomID: 201,
      HotelID: 1,
      RoomNumber: "201",
      RoomType: "Deluxe Suite",
      PricePerNight: 300.0,
      Status: "Available",
      Description: "Spacious suite featuring a king-size bed, separate living area with sofa, work desk, premium toiletries, and stunning city views.",
      CreatedAt: "2024-01-15 10:00:00",
    },
    {
      RoomID: 202,
      HotelID: 1,
      RoomNumber: "202",
      RoomType: "Deluxe Suite",
      PricePerNight: 300.0,
      Status: "Maintenance",
      Description: "Spacious suite featuring a king-size bed, separate living area with sofa, work desk, premium toiletries, and stunning city views.",
      CreatedAt: "2024-01-15 10:00:00",
    },
    {
      RoomID: 301,
      HotelID: 1,
      RoomNumber: "301",
      RoomType: "Family Room",
      PricePerNight: 250.0,
      Status: "Available",
      Description: "Large family room with two queen beds, spacious bathroom, extra seating area, and child-friendly amenities. Ideal for families with children.",
      CreatedAt: "2024-01-15 10:00:00",
    },
    {
      RoomID: 302,
      HotelID: 1,
      RoomNumber: "302",
      RoomType: "Family Room",
      PricePerNight: 250.0,
      Status: "Occupied",
      Description: "Large family room with two queen beds, spacious bathroom, extra seating area, and child-friendly amenities. Ideal for families with children.",
      CreatedAt: "2024-01-15 10:00:00",
      CurrentBooking: {
        BookingID: 1002,
        GuestID: 502,
        RoomID: 302,
        CheckInDate: "2025-11-18",
        CheckOutDate: "2025-11-23",
        TotalGuests: 4,
        TotalAmount: 1250.00,
        DepositAmount: 375.00,
        BookingStatus: "CheckedIn",
        CreatedAt: "2025-11-10 09:15:00",
        Guest: {
          GuestID: 502,
          FullName: "Ahmad Razak bin Abdullah",
          ICNumber: "880505-03-1234",
          Email: "ahmad.razak@email.com",
          PhoneNumber: "+60198765432",
          Address: "12 Taman Melawati, Kuala Lumpur, 53100"
        }
      }
    },
    {
      RoomID: 401,
      HotelID: 1,
      RoomNumber: "401",
      RoomType: "Executive Suite",
      PricePerNight: 450.0,
      Status: "Available",
      Description: "Premium executive suite with king bed, separate bedroom and living room, dining area, luxury bathroom with bathtub, and private balcony.",
      CreatedAt: "2024-01-15 10:00:00",
    },
    {
      RoomID: 402,
      HotelID: 1,
      RoomNumber: "402",
      RoomType: "Executive Suite",
      PricePerNight: 450.0,
      Status: "Occupied",
      Description: "Premium executive suite with king bed, separate bedroom and living room, dining area, luxury bathroom with bathtub, and private balcony.",
      CreatedAt: "2024-01-15 10:00:00",
      CurrentBooking: {
        BookingID: 1003,
        GuestID: 503,
        RoomID: 402,
        CheckInDate: "2025-11-19",
        CheckOutDate: "2025-11-22",
        TotalGuests: 2,
        TotalAmount: 1350.00,
        DepositAmount: 450.00,
        BookingStatus: "CheckedIn",
        CreatedAt: "2025-11-12 16:45:00",
        Guest: {
          GuestID: 503,
          FullName: "Priya Sharma",
          ICNumber: "910203-08-5678",
          Email: "priya.sharma@email.com",
          PhoneNumber: "+60145678901",
          Address: "22 Lorong Maarof, Bangsar, 59000"
        }
      }
    }
  ]);

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.RoomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.RoomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.CurrentBooking?.Guest?.FullName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === "all" || room.Status === filterStatus;
    const matchesType = filterType === "all" || room.RoomType === filterType;
    const minPrice = typeof filterMinPrice === "number" ? filterMinPrice : 0;
    const maxPrice = typeof filterMaxPrice === "number" && filterMaxPrice > 0 ? filterMaxPrice : Infinity;
    const matchesPrice = room.PricePerNight >= minPrice && room.PricePerNight <= maxPrice;

    return matchesSearch && matchesStatus && matchesType && matchesPrice;
  });

  // Calculate statistics
  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.Status === "Available").length,
    occupied: rooms.filter((r) => r.Status === "Occupied").length,
    maintenance: rooms.filter((r) => r.Status === "Maintenance").length,
    occupancyRate: ((rooms.filter((r) => r.Status === "Occupied").length / rooms.length) * 100).toFixed(1),
  };

  const roomTypes = Array.from(new Set(rooms.map((r) => r.RoomType)));

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedRoom(null);
  };

  const handlePriceChange = (setter: (val: number | "") => void, value: string) => {
    if (value === "") {
      setter("");
    } else {
      const num = parseFloat(value);
      setter(isNaN(num) ? "" : num);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-[230px]"}`}>
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
          <RoomDetailsView room={selectedRoom!} onBack={handleBackToList} />
        )}
      </div>
    </div>
  );
}

// Room List View Component
interface RoomListViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  filterMinPrice: number | "";
  setFilterMinPrice: (price: number | "") => void;
  filterMaxPrice: number | "";
  setFilterMaxPrice: (price: number | "") => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filteredRooms: Room[];
  stats: any;
  roomTypes: string[];
  onViewDetails: (room: Room) => void;
  handlePriceChange: (setter: (val: number | "") => void, value: string) => void;
}

function RoomListView({
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
}: RoomListViewProps) {
  return (
    <main className="p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 shadow-sm">
              <Bed className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Room Operations</h1>
              <p className="text-sm text-gray-500">View room availability and current occupancy</p>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              showFilters ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard title="Total Rooms" value={stats.total.toString()} icon={<Home className="h-5 w-5 text-indigo-600" />} color="indigo" />
          <StatCard title="Available" value={stats.available.toString()} icon={<CheckCircle className="h-5 w-5 text-green-600" />} color="green" />
          <StatCard title="Occupied" value={stats.occupied.toString()} icon={<Users className="h-5 w-5 text-blue-600" />} color="blue" />
          <StatCard title="Maintenance" value={stats.maintenance.toString()} icon={<Wrench className="h-5 w-5 text-amber-600" />} color="amber" />
          <StatCard title="Occupancy" value={`${stats.occupancyRate}%`} icon={<Clock className="h-5 w-5 text-purple-600" />} color="purple" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by room number, type, or guest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition ${viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border"}`}
            >
              <Home size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border"}`}
            >
              <Bed size={18} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Room Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">All Types</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (RM)</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={filterMinPrice}
                  onChange={(e) => handlePriceChange(setFilterMinPrice, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (RM)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={filterMaxPrice}
                  onChange={(e) => handlePriceChange(setFilterMaxPrice, e.target.value)}
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
            <RoomCard key={room.RoomID} room={room} onView={onViewDetails} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Room</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price/Night</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Current Guest</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room.RoomID} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">Room {room.RoomNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{room.RoomType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">RM {room.PricePerNight.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <RoomStatusBadge status={room.Status} />
                    </td>
                    <td className="px-6 py-4">
                      {room.Status === "Occupied" && room.CurrentBooking?.Guest ? (
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{room.CurrentBooking.Guest.FullName}</p>
                          <p className="text-xs text-gray-500">Until {room.CurrentBooking.CheckOutDate}</p>
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
                          <Eye size={16} />
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

      {filteredRooms.length === 0 && viewMode === "grid" && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Bed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">No rooms found</p>
        </div>
      )}
    </main>
  );
}

// Room Details View Component
interface RoomDetailsViewProps {
  room: Room;
  onBack: () => void;
}

function RoomDetailsView({ room, onBack }: RoomDetailsViewProps) {
  const amenities = [
    { icon: <Wifi className="h-5 w-5" />, label: "Free WiFi" },
    { icon: <Tv className="h-5 w-5" />, label: "Flat Screen TV" },
    { icon: <Wind className="h-5 w-5" />, label: "Air Conditioning" },
    { icon: <Coffee className="h-5 w-5" />, label: "Mini Fridge" },
  ];

  const calculateNightsRemaining = () => {
    if (!room.CurrentBooking) return 0;
    const checkOut = new Date(room.CurrentBooking.CheckOutDate);
    const today = new Date();
    const diff = Math.ceil((checkOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium transition">
          <ArrowLeft size={20} />
          Back to Room List
        </button>

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 shadow-sm">
            <Bed className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room {room.RoomNumber}</h1>
            <p className="text-sm text-gray-500">{room.RoomType}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Room Image */}
        <div className={`h-64 rounded-xl ${
          room.Status === "Available" ? "bg-gradient-to-br from-green-400 to-green-600" :
          room.Status === "Occupied" ? "bg-gradient-to-br from-blue-400 to-blue-600" :
          "bg-gradient-to-br from-amber-400 to-amber-600"
        } flex items-center justify-center shadow-lg`}>
          <Bed className="h-32 w-32 text-white opacity-90" />
        </div>

        {/* Room Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
            <p className="text-sm text-gray-500 mb-1">Room Number</p>
            <p className="text-2xl font-bold text-gray-900">{room.RoomNumber}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
            <p className="text-sm text-gray-500 mb-1">Room Type</p>
            <p className="text-2xl font-bold text-gray-900">{room.RoomType}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
            <p className="text-sm text-gray-500 mb-1">Price Per Night</p>
            <p className="text-2xl font-bold text-indigo-600">RM {room.PricePerNight.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
            <p className="text-sm text-gray-500 mb-1">Current Status</p>
            <div className="mt-2">
              <RoomStatusBadge status={room.Status} />
            </div>
          </div>
        </div>

        {/* Current Booking Info (if occupied) */}
        {room.Status === "Occupied" && room.CurrentBooking && room.CurrentBooking.Guest && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Current Guest</h3>
                <p className="text-sm text-blue-700">Booking ID: #{room.CurrentBooking.BookingID}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guest Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Guest Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Full Name</p>
                      <p className="font-medium text-gray-900">{room.CurrentBooking.Guest.FullName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="font-medium text-gray-900">{room.CurrentBooking.Guest.Email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Phone Number</p>
                      <p className="font-medium text-gray-900">{room.CurrentBooking.Guest.PhoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">IC Number</p>
                      <p className="font-medium text-gray-900">{room.CurrentBooking.Guest.ICNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Booking Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Check-In Date</p>
                      <p className="font-medium text-gray-900">{room.CurrentBooking.CheckInDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Check-Out Date</p>
                      <p className="font-medium text-gray-900">{room.CurrentBooking.CheckOutDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Nights Remaining</p>
                      <p className="font-medium text-blue-900">{calculateNightsRemaining()} night(s)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Total Guests</p>
                      <p className="font-medium text-gray-900">{room.CurrentBooking.TotalGuests} guest(s)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="md:col-span-2 bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Payment Details
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Total Amount</p>
                    <p className="font-bold text-gray-900">RM {room.CurrentBooking.TotalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Deposit Paid</p>
                    <p className="font-medium text-green-600">RM {room.CurrentBooking.DepositAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Balance Due</p>
                    <p className="font-medium text-amber-600">RM {(room.CurrentBooking.TotalAmount - room.CurrentBooking.DepositAmount).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-indigo-600" />
            Room Description
          </h3>
          <p className="text-gray-700 leading-relaxed">{room.Description}</p>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-5 text-lg">Room Amenities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                  {amenity.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium text-gray-700">Room ID:</span> #{room.RoomID}</p>
            <p><span className="font-medium text-gray-700">Hotel ID:</span> #{room.HotelID}</p>
            {room.CreatedAt && (
              <p>
                <span className="font-medium text-gray-700">Added on:</span>{" "}
                {new Date(room.CreatedAt).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Room Card Component
interface RoomCardProps {
  room: Room;
  onView: (room: Room) => void;
}

function RoomCard({ room, onView }: RoomCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="relative">
        <div className={`h-32 ${
          room.Status === "Available" ? "bg-gradient-to-br from-green-400 to-green-600" :
          room.Status === "Occupied" ? "bg-gradient-to-br from-blue-400 to-blue-600" :
          "bg-gradient-to-br from-amber-400 to-amber-600"
        } flex items-center justify-center`}>
          <Bed className="h-16 w-16 text-white opacity-90" />
        </div>
        <div className="absolute top-3 right-3">
          <RoomStatusBadge status={room.Status} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">Room {room.RoomNumber}</h3>
          <span className="text-sm font-medium text-gray-500">#{room.RoomID}</span>
        </div>

        <p className="text-sm text-gray-600 mb-3">{room.RoomType}</p>

        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="font-bold text-lg text-gray-900">RM {room.PricePerNight.toFixed(2)}</span>
          <span className="text-sm text-gray-500">/night</span>
        </div>

        {/* Show current guest if occupied */}
        {/* {room.Status === "Occupied" && room.CurrentBooking?.Guest ? (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-medium mb-1">Current Guest</p>
            <p className="text-sm font-semibold text-gray-900">{room.CurrentBooking.Guest.FullName}</p>
            <p className="text-xs text-gray-600 mt-1">Until {room.CurrentBooking.CheckOutDate}</p>
          </div>
        ) : ( */}
          <p className="text-xs text-gray-600 mb-4 line-clamp-2">{room.Description}</p>
        {/* )} */}

        <button
          onClick={() => onView(room)}
          className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          View Details
        </button>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const bgColors: Record<string, string> = {
    indigo: "bg-indigo-50",
    green: "bg-green-50",
    blue: "bg-blue-50",
    amber: "bg-amber-50",
    purple: "bg-purple-50",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${bgColors[color]}`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function RoomStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Available: "bg-green-100 text-green-700 border border-green-200",
    Occupied: "bg-blue-100 text-blue-700 border border-blue-200",
    Maintenance: "bg-amber-100 text-amber-700 border border-amber-200",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}