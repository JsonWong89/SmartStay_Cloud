import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../../components/Sidebar";
import { useAuthStore } from "../../../store";
import { bookingsAPI } from "../../../services/api";
import {
  Calendar,
  Search,
  DoorOpen,
  DoorClosed,
  Users,
  Eye,
  User,
  Monitor,
} from "lucide-react";
import BookingDetailsPage, { Booking } from "./BookingDetailsPage";
import {
  ActivityBadge,
  StatusBadge,
  PaymentBadge,
} from "../../../components/BookingBadges";

interface ConfirmAction {
  type: "checkin" | "checkout" | "cancel";
  bookings: Booking[];
}

interface FrontDeskPageProps {
  activities: Booking[];
  allBookings: Booking[];
  loading: boolean;
  sidebarCollapsed: boolean;
  openBookingDetails: (booking: Booking) => void;
  updateStatus: (
    ids: number[], 
    status: "CheckedIn" | "CheckedOut" | "Cancelled"
  ) => Promise<void>;
  refresh: () => void;
}

export default function FrontDeskApp() {
  const [activePage, setActivePage] = useState("Front Desk");
  const [currentView, setCurrentView] = useState<
    "frontdesk" | "bookingdetails"
  >("frontdesk");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activities, setActivities] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, allRes] = await Promise.all([
        bookingsAPI.getTodayActivities(user?.hotelId),
        bookingsAPI.getAllBookings({ hotelId: user?.hotelId })
      ]);

      if (todayRes.success && todayRes.data) {
        const mapped: Booking[] = todayRes.data.map((item: any) => {
          const checkInDate = item.checkInDate.split("T")[0];
          const checkOutDate = item.checkOutDate.split("T")[0];

          const activityType: "Check-In" | "Check-Out" | "Stayover" =
            item.activityType === "Check-In"
              ? "Check-In"
              : item.activityType === "Check-Out"
              ? "Check-Out"
              : "Stayover";

          return {
            BookingID: item.bookingId,
            GuestName: item.guestName,
            RoomNumber: item.roomNumber,
            RoomType: item.roomType,
            CheckInDate: checkInDate,
            CheckOutDate: checkOutDate,
            ActivityType: activityType,
            BookingStatus: item.bookingStatus,
            CheckInTime: null,
            CheckOutTime: null,
            TotalAmount: item.totalAmount,
            DepositAmount: 0,
            AmountPaid: item.totalPaid || 0,
            PaymentStatus: item.pendingAmount > 0 ? "Pending" : "Completed",
            TotalGuests: item.totalGuests,
            Email: item.email,
            PhoneNumber: item.phoneNumber,
            ICNumber: "",
            Address: "",
            Gender: item.gender,
            Payments: [],
          };
        });

        setActivities(mapped);
      }

      if (allRes.success && allRes.data) {
        const allMapped: Booking[] = allRes.data.map((b: any) => ({
          BookingID: b.bookingId,
          GuestName: b.guest?.fullName || b.guestName || "",
          RoomNumber: b.room?.roomNumber || b.roomNumber || "",
          RoomType: b.room?.roomType || b.roomType || "",
          CheckInDate: b.checkInDate.split("T")[0],
          CheckOutDate: b.checkOutDate.split("T")[0],
          ActivityType: "Stayover",
          BookingStatus: b.bookingStatus,
          CheckInTime: null,
          CheckOutTime: null,
          TotalAmount: b.totalAmount,
          DepositAmount: b.depositAmount || 0,
          AmountPaid: b.totalPaid || 0,
          PaymentStatus: (b.pendingAmount || b.totalAmount - (b.totalPaid || 0)) > 0 ? "Pending" : "Completed",
          TotalGuests: b.totalGuests,
          Email: b.guest?.email || b.email || "",
          PhoneNumber: b.guest?.phoneNumber || b.phoneNumber || "",
          ICNumber: b.guest?.icNumber || b.icNumber || "-",
          Address: b.guest?.address || b.address || "-",
          Gender: b.guest?.gender || b.gender || "Unknown",
          Payments: b.payments || [],
        }));
        setAllBookings(allMapped);
      }
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.hotelId]);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 60000);
    return () => clearInterval(interval);
  }, [loadActivities]);

  // AUTO CANCEL NO-SHOW AFTER 24 HOURS (unchanged)
  useEffect(() => {
    const checkNoShows = async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      for (const booking of activities) {
        if (
          booking.BookingStatus === "Confirmed" &&
          booking.ActivityType === "Check-In"
        ) {
          const checkInDate = new Date(booking.CheckInDate);
          const checkInDay = new Date(
            checkInDate.getFullYear(),
            checkInDate.getMonth(),
            checkInDate.getDate()
          );
          const diffHours =
            (today.getTime() - checkInDay.getTime()) / (1000 * 60 * 60);

          if (diffHours >= 24) {
            try {
              await bookingsAPI.updateBookingStatus(
                booking.BookingID,
                "Cancelled"
              );
              console.log(
                `Auto-cancelled no-show: Booking #${booking.BookingID}`
              );
            } catch (err) {
              console.error("Auto-cancel failed:", err);
            }
          }
        }
      }
    };

    checkNoShows();
    const interval = setInterval(checkNoShows, 300000);
    return () => clearInterval(interval);
  }, [activities]);

  const loadBookingDetails = async (id: number) => {
    try {
      const [clickedRes, allRes] = await Promise.all([
        bookingsAPI.getBookingById(id),
        bookingsAPI.getAllBookings({ hotelId: user?.hotelId })
      ]);

      if (clickedRes.success && clickedRes.data) {
        const b = clickedRes.data;
        const today = new Date().toISOString().split("T")[0];

        const validStatuses = [
          "Confirmed",
          "CheckedIn",
          "CheckedOut",
          "Cancelled",
          "Pending",
        ] as const;
        const bookingStatus = validStatuses.includes(b.bookingStatus as any)
          ? (b.bookingStatus as
              | "Confirmed"
              | "CheckedIn"
              | "CheckedOut"
              | "Cancelled"
              | "Pending")
          : "Pending";

        const booking: Booking = {
          BookingID: b.bookingId,
          GuestName: b.guest?.fullName  || "",
          RoomNumber: b.room?.roomNumber  || "",
          RoomType: b.room?.roomType || "",
          CheckInDate: b.checkInDate.split("T")[0],
          CheckOutDate: b.checkOutDate.split("T")[0],
          ActivityType:
            b.bookingStatus === "CheckedIn"
              ? b.checkOutDate.split("T")[0] === today
                ? "Check-Out"
                : "Stayover"
              : b.checkInDate.split("T")[0] === today
              ? "Check-In"
              : "Stayover",
          BookingStatus: bookingStatus,
          CheckInTime: null,
          CheckOutTime: null,
          TotalAmount: b.totalAmount,
          DepositAmount: b.depositAmount || 0,
          AmountPaid: b.totalPaid || 0,
          PaymentStatus: b.pendingAmount > 0 ? "Pending" : "Completed",
          TotalGuests: b.totalGuests,
          Email: b.guest?.email || "",
          PhoneNumber: b.guest?.phoneNumber || "",
          ICNumber: b.guest?.icNumber || "-",
          Address: b.guest?.address || "-",
          Gender: b.guest?.gender || "Unknown",
          Payments: b.payments || [],
        };

        if (allRes.success && allRes.data) {
          const allMapped: Booking[] = allRes.data.map((item: any) => ({
            BookingID: item.bookingId,
            GuestName: item.guest?.fullName || item.guestName || "",
            RoomNumber: item.room?.roomNumber || item.roomNumber || "",
            RoomType: item.room?.roomType || item.roomType || "",
            CheckInDate: item.checkInDate.split("T")[0],
            CheckOutDate: item.checkOutDate.split("T")[0],
            ActivityType: "Stayover" as const,
            BookingStatus: item.bookingStatus,
            CheckInTime: null,
            CheckOutTime: null,
            TotalAmount: item.totalAmount,
            DepositAmount: item.depositAmount || 0,
            AmountPaid: item.totalPaid || 0,
            PaymentStatus: (item.pendingAmount || item.totalAmount - (item.totalPaid || 0)) > 0 ? "Pending" as const : "Completed" as const,
            TotalGuests: item.totalGuests,
            Email: item.guest?.email || item.email || "",
            PhoneNumber: item.guest?.phoneNumber || item.phoneNumber || "",
            ICNumber: item.guest?.icNumber || item.icNumber || "-",
            Address: item.guest?.address || item.address || "-",
            Gender: item.guest?.gender || item.gender || "Unknown",
            Payments: item.payments || [],
          }));
          setAllBookings(allMapped);
        }

        setSelectedBooking(booking);
        setCurrentView("bookingdetails");
      }
    } catch (err) {
      alert("Failed to load booking details");
    }
  };

  const updateStatus = async (
    ids: number[],
    status: "CheckedIn" | "CheckedOut" | "Cancelled"
  ) => {
    try {
      for (const id of ids) {
        const res = await bookingsAPI.updateBookingStatus(id, status);
        if (!res.success) throw new Error(`Failed to update booking ${id}`);
      }

      if (status === "CheckedIn") {
        const res = await bookingsAPI.sendCheckIn(ids[0]);
        alert(`Check-In successful for ${ids.length} room(s) and email sent to guest.`);
      }

      if (status === "CheckedOut") {
        await bookingsAPI.sendCheckOut(ids[0]);
        alert(`Check-Out successful for ${ids.length} room(s) and email sent to guest.`);
      }

      loadActivities();
      if (selectedBooking && ids.includes(selectedBooking.BookingID)) {
        loadBookingDetails(selectedBooking.BookingID);
      }
    } catch (err: any) {
      alert("Failed: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-[230px]"
        }`}
      >
        {currentView === "frontdesk" && (
          <FrontDeskPage
            activities={activities}
            allBookings={allBookings}
            loading={loading}
            sidebarCollapsed={sidebarCollapsed}
            openBookingDetails={(booking) =>
              loadBookingDetails(booking.BookingID)
            }
            updateStatus={updateStatus}
            refresh={loadActivities}
          />
        )}
        {currentView === "bookingdetails" && selectedBooking && (
          <BookingDetailsPage
            booking={selectedBooking}
            allBookings={allBookings}
            goBack={() => {
              setCurrentView("frontdesk");
              setSelectedBooking(null);
              loadActivities();
            }}
            updateBooking={(updated) => {
              setSelectedBooking(updated);
              loadActivities();
            }}
            updateStatus={(id, status) => updateStatus([id], status)}
            refreshDetails={() => loadBookingDetails(selectedBooking.BookingID)}
          />
        )}
      </div>
    </div>
  );
}

function FrontDeskPage({
  activities,
  allBookings,
  loading,
  sidebarCollapsed,
  openBookingDetails,
  updateStatus,
  refresh,
}: FrontDeskPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterTab, setFilterTab] = useState("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );

  const groupedActivities = React.useMemo(() => {
    const groups = new Map<string, Booking[]>();
    
    activities.forEach((booking) => {
      if (booking.BookingStatus === "Cancelled") return;
      
      const key = `${booking.Email}-${booking.CheckInDate}-${booking.CheckOutDate}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(booking);
    });
    
    return Array.from(groups.values());
  }, [activities]);

  const filteredGroups = groupedActivities.filter((group) => {
    const main = group[0];
    const matchesSearch =
      main.GuestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.some(b => b.RoomNumber.includes(searchQuery));
    const matchesTab =
      filterTab === "all" ||
      (filterTab === "checkin" && main.ActivityType === "Check-In") ||
      (filterTab === "checkout" && main.ActivityType === "Check-Out") ||
      (filterTab === "stayover" && main.ActivityType === "Stayover");
    return matchesSearch && matchesTab;
  });

  const todayCheckIns = groupedActivities.filter(
    (g) => g[0].ActivityType === "Check-In"
  ).length;
  const todayCheckOuts = groupedActivities.filter(
    (g) => g[0].ActivityType === "Check-Out"
  ).length;
  const currentlyStaying = groupedActivities.filter(
    (g) => g[0].BookingStatus === "CheckedIn"
  ).length;

  const handleAction = (type: "checkin" | "checkout", group: Booking[]) => {
    const main = group[0];
    
    const allRelated = allBookings.filter(
      (b) =>
        b.Email === main.Email &&
        b.CheckInDate === main.CheckInDate &&
        b.CheckOutDate === main.CheckOutDate
    );
    
    const totalAmount = group.reduce((sum, b) => sum + b.TotalAmount, 0);
    const totalPaid = allRelated.reduce((sum, b) => sum + b.AmountPaid, 0);
    const pendingAmount = totalAmount - totalPaid;
    
    if (pendingAmount > 0) {
      alert(
        "Payment Required: Full payment must be completed before " + 
        (type === "checkin" ? "check-in" : "check-out") + "."
      );
      return;
    }
    
    setConfirmAction({ type, bookings: group });
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const status: "CheckedIn" | "CheckedOut" =
      confirmAction.type === "checkin" ? "CheckedIn" : "CheckedOut";
    const ids = confirmAction.bookings.map(b => b.BookingID);
    await updateStatus(ids, status);
    setShowConfirmDialog(false);
    setConfirmAction(null);
    refresh();
  };

  const getGroupFinancials = (group: Booking[]) => {
    const main = group[0];
    const totalAmount = group.reduce((sum, b) => sum + b.TotalAmount, 0);
    
    const allRelated = allBookings.filter(
      (b) =>
        b.Email === main.Email &&
        b.CheckInDate === main.CheckInDate &&
        b.CheckOutDate === main.CheckOutDate
    );
    
    const totalPaid = allRelated.reduce((sum, b) => sum + b.AmountPaid, 0);
    const pending = totalAmount - totalPaid;
    const paymentStatus: "Completed" | "Pending" | "Failed" = 
      pending > 0 ? "Pending" : "Completed";
    
    return { totalAmount, totalPaid, pending, paymentStatus };
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-5 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-100 shadow-sm flex-shrink-0">
              <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Front Desk Overview
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Live update every minute • {new Date().toLocaleDateString("en-MY")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm min-w-[220px]">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                readOnly
                className="focus:outline-none text-sm text-gray-700 w-full"
              />
            </div>

            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm flex-1 min-w-[220px]">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search guest or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:outline-none text-sm text-gray-700 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
        <SummaryCard
          title="Today's Check-Ins"
          value={todayCheckIns}
          icon={<DoorOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
          color="green"
        />
        <SummaryCard
          title="Today's Check-Outs"
          value={todayCheckOuts}
          icon={<DoorClosed className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
          color="blue"
        />
        <SummaryCard
          title="Currently Staying"
          value={currentlyStaying}
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />}
          color="sky"
        />
      </section>

      {/* Filter Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { key: "all", label: "All Activities" },
          { key: "checkin", label: "Check-Ins" },
          { key: "checkout", label: "Check-Outs" },
          { key: "stayover", label: "Stayovers" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              filterTab === tab.key
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table / Card Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 pt-5 pb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Activity
          </h3>
        </div>

        {/* Desktop/Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-600 bg-gray-50">
                <th className="px-4 sm:px-6 py-3 text-left">Guest</th>
                <th className="px-4 sm:px-6 py-3 text-left">Room(s)</th>
                <th className="px-4 sm:px-6 py-3 text-left">Activity</th>
                <th className="px-4 sm:px-6 py-3 text-left">Dates</th>
                <th className="px-4 sm:px-6 py-3 text-left">Total Price</th>
                <th className="px-4 sm:px-6 py-3 text-left">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left">Payment</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    Loading live data...
                  </td>
                </tr>
              ) : filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No activities today
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const main = group[0];
                  const roomCount = group.length;
                  const roomList = group.map(b => b.RoomNumber).join(" + ");
                  const { totalAmount, totalPaid, pending, paymentStatus } = getGroupFinancials(group);
                  
                  return (
                    <tr
                      key={group.map(b => b.BookingID).join("-")}
                      className="text-sm border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {main.GuestName}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {main.PhoneNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            Room {roomList}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {roomCount} room{roomCount > 1 ? "s" : ""}
                            {roomCount > 1 && " • Multi-room"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4">
                        {main.BookingStatus === "CheckedIn" &&
                        main.ActivityType !== "Check-Out" ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            In-House
                          </span>
                        ) : (
                          <ActivityBadge type={main.ActivityType} />
                        )}
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-green-600" />
                            <span>In: {main.CheckInDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-red-600" />
                            <span>Out: {main.CheckOutDate}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">
                            RM {totalAmount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Paid: RM {totalPaid.toFixed(2)}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4">
                        <StatusBadge status={main.BookingStatus} />
                      </td>

                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <PaymentBadge status={paymentStatus} />
                          {paymentStatus === "Pending" && pending > 0 && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                              Due: RM {pending.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex gap-2 justify-end flex-wrap">
                          <button
                            onClick={() => openBookingDetails(main)}
                            className="p-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {main.BookingStatus === "Confirmed" &&
                            main.ActivityType === "Check-In" && (
                              <button
                                onClick={() => handleAction("checkin", group)}
                                className={`px-3 py-1.5 sm:py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition ${
                                  paymentStatus === "Completed"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-400 cursor-not-allowed opacity-70"
                                }`}
                                disabled={paymentStatus !== "Completed"}
                              >
                                Check-In
                              </button>
                            )}

                          {main.BookingStatus === "CheckedIn" &&
                            main.ActivityType === "Check-Out" && (
                              <button
                                onClick={() => handleAction("checkout", group)}
                                className={`px-3 py-1.5 sm:py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition ${
                                  paymentStatus === "Completed"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-400 cursor-not-allowed opacity-70"
                                }`}
                                disabled={paymentStatus !== "Completed"}
                              >
                                Check-Out
                              </button>
                            )}

                          {main.BookingStatus === "CheckedIn" &&
                            main.ActivityType === "Stayover" && (
                              <span className="px-3 py-1.5 sm:py-2 rounded-lg bg-amber-100 text-amber-700 text-xs sm:text-sm font-medium">
                                In-House
                              </span>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading live data...
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No activities today
            </div>
          ) : (
            filteredGroups.map((group) => {
              const main = group[0];
              const roomCount = group.length;
              const roomList = group.map(b => b.RoomNumber).join(" + ");
              const { totalAmount, totalPaid, pending, paymentStatus } = getGroupFinancials(group);

              return (
                <div
                  key={group.map(b => b.BookingID).join("-")}
                  className="p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {main.GuestName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {main.PhoneNumber}
                      </p>
                    </div>
                    <StatusBadge status={main.BookingStatus} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500 text-xs">Room(s)</p>
                      <p className="font-medium">Room {roomList}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {roomCount} room{roomCount > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs">Activity</p>
                      {main.BookingStatus === "CheckedIn" &&
                      main.ActivityType !== "Check-Out" ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs bg-amber-100 text-amber-700 mt-0.5">
                          In-House
                        </span>
                      ) : (
                        <ActivityBadge type={main.ActivityType} />
                      )}
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs">Dates</p>
                      <p className="font-medium">
                        {main.CheckInDate} → {main.CheckOutDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs">Total Price</p>
                      <p className="font-bold">RM {totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Paid: RM {totalPaid.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                    <div className="w-full sm:w-auto">
                      <PaymentBadge status={paymentStatus} />
                      {paymentStatus === "Pending" && pending > 0 && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          Due: RM {pending.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => openBookingDetails(main)}
                        className="p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition"
                      >
                        <Eye size={18} />
                      </button>

                      {main.BookingStatus === "Confirmed" &&
                        main.ActivityType === "Check-In" && (
                          <button
                            onClick={() => handleAction("checkin", group)}
                            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition ${
                              paymentStatus === "Completed"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed opacity-70"
                            }`}
                            disabled={paymentStatus !== "Completed"}
                          >
                            Check-In
                          </button>
                        )}

                      {main.BookingStatus === "CheckedIn" &&
                        main.ActivityType === "Check-Out" && (
                          <button
                            onClick={() => handleAction("checkout", group)}
                            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition ${
                              paymentStatus === "Completed"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-400 cursor-not-allowed opacity-70"
                            }`}
                            disabled={paymentStatus !== "Completed"}
                          >
                            Check-Out
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction.type === "checkin"
                ? "Confirm Check-In"
                : "Confirm Check-Out"}
            </h3>
            <p className="text-gray-600 mb-6">
              Complete{" "}
              {confirmAction.type === "checkin" ? "check-in" : "check-out"} for{" "}
              {confirmAction.bookings[0].GuestName} in {confirmAction.bookings.length} room(s)?
              {confirmAction.bookings.length > 1 && (
                <span className="block mt-2 text-sm font-medium text-purple-600">
                  Rooms: {confirmAction.bookings.map(b => b.RoomNumber).join(", ")}
                </span>
              )}
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
                  confirmAction.type === "checkin"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
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

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "green" | "blue" | "sky";
}) {
  const bgColors = {
    green: "bg-green-50",
    blue: "bg-blue-50",
    sky: "bg-sky-50",
  };
  const borderColors = {
    green: "border-l-green-600",
    blue: "border-l-blue-600",
    sky: "border-l-sky-600",
  };

  return (
    <div
      className={`rounded-xl bg-white p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4 border-l-8 ${borderColors[color]}`}
    >
      <div className={`p-2.5 sm:p-3 rounded-lg ${bgColors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs sm:text-sm text-gray-500">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}