import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { 
  Calendar, Search, Filter, Download, Eye, 
  Edit, XCircle, CheckCircle, Clock, User, 
  Bed, CreditCard, Phone, Mail, MapPin, 
  FileText, DollarSign, Users, ArrowLeft,
  AlertCircle, Receipt, Printer, Send
} from "lucide-react";

// TypeScript Interfaces
interface Guest {
  GuestID: number;
  FullName: string;
  ICNumber: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
}

interface Room {
  RoomID: number;
  RoomNumber: string;
  RoomType: string;
  PricePerNight: number;
  Status: "Available" | "Occupied" | "Maintenance";
}

interface Payment {
  PaymentID: number;
  BookingID: number;
  PaymentDate: string;
  Amount: number;
  PaymentMethod: "CreditCard" | "DebitCard" | "Cash" | "OnlineTransfer";
  Status: "Pending" | "Completed" | "Failed";
  ReceiptURL?: string;
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
  Guest: Guest;
  Room: Room;
  Payments: Payment[];
  TotalPaid: number;
  PendingAmount: number;
  NumberOfNights: number;
}

interface FilterOptions {
  status: string;
  dateFrom: string;
  dateTo: string;
  searchQuery: string;
}



// Main App Component
export default function ReservationManagement() {
  const [activePage, setActivePage] = useState("Reservation");
  const [currentView, setCurrentView] = useState<'list' | 'details'>('list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Initialize mock data
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        BookingID: 1001,
        GuestID: 501,
        RoomID: 305,
        CheckInDate: "2025-11-22",
        CheckOutDate: "2025-11-25",
        TotalGuests: 2,
        TotalAmount: 900.00,
        DepositAmount: 300.00,
        BookingStatus: "Confirmed",
        CreatedAt: "2025-11-15 10:30:00",
        NumberOfNights: 3,
        Guest: {
          GuestID: 501,
          FullName: "Sarah Lim Wei Ling",
          ICNumber: "920318-10-5432",
          Email: "sarah.lim@email.com",
          PhoneNumber: "+60123456789",
          Address: "45 Jalan Ampang, Kuala Lumpur, 50450"
        },
        Room: {
          RoomID: 305,
          RoomNumber: "305",
          RoomType: "Deluxe Suite",
          PricePerNight: 300.00,
          Status: "Available"
        },
        Payments: [
          {
            PaymentID: 2001,
            BookingID: 1001,
            PaymentDate: "2025-11-15 10:35:00",
            Amount: 300.00,
            PaymentMethod: "CreditCard",
            Status: "Completed",
            ReceiptURL: "https://receipts.example.com/2001"
          }
        ],
        TotalPaid: 300.00,
        PendingAmount: 600.00
      },
      {
        BookingID: 1002,
        GuestID: 502,
        RoomID: 207,
        CheckInDate: "2025-11-20",
        CheckOutDate: "2025-11-23",
        TotalGuests: 1,
        TotalAmount: 450.00,
        DepositAmount: 150.00,
        BookingStatus: "CheckedIn",
        CreatedAt: "2025-11-18 14:20:00",
        NumberOfNights: 3,
        Guest: {
          GuestID: 502,
          FullName: "Ahmad Razak bin Abdullah",
          ICNumber: "880505-03-1234",
          Email: "ahmad.razak@email.com",
          PhoneNumber: "+60198765432",
          Address: "12 Taman Melawati, Kuala Lumpur, 53100"
        },
        Room: {
          RoomID: 207,
          RoomNumber: "207",
          RoomType: "Standard Room",
          PricePerNight: 150.00,
          Status: "Occupied"
        },
        Payments: [
          {
            PaymentID: 2002,
            BookingID: 1002,
            PaymentDate: "2025-11-18 14:25:00",
            Amount: 150.00,
            PaymentMethod: "Cash",
            Status: "Completed"
          },
          {
            PaymentID: 2003,
            BookingID: 1002,
            PaymentDate: "2025-11-20 15:10:00",
            Amount: 300.00,
            PaymentMethod: "DebitCard",
            Status: "Completed"
          }
        ],
        TotalPaid: 450.00,
        PendingAmount: 0
      },
      {
        BookingID: 1003,
        GuestID: 503,
        RoomID: 110,
        CheckInDate: "2025-11-25",
        CheckOutDate: "2025-11-28",
        TotalGuests: 3,
        TotalAmount: 600.00,
        DepositAmount: 200.00,
        BookingStatus: "Pending",
        CreatedAt: "2025-11-19 09:15:00",
        NumberOfNights: 3,
        Guest: {
          GuestID: 503,
          FullName: "David Chen Kah Wai",
          ICNumber: "950722-14-9876",
          Email: "david.chen@email.com",
          PhoneNumber: "+60167891234",
          Address: "88 Jalan Sultan, Petaling Jaya, 46200"
        },
        Room: {
          RoomID: 110,
          RoomNumber: "110",
          RoomType: "Family Room",
          PricePerNight: 200.00,
          Status: "Available"
        },
        Payments: [],
        TotalPaid: 0,
        PendingAmount: 600.00
      },
      {
        BookingID: 1004,
        GuestID: 504,
        RoomID: 405,
        CheckInDate: "2025-11-18",
        CheckOutDate: "2025-11-20",
        TotalGuests: 2,
        TotalAmount: 700.00,
        DepositAmount: 350.00,
        BookingStatus: "CheckedOut",
        CreatedAt: "2025-11-10 16:45:00",
        NumberOfNights: 2,
        Guest: {
          GuestID: 504,
          FullName: "Priya Sharma",
          ICNumber: "910203-08-5678",
          Email: "priya.sharma@email.com",
          PhoneNumber: "+60145678901",
          Address: "22 Lorong Maarof, Bangsar, 59000"
        },
        Room: {
          RoomID: 405,
          RoomNumber: "405",
          RoomType: "Executive Suite",
          PricePerNight: 350.00,
          Status: "Available"
        },
        Payments: [
          {
            PaymentID: 2004,
            BookingID: 1004,
            PaymentDate: "2025-11-10 16:50:00",
            Amount: 350.00,
            PaymentMethod: "OnlineTransfer",
            Status: "Completed"
          },
          {
            PaymentID: 2005,
            BookingID: 1004,
            PaymentDate: "2025-11-20 11:30:00",
            Amount: 350.00,
            PaymentMethod: "CreditCard",
            Status: "Completed"
          }
        ],
        TotalPaid: 700.00,
        PendingAmount: 0
      }
    ];
    setBookings(mockBookings);
  }, []);

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setCurrentView('details');
  };

  const goBackToList = () => {
    setCurrentView('list');
    setSelectedBooking(null);
  };

  const updateBooking = (updatedBooking: Booking) => {
    setBookings(prev => 
      prev.map(b => b.BookingID === updatedBooking.BookingID ? updatedBooking : b)
    );
    setSelectedBooking(updatedBooking);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-[230px]"}`}>
        {currentView === 'list' && (
          <ReservationListPage 
            bookings={bookings}
            setBookings={setBookings}
            openBookingDetails={openBookingDetails}
          />
        )}
        
        {currentView === 'details' && selectedBooking && (
          <ReservationDetailsPage 
            booking={selectedBooking}
            goBack={goBackToList}
            updateBooking={updateBooking}
          />
        )}
      </div>
    </div>
  );
}

