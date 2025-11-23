import React, { useState } from "react";
import {
  Users, Search, Filter, Eye, Edit, Plus, Download,
  Mail, Phone, MapPin, Calendar, CreditCard, FileText,
  TrendingUp, Star, Building, User, ArrowLeft, Clock,
  CheckCircle, XCircle, Home, Bed, DollarSign, History,
  AlertCircle, Award
} from "lucide-react";
import Sidebar from "../../components/Sidebar";

// TypeScript Interfaces based on your database
interface Guest {
  GuestID: number;
  FullName: string;
  ICNumber: string;
  Email: string;
  PhoneNumber: string;
  PasswordHash: string;
  Address: string;
  CognitoID: string;
  CreatedAt: string;
  // Calculated/Aggregated data (not in DB, calculated from queries)
  TotalBookings: number;
  TotalSpent: number;
  LastBookingDate: string | null;
  BookingHistory: Booking[];
  UploadedDocuments: Document[];
  Reviews: Review[];
}

interface Document {
  DocumentID: number;
  GuestID: number;
  FileName: string;
  FileURL: string;
  DocumentType: "ID" | "ProofOfStay" | "HealthCert" | "Other";
  UploadDate: string;
  Status: "Pending" | "Verified";
}

interface Booking {
  BookingID: number;
  GuestID: number;
  RoomID: number;
  RoomNumber: string;
  RoomType: string;
  CheckInDate: string;
  CheckOutDate: string;
  TotalGuests: number;
  TotalAmount: number;
  DepositAmount: number;
  BookingStatus: "Pending" | "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled";
  CreatedAt: string;
}

interface Review {
  ReviewID: number;
  BookingID: number;
  GuestID: number;
  Rating: number;
  Comment: string;
  ReviewDate: string;
}


