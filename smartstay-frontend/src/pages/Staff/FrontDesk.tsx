import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { 
  Calendar, Search, DoorOpen, DoorClosed, Users, 
  Eye, CheckCircle, XCircle, CreditCard,
  Phone, Mail, MapPin, User, Bed, ArrowLeft, Banknote, Receipt, Monitor
} from "lucide-react";

// TypeScript Interfaces
interface Booking {
  BookingID: number;
  GuestName: string;
  RoomNumber: string;
  RoomType: string;
  CheckInDate: string;
  CheckOutDate: string;
  ActivityType: "Check-In" | "Check-Out" | "Stayover";
  BookingStatus: "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled" | "Pending";
  CheckInTime: string | null;
  CheckOutTime: string | null;
  TotalAmount: number;
  DepositAmount: number;
  PaymentStatus: "Completed" | "Pending" | "Failed";
  TotalGuests: number;
  Email: string;
  PhoneNumber: string;
  ICNumber: string;
  Address: string;
  AmountPaid: number;
}

interface Payment {
  id: number;
  amount: number;
  paymentType: "Cash" | "Card";
  paymentDate: string;
}

interface ConfirmAction {
  type: 'checkin' | 'checkout' | 'cancel';
  booking: Booking;
}




// Main App Component
export default function FrontDeskApp() {
  const [activePage, setActivePage] = useState("Front Desk");
  const [currentView, setCurrentView] = useState<'frontdesk' | 'bookingdetails'>('frontdesk');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const [activities, setActivities] = useState<Booking[]>([
    {
      BookingID: 1,
      GuestName: "John Tan Wei Ming",
      RoomNumber: "305",
      RoomType: "Deluxe Suite",
      CheckInDate: "2025-11-19",
      CheckOutDate: "2025-11-22",
      ActivityType: "Check-In",
      BookingStatus: "Confirmed",
      CheckInTime: null,
      CheckOutTime: null,
      TotalAmount: 450.00,
      DepositAmount: 150.00,
      PaymentStatus: "Pending",
      TotalGuests: 2,
      Email: "john.tan@email.com",
      PhoneNumber: "+60123456789",
      ICNumber: "850123-10-5678",
      Address: "123 Jalan Bukit, Kuala Lumpur",
      AmountPaid: 150.00
    },
    {
      BookingID: 2,
      GuestName: "Aisha Karim",
      RoomNumber: "207",
      RoomType: "Standard Room",
      CheckInDate: "2025-11-17",
      CheckOutDate: "2025-11-19",
      ActivityType: "Check-Out",
      BookingStatus: "CheckedIn",
      CheckInTime: "2025-11-17 14:30:00",
      CheckOutTime: null,
      TotalAmount: 300.00,
      DepositAmount: 100.00,
      PaymentStatus: "Pending",
      TotalGuests: 1,
      Email: "aisha.k@email.com",
      PhoneNumber: "+60198765432",
      ICNumber: "920315-08-1234",
      Address: "456 Lorong Merdeka, Petaling Jaya",
      AmountPaid: 100.00
    },
    {
      BookingID: 3,
      GuestName: "Michael Lee Choon Wai",
      RoomNumber: "110",
      RoomType: "Standard Room",
      CheckInDate: "2025-11-18",
      CheckOutDate: "2025-11-20",
      ActivityType: "Stayover",
      BookingStatus: "CheckedIn",
      CheckInTime: "2025-11-18 15:00:00",
      CheckOutTime: null,
      TotalAmount: 280.00,
      DepositAmount: 100.00,
      PaymentStatus: "Completed",
      TotalGuests: 2,
      Email: "michael.lee@email.com",
      PhoneNumber: "+60167891234",
      ICNumber: "880722-14-9876",
      Address: "789 Taman Indah, Subang Jaya",
      AmountPaid: 280.00
    }
  ]);

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setCurrentView('bookingdetails');
  };

  const goBackToFrontDesk = () => {
    setCurrentView('frontdesk');
    setSelectedBooking(null);
  };

  const updateBooking = (updatedBooking: Booking) => {
    setActivities(prev => 
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
        {currentView === 'frontdesk' && (
          <FrontDeskPage 
            activities={activities}
            setActivities={setActivities}
            sidebarCollapsed={sidebarCollapsed}
            openBookingDetails={openBookingDetails}
          />
        )}
        
        {currentView === 'bookingdetails' && selectedBooking && (
          <BookingDetailsPage 
            booking={selectedBooking}
            goBack={goBackToFrontDesk}
            updateBooking={updateBooking}
          />
        )}
      </div>
    </div>
  );
}