// Reservation List Page Component
interface ReservationListPageProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  openBookingDetails: (booking: Booking) => void;
}

function ReservationListPage({ bookings, setBookings, openBookingDetails }: ReservationListPageProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    searchQuery: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filters.status === 'all' || booking.BookingStatus === filters.status;
    
    const matchesSearch = 
      booking.Guest.FullName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      booking.Room.RoomNumber.includes(filters.searchQuery) ||
      booking.BookingID.toString().includes(filters.searchQuery);
    
    const matchesDateFrom = !filters.dateFrom || booking.CheckInDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || booking.CheckInDate <= filters.dateTo;

    return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  // Calculate statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.BookingStatus === 'Pending').length,
    confirmed: bookings.filter(b => b.BookingStatus === 'Confirmed').length,
    checkedIn: bookings.filter(b => b.BookingStatus === 'CheckedIn').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.TotalPaid, 0),
    pendingPayments: bookings.reduce((sum, b) => sum + b.PendingAmount, 0)
  };

  const exportToCSV = () => {
    const headers = ['Booking ID', 'Guest Name', 'Room', 'Check-In', 'Check-Out', 'Nights', 'Total Amount', 'Paid', 'Pending', 'Status'];
    const rows = filteredBookings.map(b => [
      b.BookingID,
      b.Guest.FullName,
      `${b.Room.RoomNumber} - ${b.Room.RoomType}`,
      b.CheckInDate,
      b.CheckOutDate,
      b.NumberOfNights,
      b.TotalAmount.toFixed(2),
      b.TotalPaid.toFixed(2),
      b.PendingAmount.toFixed(2),
      b.BookingStatus
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <main className="p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 shadow-sm">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reservation Management</h1>
              <p className="text-sm text-gray-500">View and manage all hotel reservations</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium  border border-gray-300 transition flex items-center gap-2 ${
                showFilters ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Reservations" value={stats.total.toString()} icon={<FileText className="h-5 w-5 text-sky-600" />} color="sky" />
          <StatCard title="Checked In" value={stats.checkedIn.toString()} icon={<CheckCircle className="h-5 w-5 text-green-600" />} color="green" />
          <StatCard title="Total Revenue" value={`RM ${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-emerald-600" />} color="emerald" />
          <StatCard title="Pending Payments" value={`RM ${stats.pendingPayments.toFixed(2)}`} icon={<AlertCircle className="h-5 w-5 text-amber-600" />} color="amber" />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-In From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-In To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Guest, Room, or ID..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({ status: 'all', dateFrom: '', dateTo: '', searchQuery: '' })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="mt-4 flex justify-end">
          <a href="/walk-in-booking" className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 inline-block text-center">
              Register New Walk-in Guest
            </a>
      </div>

      {/* Reservations Table */}
      <div className="mt-4 bg-white rounded-xl shadow-sm overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border border-gray-200">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Booking ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Guest Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Room Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Check-In / Out</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Guests</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Financial</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.BookingID} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4  ">
                    <div>
                      <p className="font-bold text-gray-900">#{booking.BookingID}</p>
                      <p className="text-xs text-gray-500">{booking.CreatedAt.split(' ')[0]}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.Guest.FullName}</p>
                        <p className="text-xs text-gray-500">{booking.Guest.PhoneNumber}</p>
                        <p className="text-xs text-gray-500">{booking.Guest.Email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">Room {booking.Room.RoomNumber}</p>
                      <p className="text-sm text-gray-600">{booking.Room.RoomType}</p>
                      <p className="text-xs text-gray-500">RM {booking.Room.PricePerNight}/night</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-700">{booking.CheckInDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-700">{booking.CheckOutDate}</span>
                      </div>
                      <p className="text-xs text-sky-600 mt-1 font-medium">{booking.NumberOfNights} night(s)</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{booking.TotalGuests}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-bold text-gray-900">RM {booking.TotalAmount.toFixed(2)}</p>
                      <p className="text-xs text-green-600">Paid: RM {booking.TotalPaid.toFixed(2)}</p>
                      {booking.PendingAmount > 0 && (
                        <p className="text-xs text-amber-600 font-medium">Due: RM {booking.PendingAmount.toFixed(2)}</p>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <BookingStatusBadge status={booking.BookingStatus} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openBookingDetails(booking)}
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
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Reservation Details Page Component
interface ReservationDetailsPageProps {
  booking: Booking;
  goBack: () => void;
  updateBooking: (booking: Booking) => void;
}

function ReservationDetailsPage({ booking, goBack, updateBooking }: ReservationDetailsPageProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CreditCard" | "DebitCard" | "Cash" | "OnlineTransfer">("Cash");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'checkin' | 'checkout' | 'cancel' | null>(null);

  const handleMakePayment = () => {
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (amount > booking.PendingAmount) {
      alert(`Payment amount cannot exceed pending amount of RM ${booking.PendingAmount.toFixed(2)}`);
      return;
    }

    const newPayment: Payment = {
      PaymentID: Date.now(),
      BookingID: booking.BookingID,
      PaymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      Amount: amount,
      PaymentMethod: paymentMethod,
      Status: "Completed"
    };

    const newTotalPaid = booking.TotalPaid + amount;
    const newPendingAmount = booking.TotalAmount - newTotalPaid;

    const updatedBooking = {
      ...booking,
      Payments: [...booking.Payments, newPayment],
      TotalPaid: newTotalPaid,
      PendingAmount: newPendingAmount
    };

    updateBooking(updatedBooking);
    setShowPaymentForm(false);
    setPaymentAmount("");
  };

  const handleAction = (action: 'confirm' | 'checkin' | 'checkout' | 'cancel') => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    if (!confirmAction) return;

    let updatedBooking = { ...booking };

    if (confirmAction === 'confirm') {
      updatedBooking = { ...booking, BookingStatus: 'Confirmed' };
    } else if (confirmAction === 'checkin') {
      updatedBooking = { ...booking, BookingStatus: 'CheckedIn', Room: { ...booking.Room, Status: 'Occupied' } };
    } else if (confirmAction === 'checkout') {
      updatedBooking = { ...booking, BookingStatus: 'CheckedOut', Room: { ...booking.Room, Status: 'Available' } };
    } else if (confirmAction === 'cancel') {
      updatedBooking = { ...booking, BookingStatus: 'Cancelled', Room: { ...booking.Room, Status: 'Available' } };
    }

    updateBooking(updatedBooking);
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const printReceipt = () => {
    window.print();
  };

const sendConfirmationEmail = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/email/booking-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // to: booking.Guest.Email,
        to: 'monieshaanair.rames@gmail.com',
        booking: {
          BookingID: booking.BookingID,
          GuestName: booking.Guest.FullName,
          RoomNumber: booking.Room.RoomNumber,
          RoomType: booking.Room.RoomType,
          CheckInDate: booking.CheckInDate,
          CheckOutDate: booking.CheckOutDate,
          TotalAmount: booking.TotalAmount,
          DepositAmount: booking.DepositAmount,
          PhoneNumber: booking.Guest.PhoneNumber
        }
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to send email', text);
      alert('Failed to send confirmation email');
      return;
    }

    alert(`Confirmation email sent to ${booking.Guest.Email}`);
  } catch (error) {
    console.error('Error sending confirmation email', error);
    alert('Error sending confirmation email');
  }
};

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Reservations</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reservation #{booking.BookingID}</h1>
            <p className="text-gray-500 mt-1">Created on {booking.CreatedAt}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <BookingStatusBadge status={booking.BookingStatus} />
            <button
              onClick={sendConfirmationEmail}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center gap-2"
            >
              <Send size={18} />
              Send Email
            </button>
            <button
              onClick={printReceipt}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white font-medium transition flex items-center gap-2"
            >
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-sky-600" />
              Guest Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{booking.Guest.FullName}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">IC Number</p>
                <p className="font-medium text-gray-900">{booking.Guest.ICNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email Address</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {booking.Guest.Email}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {booking.Guest.PhoneNumber}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {booking.Guest.Address}
                </p>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <Bed className="h-5 w-5 text-emerald-600" />
              Reservation Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Room Number</p>
                <p className="font-semibold text-gray-900 text-lg">{booking.Room.RoomNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Room Type</p>
                <p className="font-medium text-gray-900">{booking.Room.RoomType}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Check-In Date</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {booking.CheckInDate}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Check-Out Date</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {booking.CheckOutDate}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Number of Nights</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  {booking.NumberOfNights} night(s)
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total Guests</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  {booking.TotalGuests} guest(s)
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Price Per Night</p>
                <p className="font-medium text-gray-900">RM {booking.Room.PricePerNight.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Room Status</p>
                <RoomStatusBadge status={booking.Room.Status} />
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-purple-600" />
              Payment History
            </h3>
            
            {booking.Payments.length > 0 ? (
              <div className="space-y-3">
                {booking.Payments.map((payment) => (
                  <div key={payment.PaymentID} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">RM {payment.Amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{payment.PaymentDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <PaymentMethodBadge method={payment.PaymentMethod} />
                      <PaymentStatusBadge status={payment.Status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No payments recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Financial Summary & Actions */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Room Rate</span>
                <span className="font-medium text-gray-900">RM {booking.Room.PricePerNight.toFixed(2)}/night</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Number of Nights</span>
                <span className="font-medium text-gray-900">{booking.NumberOfNights}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-gray-900 text-lg">RM {booking.TotalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Deposit Required</span>
                <span className="font-medium text-gray-700">RM {booking.DepositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-green-600">RM {booking.TotalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold text-gray-900">Balance Due</span>
                <span className={`font-bold text-xl ${booking.PendingAmount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  RM {booking.PendingAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Action */}
            {booking.PendingAmount > 0 && booking.BookingStatus !== 'Cancelled' && (
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="w-full mt-4 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                Process Payment
              </button>
            )}

            {/* Payment Form */}
            {showPaymentForm && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={booking.PendingAmount}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max: ${booking.PendingAmount.toFixed(2)}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="CreditCard">Credit Card</option>
                    <option value="DebitCard">Debit Card</option>
                    <option value="OnlineTransfer">Online Transfer</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowPaymentForm(false);
                      setPaymentAmount("");
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMakePayment}
                    className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
                  >
                    Process
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {booking.BookingStatus === "Pending" && (
                <button
                  onClick={() => handleAction('confirm')}
                  className="w-full px-4 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Confirm Booking
                </button>
              )}

              {booking.BookingStatus === "Confirmed" && (
                <button
                  onClick={() => handleAction('checkin')}
                  className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Check In Guest
                </button>
              )}

              {booking.BookingStatus === "CheckedIn" && (
                <button
                  onClick={() => handleAction('checkout')}
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Check Out Guest
                </button>
              )}

              {(booking.BookingStatus === "Pending" || booking.BookingStatus === "Confirmed") && (
                <button
                  onClick={() => handleAction('cancel')}
                  className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Cancel Reservation
                </button>
              )}

              {(booking.BookingStatus === "CheckedOut" || booking.BookingStatus === "Cancelled") && (
                <div className="px-4 py-3 rounded-lg bg-gray-100 text-gray-600 font-medium text-center">
                  Reservation {booking.BookingStatus}
                </div>
              )}
            </div>
          </div>

          {/* Booking Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Booking Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                </div>
                <div className="pb-4">
                  <p className="font-medium text-gray-900">Booking Created</p>
                  <p className="text-xs text-gray-500">{booking.CreatedAt}</p>
                </div>
              </div>

              {booking.BookingStatus !== "Pending" && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
                      <CheckCircle size={16} className="text-sky-600" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-gray-900">Booking Confirmed</p>
                    <p className="text-xs text-gray-500">Status updated</p>
                  </div>
                </div>
              )}

              {(booking.BookingStatus === "CheckedIn" || booking.BookingStatus === "CheckedOut") && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    {booking.BookingStatus === "CheckedOut" && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-gray-900">Guest Checked In</p>
                    <p className="text-xs text-gray-500">{booking.CheckInDate}</p>
                  </div>
                </div>
              )}

              {booking.BookingStatus === "CheckedOut" && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle size={16} className="text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Guest Checked Out</p>
                    <p className="text-xs text-gray-500">{booking.CheckOutDate}</p>
                  </div>
                </div>
              )}

              {booking.BookingStatus === "Cancelled" && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle size={16} className="text-red-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Booking Cancelled</p>
                    <p className="text-xs text-gray-500">Reservation terminated</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction === 'confirm' && 'Confirm Booking'}
              {confirmAction === 'checkin' && 'Check In Guest'}
              {confirmAction === 'checkout' && 'Check Out Guest'}
              {confirmAction === 'cancel' && 'Cancel Reservation'}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmAction === 'confirm' && `Confirm reservation for ${booking.Guest.FullName}?`}
              {confirmAction === 'checkin' && `Check in ${booking.Guest.FullName} to Room ${booking.Room.RoomNumber}?`}
              {confirmAction === 'checkout' && `Check out ${booking.Guest.FullName} from Room ${booking.Room.RoomNumber}?`}
              {confirmAction === 'cancel' && `Are you sure you want to cancel this reservation? This action cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition ${
                  confirmAction === 'cancel' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : confirmAction === 'confirm'
                    ? 'bg-sky-600 hover:bg-sky-700'
                    : confirmAction === 'checkin'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Helper Components
function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const bgColors: Record<string, string> = {
    sky: 'bg-sky-50',
    green: 'bg-green-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50'
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

function BookingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Confirmed': 'bg-sky-100 text-sky-700',
    'CheckedIn': 'bg-green-100 text-green-700',
    'CheckedOut': 'bg-gray-100 text-gray-700',
    'Cancelled': 'bg-red-100 text-red-700'
  };

  const labels: Record<string, string> = {
    'CheckedIn': 'Checked In',
    'CheckedOut': 'Checked Out'
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
}

function RoomStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Available': 'bg-green-100 text-green-700',
    'Occupied': 'bg-amber-100 text-amber-700',
    'Maintenance': 'bg-red-100 text-red-700'
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    'CreditCard': 'bg-blue-100 text-blue-700',
    'DebitCard': 'bg-indigo-100 text-indigo-700',
    'Cash': 'bg-green-100 text-green-700',
    'OnlineTransfer': 'bg-purple-100 text-purple-700'
  };

  const labels: Record<string, string> = {
    'CreditCard': 'Credit Card',
    'DebitCard': 'Debit Card',
    'OnlineTransfer': 'Online Transfer'
  };

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${styles[method]} mb-1`}>
      {labels[method] || method}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Completed': 'bg-green-100 text-green-700',
    'Pending': 'bg-amber-100 text-amber-700',
    'Failed': 'bg-red-100 text-red-700'
  };

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}