// Main Component
export default function GuestManagementPage() {
  const [activePage, setActivePage] = useState("Manage Guests");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMinBookings, setFilterMinBookings] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "details">("list");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "bookings" | "spent" | "recent">("name");

  // Mock guest data with complete information from database
  const [guests] = useState<Guest[]>([
    {
      GuestID: 501,
      FullName: "Sarah Lim Wei Ling",
      ICNumber: "920318-10-5432",
      Email: "sarah.lim@email.com",
      PhoneNumber: "+60123456789",
      PasswordHash: "$2a$10$...", // hashed password
      Address: "45 Jalan Ampang, Kuala Lumpur, 50450",
      CognitoID: "cognito-user-abc123",
      CreatedAt: "2024-06-15 10:30:00",
      // Calculated from related tables
      TotalBookings: 5,
      TotalSpent: 3250.00,
      LastBookingDate: "2025-11-20",
      UploadedDocuments: [
        {
          DocumentID: 1,
          GuestID: 501,
          FileName: "IC_Sarah_Lim.pdf",
          FileURL: "https://s3.bucket/docs/ic_501.pdf",
          DocumentType: "ID",
          UploadDate: "2024-06-15 11:00:00",
          Status: "Verified"
        }
      ],
      Reviews: [],
      BookingHistory: [
        {
          BookingID: 1001,
          GuestID: 501,
          RoomID: 102,
          RoomNumber: "102",
          RoomType: "Standard Room",
          CheckInDate: "2025-11-20",
          CheckOutDate: "2025-11-25",
          TotalGuests: 2,
          TotalAmount: 750.00,
          DepositAmount: 225.00,
          BookingStatus: "CheckedIn",
          CreatedAt: "2025-11-15 14:30:00"
        },
        {
          BookingID: 998,
          GuestID: 501,
          RoomID: 305,
          RoomNumber: "305",
          RoomType: "Deluxe Suite",
          CheckInDate: "2025-09-10",
          CheckOutDate: "2025-09-13",
          TotalGuests: 2,
          TotalAmount: 900.00,
          DepositAmount: 300.00,
          BookingStatus: "CheckedOut",
          CreatedAt: "2025-09-01 09:15:00"
        }
      ]
    },
    {
      GuestID: 502,
      FullName: "Ahmad Razak bin Abdullah",
      ICNumber: "880505-03-1234",
      Email: "ahmad.razak@email.com",
      PhoneNumber: "+60198765432",
      PasswordHash: "$2a$10$...",
      Address: "12 Taman Melawati, Kuala Lumpur, 53100",
      CognitoID: "cognito-user-xyz789",
      CreatedAt: "2024-03-20 14:20:00",
      TotalBookings: 8,
      TotalSpent: 5600.00,
      LastBookingDate: "2025-11-18",
      UploadedDocuments: [],
      Reviews: [],
      BookingHistory: [
        {
          BookingID: 1002,
          GuestID: 502,
          RoomID: 302,
          RoomNumber: "302",
          RoomType: "Family Room",
          CheckInDate: "2025-11-18",
          CheckOutDate: "2025-11-23",
          TotalGuests: 4,
          TotalAmount: 1250.00,
          DepositAmount: 375.00,
          BookingStatus: "CheckedIn",
          CreatedAt: "2025-11-10 09:15:00"
        }
      ]
    },
    {
      GuestID: 503,
      FullName: "Priya Sharma",
      ICNumber: "910203-08-5678",
      Email: "priya.sharma@email.com",
      PhoneNumber: "+60145678901",
      PasswordHash: "$2a$10$...",
      Address: "22 Lorong Maarof, Bangsar, 59000",
      CognitoID: "cognito-user-def456",
      CreatedAt: "2024-08-10 11:45:00",
      TotalBookings: 3,
      TotalSpent: 2100.00,
      LastBookingDate: "2025-11-19",
      UploadedDocuments: [],
      Reviews: [],
      BookingHistory: [
        {
          BookingID: 1003,
          GuestID: 503,
          RoomID: 402,
          RoomNumber: "402",
          RoomType: "Executive Suite",
          CheckInDate: "2025-11-19",
          CheckOutDate: "2025-11-22",
          TotalGuests: 2,
          TotalAmount: 1350.00,
          DepositAmount: 450.00,
          BookingStatus: "CheckedIn",
          CreatedAt: "2025-11-12 16:45:00"
        }
      ]
    },
    {
      GuestID: 504,
      FullName: "David Chen Kah Wai",
      ICNumber: "950722-14-9876",
      Email: "david.chen@email.com",
      PhoneNumber: "+60167891234",
      PasswordHash: "$2a$10$...",
      Address: "88 Jalan Sultan, Petaling Jaya, 46200",
      CognitoID: "cognito-user-ghi789",
      CreatedAt: "2025-01-05 16:00:00",
      TotalBookings: 1,
      TotalSpent: 450.00,
      LastBookingDate: "2025-08-15",
      UploadedDocuments: [],
      Reviews: [],
      BookingHistory: [
        {
          BookingID: 950,
          GuestID: 504,
          RoomID: 201,
          RoomNumber: "201",
          RoomType: "Deluxe Suite",
          CheckInDate: "2025-08-15",
          CheckOutDate: "2025-08-17",
          TotalGuests: 1,
          TotalAmount: 450.00,
          DepositAmount: 150.00,
          BookingStatus: "CheckedOut",
          CreatedAt: "2025-08-10 10:30:00"
        }
      ]
    },
    {
      GuestID: 505,
      FullName: "Emily Wong Mei Ling",
      ICNumber: "931115-06-3456",
      Email: "emily.wong@email.com",
      PhoneNumber: "+60126543210",
      PasswordHash: "$2a$10$...",
      Address: "67 Jalan Bukit Bintang, Kuala Lumpur, 55100",
      CognitoID: "cognito-user-jkl012",
      CreatedAt: "2024-11-20 09:30:00",
      TotalBookings: 12,
      TotalSpent: 8950.00,
      LastBookingDate: "2025-10-25",
      UploadedDocuments: [],
      Reviews: [],
      BookingHistory: []
    }
  ]);

  // Filter and sort guests
  const filteredGuests = guests
    .filter(guest => {
      const matchesSearch = 
        guest.FullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.PhoneNumber.includes(searchQuery) ||
        guest.ICNumber.includes(searchQuery);

      const matchesStatus = 
        filterStatus === "all" ||
        (filterStatus === "active" && guest.BookingHistory.some(b => b.BookingStatus === "CheckedIn"));

      const minBookings = typeof filterMinBookings === "number" ? filterMinBookings : 0;
      const matchesBookings = guest.TotalBookings >= minBookings;

      return matchesSearch && matchesStatus && matchesBookings;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "bookings":
          return b.TotalBookings - a.TotalBookings;
        case "spent":
          return b.TotalSpent - a.TotalSpent;
        case "recent":
          if (!a.LastBookingDate) return 1;
          if (!b.LastBookingDate) return -1;
          return new Date(b.LastBookingDate).getTime() - new Date(a.LastBookingDate).getTime();
        default:
          return a.FullName.localeCompare(b.FullName);
      }
    });

  // Calculate statistics
  const stats = {
    total: guests.length,
    active: guests.filter(g => g.BookingHistory.some(b => b.BookingStatus === "CheckedIn")).length,
    registered: guests.filter(g => g.CognitoID).length,
    newThisMonth: guests.filter(g => {
      const created = new Date(g.CreatedAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    totalRevenue: guests.reduce((sum, g) => sum + g.TotalSpent, 0)
  };

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedGuest(null);
  };

  const exportToCSV = () => {
    const headers = ['Guest ID', 'Name', 'Email', 'Phone', 'IC Number', 'Total Bookings', 'Total Spent', 'Last Booking', 'Member Since'];
    const rows = filteredGuests.map(g => [
      g.GuestID,
      g.FullName,
      g.Email,
      g.PhoneNumber,
      g.ICNumber,
      g.TotalBookings,
      g.TotalSpent.toFixed(2),
      g.LastBookingDate || 'N/A',
      g.CreatedAt.split(' ')[0]
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guests_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
          <GuestListView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterMinBookings={filterMinBookings}
            setFilterMinBookings={setFilterMinBookings}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filteredGuests={filteredGuests}
            stats={stats}
            onViewDetails={handleViewDetails}
            exportToCSV={exportToCSV}
          />
        ) : (
          <GuestDetailsView
            guest={selectedGuest!}
            onBack={handleBackToList}
          />
        )}
      </div>
    </div>
  );
}

// Guest List View Component
interface GuestListViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterMinBookings: number | "";
  setFilterMinBookings: (bookings: number | "") => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  sortBy: string;
  setSortBy: (sort: "name" | "bookings" | "spent" | "recent") => void;
  filteredGuests: Guest[];
  stats: any;
  onViewDetails: (guest: Guest) => void;
  exportToCSV: () => void;
}