// Front Desk Page Component
interface FrontDeskPageProps {
  activities: Booking[];
  setActivities: React.Dispatch<React.SetStateAction<Booking[]>>;
  sidebarCollapsed: boolean;
  openBookingDetails: (booking: Booking) => void;
}

function FrontDeskPage({ activities, setActivities, sidebarCollapsed, openBookingDetails }: FrontDeskPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterTab, setFilterTab] = useState("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.GuestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.RoomNumber.includes(searchQuery);
    
    const matchesTab = 
      filterTab === "all" ||
      (filterTab === "checkin" && activity.ActivityType === "Check-In") ||
      (filterTab === "checkout" && activity.ActivityType === "Check-Out") ||
      (filterTab === "stayover" && activity.ActivityType === "Stayover");

    return matchesSearch && matchesTab;
  });

  const todayCheckIns = activities.filter(a => a.ActivityType === "Check-In").length;
  const todayCheckOuts = activities.filter(a => a.ActivityType === "Check-Out").length;
  const currentlyStaying = activities.filter(a => a.BookingStatus === "CheckedIn").length;

  const handleCompleteCheckIn = (booking: Booking) => {
    setConfirmAction({ type: 'checkin', booking });
    setShowConfirmDialog(true);
  };

  const handleCompleteCheckOut = (booking: Booking) => {
    setConfirmAction({ type: 'checkout', booking });
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    if (!confirmAction) return;

    const { type, booking } = confirmAction;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setActivities(prev => prev.map(a => {
      if (a.BookingID === booking.BookingID) {
        if (type === 'checkin') {
          return { ...a, BookingStatus: 'CheckedIn' as const, CheckInTime: now };
        } else if (type === 'checkout') {
          return { ...a, BookingStatus: 'CheckedOut' as const, CheckOutTime: now };
        }
      }
      return a;
    }));

    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  return (
    <main className="p-6">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 shadow-sm">
            <Monitor className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Front Desk Overview</h1>
            <p className="text-sm text-gray-500">Monitor today's check-ins, check-outs, and current stays</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm">
            <Calendar size={18} className="text-gray-500" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="focus:outline-none text-sm text-gray-700" 
            />
          </div>

          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm w-64">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search guest or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:outline-none text-sm text-gray-700 w-full"
            />
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <SummaryCard 
          title="Today's Check-Ins" 
          value={todayCheckIns} 
          icon={<DoorOpen className="h-6 w-6 text-green-600" />}
          color="green"
        />
        <SummaryCard 
          title="Today's Check-Outs" 
          value={todayCheckOuts} 
          icon={<DoorClosed className="h-6 w-6 text-blue-600" />}
          color="blue"
        />
        <SummaryCard 
          title="Currently Staying" 
          value={currentlyStaying} 
          icon={<Users className="h-6 w-6 text-sky-600" />}
          color="sky"
        />
      </section>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Activities' },
          { key: 'checkin', label: 'Check-Ins' },
          { key: 'checkout', label: 'Check-Outs' },
          { key: 'stayover', label: 'Stayovers' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterTab === tab.key 
                ? 'bg-sky-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activities Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Activity</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border border-gray-200">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-600 bg-gray-50">
                <th className="px-6 py-3 text-left">Guest</th>
                <th className="px-6 py-3 text-left">Room</th>
                <th className="px-6 py-3 text-left">Activity</th>
                <th className="px-6 py-3 text-left">Dates</th>
                <th className="px-6 py-3 text-left">Total Price</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Payment</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredActivities.map((activity) => {
                const pendingAmount = activity.TotalAmount - activity.AmountPaid;
                
                return (
                  <tr key={activity.BookingID} className="text-sm border-b border-gray-300 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-sky-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.GuestName}</p>
                          <p className="text-xs text-gray-500">{activity.PhoneNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">Room {activity.RoomNumber}</p>
                        <p className="text-xs text-gray-500">{activity.RoomType}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ActivityBadge type={activity.ActivityType} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className="text-gray-700">In: {activity.CheckInDate}</p>
                        <p className="text-gray-700">Out: {activity.CheckOutDate}</p>
                        {activity.CheckInTime && (
                          <p className="text-green-600 mt-1">✓ Checked in: {activity.CheckInTime}</p>
                        )}
                        {activity.CheckOutTime && (
                          <p className="text-blue-600 mt-1">✓ Checked out: {activity.CheckOutTime}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">RM {activity.TotalAmount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Paid: RM {activity.AmountPaid.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={activity.BookingStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <PaymentBadge status={activity.PaymentStatus} />
                        {activity.PaymentStatus === "Pending" && pendingAmount > 0 && (
                          <p className="text-xs text-amber-600 mt-1 font-medium">
                            Due: RM {pendingAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openBookingDetails(activity)}
                          className="p-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {activity.BookingStatus === "Confirmed" && activity.ActivityType === "Check-In" && (
                          <button
                            onClick={() => handleCompleteCheckIn(activity)}
                            className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition"
                          >
                            Check-In
                          </button>
                        )}
                        
                        {activity.BookingStatus === "CheckedIn" && activity.ActivityType === "Check-Out" && (
                          <button
                            onClick={() => handleCompleteCheckOut(activity)}
                            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition"
                          >
                            Check-Out
                          </button>
                        )}

                        {activity.BookingStatus === "CheckedIn" && activity.ActivityType === "Stayover" && (
                          <span className="px-3 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium">
                            In-House
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction.type === 'checkin' && 'Confirm Check-In'}
              {confirmAction.type === 'checkout' && 'Confirm Check-Out'}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmAction.type === 'checkin' && `Complete check-in for ${confirmAction.booking.GuestName} in Room ${confirmAction.booking.RoomNumber}?`}
              {confirmAction.type === 'checkout' && `Complete check-out for ${confirmAction.booking.GuestName} from Room ${confirmAction.booking.RoomNumber}?`}
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
                  confirmAction.type === 'checkin'
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

// Booking Details Page Component
interface BookingDetailsPageProps {
  booking: Booking;
  goBack: () => void;
  updateBooking: (booking: Booking) => void;
}

function BookingDetailsPage({ booking, goBack, updateBooking }: BookingDetailsPageProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"Cash" | "Card">("Cash");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'checkin' | 'checkout' | 'cancel' | null>(null);

  const pendingAmount = booking.TotalAmount - booking.AmountPaid;

  const handleMakePayment = () => {
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (amount > pendingAmount) {
      alert(`Payment amount cannot exceed pending amount of RM ${pendingAmount.toFixed(2)}`);
      return;
    }

    const newAmountPaid = booking.AmountPaid + amount;
    const newPaymentStatus = newAmountPaid >= booking.TotalAmount ? "Completed" : "Pending";

    const updatedBooking = {
      ...booking,
      AmountPaid: newAmountPaid,
      PaymentStatus: newPaymentStatus as "Completed" | "Pending" | "Failed"
    };

    updateBooking(updatedBooking);
    setShowPaymentForm(false);
    setPaymentAmount("");
  };

  const handleAction = (action: 'checkin' | 'checkout' | 'cancel') => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    if (!confirmAction) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let updatedBooking = { ...booking };

    if (confirmAction === 'checkin') {
      updatedBooking = { ...booking, BookingStatus: 'CheckedIn', CheckInTime: now };
    } else if (confirmAction === 'checkout') {
      updatedBooking = { ...booking, BookingStatus: 'CheckedOut', CheckOutTime: now };
    } else if (confirmAction === 'cancel') {
      updatedBooking = { ...booking, BookingStatus: 'Cancelled' };
    }

    updateBooking(updatedBooking);
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Front Desk</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.BookingID}</h1>
            <p className="text-gray-500 mt-1">{booking.GuestName} • Room {booking.RoomNumber}</p>
          </div>
          <div className="flex gap-3">
            <StatusBadge status={booking.BookingStatus} />
            <ActivityBadge type={booking.ActivityType} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-sky-600" />
              Guest Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{booking.GuestName}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">IC Number</p>
                <p className="font-medium text-gray-900">{booking.ICNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {booking.Email}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {booking.PhoneNumber}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {booking.Address}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bed className="h-5 w-5 text-emerald-600" />
              Booking Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Room Number</p>
                <p className="font-medium text-gray-900">{booking.RoomNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Room Type</p>
                <p className="font-medium text-gray-900">{booking.RoomType}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Check-In Date</p>
                <p className="font-medium text-gray-900">{booking.CheckInDate}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Check-Out Date</p>
                <p className="font-medium text-gray-900">{booking.CheckOutDate}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total Guests</p>
                <p className="font-medium text-gray-900">{booking.TotalGuests} Guest(s)</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Booking Status</p>
                <StatusBadge status={booking.BookingStatus} />
              </div>
              {booking.CheckInTime && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 mb-1">Check-In Time</p>
                  <p className="font-medium text-green-600">{booking.CheckInTime}</p>
                </div>
              )}
              {booking.CheckOutTime && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 mb-1">Check-Out Time</p>
                  <p className="font-medium text-blue-600">{booking.CheckOutTime}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Payment */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Payment Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-gray-900 text-lg">RM {booking.TotalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-green-600">RM {booking.AmountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit Amount</span>
                <span className="font-medium text-gray-700">RM {booking.DepositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-semibold text-gray-900">Pending Amount</span>
                <span className={`font-bold text-lg ${pendingAmount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  RM {pendingAmount.toFixed(2)}
                </span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-gray-600 mb-2">Payment Status</p>
                <PaymentBadge status={booking.PaymentStatus} />
              </div>
            </div>

            {/* Payment Action Button */}
            {booking.PaymentStatus === "Pending" && pendingAmount > 0 && (
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="w-full mt-4 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition flex items-center justify-center gap-2"
              >
                <Banknote size={18} />
                Make Payment
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
                    max={pendingAmount}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max: ${pendingAmount.toFixed(2)}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentType("Cash")}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                        paymentType === "Cash"
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Banknote className="inline h-4 w-4 mr-1" />
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentType("Card")}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                        paymentType === "Card"
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <CreditCard className="inline h-4 w-4 mr-1" />
                      Card
                    </button>
                  </div>
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
                    Process Payment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {booking.BookingStatus === "Confirmed" && (
                <button
                  onClick={() => handleAction('checkin')}
                  className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Complete Check-In
                </button>
              )}

              {booking.BookingStatus === "CheckedIn" && booking.ActivityType === "Check-Out" && (
                <button
                  onClick={() => handleAction('checkout')}
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Complete Check-Out
                </button>
              )}

              {(booking.BookingStatus === "Confirmed" || booking.BookingStatus === "CheckedIn") && (
                <button
                  onClick={() => handleAction('cancel')}
                  className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Cancel Booking
                </button>
              )}

              {booking.BookingStatus === "CheckedIn" && booking.ActivityType === "Stayover" && (
                <div className="px-4 py-3 rounded-lg bg-amber-100 text-amber-700 font-medium text-center">
                  Guest Currently In-House
                </div>
              )}

              {(booking.BookingStatus === "CheckedOut" || booking.BookingStatus === "Cancelled") && (
                <div className="px-4 py-3 rounded-lg bg-gray-100 text-gray-600 font-medium text-center">
                  Booking {booking.BookingStatus}
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
              {confirmAction === 'checkin' && 'Confirm Check-In'}
              {confirmAction === 'checkout' && 'Confirm Check-Out'}
              {confirmAction === 'cancel' && 'Cancel Booking'}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmAction === 'checkin' && `Complete check-in for ${booking.GuestName} in Room ${booking.RoomNumber}?`}
              {confirmAction === 'checkout' && `Complete check-out for ${booking.GuestName} from Room ${booking.RoomNumber}?`}
              {confirmAction === 'cancel' && `Are you sure you want to cancel this booking? This action cannot be undone.`}
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
interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'sky';
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  const bgColors = {
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    sky: 'bg-sky-50'
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bgColors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

interface ActivityBadgeProps {
  type: "Check-In" | "Check-Out" | "Stayover";
}

function ActivityBadge({ type }: ActivityBadgeProps) {
  const styles = {
    'Check-In': 'bg-green-100 text-green-700',
    'Check-Out': 'bg-blue-100 text-blue-700',
    'Stayover': 'bg-amber-100 text-amber-700'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
      {type}
    </span>
  );
}

interface StatusBadgeProps {
  status: "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled" | "Pending";
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    'Confirmed': 'bg-sky-100 text-sky-700',
    'CheckedIn': 'bg-green-100 text-green-700',
    'CheckedOut': 'bg-gray-100 text-gray-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Pending': 'bg-yellow-100 text-yellow-700'
  };

  const labels: Record<string, string> = {
    'CheckedIn': 'Checked In',
    'CheckedOut': 'Checked Out'
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
}

interface PaymentBadgeProps {
  status: "Completed" | "Pending" | "Failed";
}

function PaymentBadge({ status }: PaymentBadgeProps) {
  const styles = {
    'Completed': 'bg-green-100 text-green-700',
    'Pending': 'bg-amber-100 text-amber-700',
    'Failed': 'bg-red-100 text-red-700'
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

