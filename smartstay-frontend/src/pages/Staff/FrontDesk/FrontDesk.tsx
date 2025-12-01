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
import { ActivityBadge, StatusBadge, PaymentBadge } from "../../../components/BookingBadges";

interface ConfirmAction {
  type: "checkin" | "checkout" | "cancel";
  booking: Booking;
}

interface FrontDeskPageProps {
  activities: Booking[];
  loading: boolean;
  sidebarCollapsed: boolean;
  openBookingDetails: (booking: Booking) => void;
  updateStatus: (
    id: number,
    status: "CheckedIn" | "CheckedOut" | "Cancelled"
  ) => Promise<void>;
  refresh: () => void;
}

export default function FrontDeskApp() {
  const [activePage, setActivePage] = useState("Front Desk");
  const [currentView, setCurrentView] = useState<"frontdesk" | "bookingdetails">(
    "frontdesk"
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activities, setActivities] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.getTodayActivities(user?.hotelId);
      if (res.success && res.data) {
        const mapped: Booking[] = res.data.map((item: any) => {
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
            Payments: [],
          };
        });

        setActivities(mapped);
      }
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.hotelId]);

  // AUTO CANCEL NO-SHOW AFTER 24 HOURS
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
              console.log(`Auto-cancelled no-show: Booking #${booking.BookingID}`);
            } catch (err) {
              console.error("Auto-cancel failed:", err);
            }
          }
        }
      }
    };

    checkNoShows();
    const interval = setInterval(checkNoShows, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [activities]);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 60000);
    return () => clearInterval(interval);
  }, [loadActivities]);

  const loadBookingDetails = async (id: number) => {
    try {
      const res = await bookingsAPI.getBookingById(id);
      if (res.success && res.data) {
        const b = res.data;
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
          GuestName: b.guest.fullName,
          RoomNumber: b.room.roomNumber,
          RoomType: b.room.roomType,
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
          Email: b.guest.email,
          PhoneNumber: b.guest.phoneNumber,
          ICNumber: b.guest.icNumber || "",
          Address: b.guest.address || "",
          Payments: b.payments || [],
        };

        setSelectedBooking(booking);
        setCurrentView("bookingdetails");
      }
    } catch (err) {
      alert("Failed to load booking details");
    }
  };

  const updateStatus = async (
    id: number,
    status: "CheckedIn" | "CheckedOut" | "Cancelled"
  ) => {
    try {
      const res = await bookingsAPI.updateBookingStatus(id, status);
      if (res.success) {
        loadActivities();
        if (selectedBooking?.BookingID === id) {
          loadBookingDetails(id);
        }
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
            goBack={() => {
              setCurrentView("frontdesk");
              setSelectedBooking(null);
              loadActivities();
            }}
            updateBooking={(updated) => {
              setSelectedBooking(updated);
              loadActivities();
            }}
            updateStatus={updateStatus}
            refreshDetails={() =>
              loadBookingDetails(selectedBooking.BookingID)
            }
          />
        )}
      </div>
    </div>
  );
}

function FrontDeskPage({
  activities,
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

  const todayCheckIns = activities.filter(
    (a) => a.ActivityType === "Check-In"
  ).length;
  const todayCheckOuts = activities.filter(
    (a) => a.ActivityType === "Check-Out"
  ).length;
  const currentlyStaying = activities.filter(
    (a) => a.BookingStatus === "CheckedIn"
  ).length;

  const handleAction = (type: "checkin" | "checkout", booking: Booking) => {
    if (type === "checkin" && booking.PaymentStatus !== "Completed") {
      alert("Payment Required: Full payment must be completed before check-in.");
      return;
    }
    if (type === "checkout" && booking.PaymentStatus !== "Completed") {
      alert(
        "Payment Required: Full payment must be completed before check-out."
      );
      return;
    }
    setConfirmAction({ type, booking });
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const status: "CheckedIn" | "CheckedOut" =
      confirmAction.type === "checkin" ? "CheckedIn" : "CheckedOut";
    await updateStatus(confirmAction.booking.BookingID, status);
    setShowConfirmDialog(false);
    setConfirmAction(null);
    refresh();
  };

  return (
    <main className="p-6">
      <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 shadow-sm">
            <Monitor className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Front Desk Overview
            </h1>
            <p className="text-sm text-gray-500">
              Live update every minute •{" "}
              {new Date().toLocaleDateString("en-MY")}
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm">
            <Calendar size={18} className="text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              readOnly
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

      <div className="mb-4 flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All Activities" },
          { key: "checkin", label: "Check-Ins" },
          { key: "checkout", label: "Check-Outs" },
          { key: "stayover", label: "Stayovers" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterTab === tab.key
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Activity
          </h3>
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    Loading live data...
                  </td>
                </tr>
              ) : filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No activities today
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => {
                  const pendingAmount =
                    activity.TotalAmount - activity.AmountPaid;
                  return (
                    <tr
                      key={activity.BookingID}
                      className="text-sm border-b border-gray-300 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-sky-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-sky-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {activity.GuestName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.PhoneNumber}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            Room {activity.RoomNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.RoomType}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {activity.BookingStatus === "CheckedIn" &&
                        activity.ActivityType !== "Check-Out" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            In-House
                          </span>
                        ) : (
                          <ActivityBadge type={activity.ActivityType} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-green-600" />
                            <span className="text-gray-700">
                              In: {activity.CheckInDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-red-600" />
                            <span className="text-gray-700">
                              Out: {activity.CheckOutDate}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">
                            RM {activity.TotalAmount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Paid: RM {activity.AmountPaid.toFixed(2)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={activity.BookingStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <PaymentBadge status={activity.PaymentStatus} />
                          {activity.PaymentStatus === "Pending" &&
                            pendingAmount > 0 && (
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
                          {activity.BookingStatus === "Confirmed" &&
                            activity.ActivityType === "Check-In" && (
                              <button
                                onClick={() =>
                                  handleAction("checkin", activity)
                                }
                                className={`px-3 py-2 rounded-lg text-white text-xs font-medium transition ${
                                  activity.PaymentStatus === "Completed"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-400 cursor-not-allowed opacity-70"
                                }`}
                                disabled={
                                  activity.PaymentStatus !== "Completed"
                                }
                              >
                                Check-In
                              </button>
                            )}
                          {activity.BookingStatus === "CheckedIn" &&
                            activity.ActivityType === "Check-Out" && (
                              <button
                                onClick={() =>
                                  handleAction("checkout", activity)
                                }
                                className={`px-3 py-2 rounded-lg text-white text-xs font-medium transition ${
                                  activity.PaymentStatus === "Completed"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-400 cursor-not-allowed opacity-70"
                                }`}
                                disabled={
                                  activity.PaymentStatus !== "Completed"
                                }
                              >
                                Check-Out
                              </button>
                            )}
                          {activity.BookingStatus === "CheckedIn" &&
                            activity.ActivityType === "Stayover" && (
                              <span className="px-3 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium">
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
      </div>

      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction.type === "checkin"
                ? "Confirm Check-In"
                : "Confirm Check-Out"}
            </h3>
            <p className="text-gray-600 mb-6">
              Complete{" "}
              {confirmAction.type === "checkin" ? "check-in" : "check-out"} for{" "}
              {confirmAction.booking.GuestName} in Room{" "}
              {confirmAction.booking.RoomNumber}?
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