function GuestListView({
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
  exportToCSV
}: GuestListViewProps) {
  return (
    <main className="p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 shadow-sm">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
              <p className="text-sm text-gray-500">View and manage all guest profiles</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium bordre border-gray-300 transition flex items-center gap-2 ${
                showFilters ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard title="Total Guests" value={stats.total.toString()} icon={<Users className="h-5 w-5 text-purple-600" />} color="purple" />
          <StatCard title="Currently Staying" value={stats.active.toString()} icon={<CheckCircle className="h-5 w-5 text-green-600" />} color="green" />
          <StatCard title="Registered Users" value={stats.registered.toString()} icon={<User className="h-5 w-5 text-blue-600" />} color="blue" />
          <StatCard title="New This Month" value={stats.newThisMonth.toString()} icon={<TrendingUp className="h-5 w-5 text-amber-600" />} color="amber" />
          <StatCard title="Total Revenue" value={`RM ${stats.totalRevenue.toFixed(0)}`} icon={<DollarSign className="h-5 w-5 text-emerald-600" />} color="emerald" />
        </div>

        {/* Search and Sort */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guest Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="all">All Guests</option>
                  <option value="active">Currently Staying</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Bookings</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={filterMinBookings}
                  onChange={(e) => setFilterMinBookings(e.target.value === "" ? "" : parseInt(e.target.value))}
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

      {/* Guests Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Guest Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Member Since</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bookings</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total Spent</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Last Visit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.GuestID} className="border-b border-gray-300 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{guest.FullName}</p>
                        <p className="text-xs text-gray-500">ID: #{guest.GuestID}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {guest.Email}
                      </p>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {guest.PhoneNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {new Date(guest.CreatedAt).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-900">{guest.TotalBookings}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">RM {guest.TotalSpent.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      {guest.LastBookingDate ? new Date(guest.LastBookingDate).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <GuestStatusBadge 
                      isActive={guest.BookingHistory.some(b => b.BookingStatus === "CheckedIn")}
                      hasAccount={!!guest.CognitoID}
                    />
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
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </main>
  );
}

// Guest Details View Component
interface GuestDetailsViewProps {
  guest: Guest;
  onBack: () => void;
}

function GuestDetailsView({ guest, onBack }: GuestDetailsViewProps) {
  const isActive = guest.BookingHistory.some(b => b.BookingStatus === "CheckedIn");
  const activeBooking = guest.BookingHistory.find(b => b.BookingStatus === "CheckedIn");
  const hasRegisteredAccount = !!guest.CognitoID;

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition">
        <ArrowLeft size={20} />
        Back to Guest List
      </button>

      {/* Guest Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{guest.FullName}</h1>
                {hasRegisteredAccount && (
                  <span className="px-3 py-1 rounded-full bg-blue-400 text-blue-900 text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Registered
                  </span>
                )}
              </div>
              <p className="text-purple-100">Guest ID: #{guest.GuestID}</p>
              <p className="text-purple-100 text-sm mt-1">
                Account created: {new Date(guest.CreatedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-purple-100 text-sm mb-1">Total Bookings</p>
            <p className="text-4xl font-bold">{guest.TotalBookings}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">RM {guest.TotalSpent.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Avg: RM {(guest.TotalSpent / guest.TotalBookings).toFixed(2)} per booking</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bed className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{guest.TotalBookings}</p>
          <p className="text-xs text-gray-500 mt-1">{guest.BookingHistory.filter(b => b.BookingStatus === "CheckedOut").length} completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">Last Visit</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {guest.LastBookingDate ? new Date(guest.LastBookingDate).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' }) : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {guest.LastBookingDate ? new Date(guest.LastBookingDate).toLocaleDateString('en-MY', { year: 'numeric' }) : 'Never booked'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-sm text-gray-500">Documents</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{guest.UploadedDocuments.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {guest.UploadedDocuments.filter(d => d.Status === "Verified").length} verified
          </p>
        </div>
      </div>

      {/* Current Stay Alert (if active) */}
      {isActive && activeBooking && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">Currently Staying</h3>
              <p className="text-sm text-green-700 mb-3">
                Room {activeBooking.RoomNumber} ({activeBooking.RoomType}) • Check-out: {activeBooking.CheckOutDate}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-600 text-xs">Booking ID</p>
                  <p className="font-medium text-green-900">#{activeBooking.BookingID}</p>
                </div>
                <div>
                  <p className="text-green-600 text-xs">Total Guests</p>
                  <p className="font-medium text-green-900">{activeBooking.TotalGuests} guest(s)</p>
                </div>
                <div>
                  <p className="text-green-600 text-xs">Total Amount</p>
                  <p className="font-medium text-green-900">RM {activeBooking.TotalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-purple-600" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Email Address</p>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{guest.Email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{guest.PhoneNumber}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">IC/Passport Number</p>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{guest.ICNumber}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="font-medium text-gray-900">{guest.Address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              Guest Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Type</span>
                {hasRegisteredAccount ? (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Registered
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">Walk-in</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Stay</span>
                {isActive ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">In Hotel</span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">Not Staying</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents</span>
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                  {guest.UploadedDocuments.length} Files
                </span>
              </div>
              {guest.CognitoID && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cognito ID</span>
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-mono">
                    {guest.CognitoID.substring(0, 12)}...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition flex items-center justify-center gap-2">
                <Edit size={16} />
                Edit Guest Info
              </button>
              <button className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition flex items-center justify-center gap-2">
                <Plus size={16} />
                New Booking
              </button>
              <button className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <Mail size={16} />
                Send Email
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Booking History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-300">
            <div className="px-6 py-5 border-b border-gray-300">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-purple-600" />
                Booking History
              </h3>
              <p className="text-sm text-gray-500 mt-1">Complete record of all bookings</p>
            </div>

            <div className="p-6">
              {guest.BookingHistory.length > 0 ? (
                <div className="space-y-4">
                  {guest.BookingHistory.map((booking) => (
                    <div key={booking.BookingID} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">Booking #{booking.BookingID}</h4>
                            <BookingStatusBadge status={booking.BookingStatus} />
                          </div>
                          <p className="text-sm text-gray-600">Room {booking.RoomNumber} - {booking.RoomType}</p>
                        </div>
                        <p className="font-bold text-lg text-gray-900">RM {booking.TotalAmount.toFixed(2)}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Check-In</p>
                          <p className="font-medium text-gray-900">{booking.CheckInDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Check-Out</p>
                          <p className="font-medium text-gray-900">{booking.CheckOutDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Guests</p>
                          <p className="font-medium text-gray-900">{booking.TotalGuests} guest(s)</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Deposit</p>
                          <p className="font-medium text-gray-900">RM {booking.DepositAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">Booked on {new Date(booking.CreatedAt).toLocaleDateString('en-MY')}</p>
                        <button className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1">
                          <Eye size={14} />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No booking history</p>
                  <p className="text-sm text-gray-400 mt-1">This guest hasn't made any bookings yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Summary */}
          {guest.BookingHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 mt-6 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {guest.BookingHistory.filter(b => b.BookingStatus === "CheckedOut").length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {guest.BookingHistory.filter(b => b.BookingStatus === "CheckedIn").length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Active</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {guest.BookingHistory.filter(b => b.BookingStatus === "Cancelled").length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Cancelled</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {guest.BookingHistory.filter(b => b.BookingStatus === "Confirmed" || b.BookingStatus === "Pending").length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Upcoming</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Helper Components
function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const bgColors: Record<string, string> = {
    purple: "bg-purple-50",
    green: "bg-green-50",
    blue: "bg-blue-50",
    amber: "bg-amber-50",
    emerald: "bg-emerald-50",
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

function GuestStatusBadge({ isActive, hasAccount }: { isActive: boolean; hasAccount: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
        <CheckCircle className="h-3 w-3 mr-1" />
        In Hotel
      </span>
    );
  }
  
  if (hasAccount) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
        <User className="h-3 w-3 mr-1" />
        Registered
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
      Walk-in
    </span>
  );
}

function BookingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-sky-100 text-sky-700",
    CheckedIn: "bg-green-100 text-green-700",
    CheckedOut: "bg-gray-100 text-gray-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  const labels: Record<string, string> = {
    CheckedIn: "Checked In",
    CheckedOut: "Checked Out",
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
}