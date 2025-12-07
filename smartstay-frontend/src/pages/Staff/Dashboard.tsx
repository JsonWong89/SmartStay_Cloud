import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  DoorClosed,
  BedDouble,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  UserCheck,
  Home,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { dashboardAPI, bookingsAPI } from "../../services/api";
import { useAuthStore } from "../../store";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "indigo";
  loading?: boolean;
}

interface Activity {
  id: number;
  type: "checkin" | "checkout" | "booking" | "payment";
  guest: string;
  room: string;
  time: string;
  status: "completed" | "pending";
}

interface ActivityItemProps {
  activity: Activity;
}

interface QuickStatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  bgColor: string;
  loading?: boolean;
}

interface DashboardStats {
  checkinsToday: number;
  checkoutsToday: number;
  currentBookings: number;
  pendingPayments: number;
  totalRevenue: number;
  occupancyRate: number;
  availableRooms: number;
  totalRooms: number;
  avgDailyRate: number;
  pendingReservations: number;
}

interface RevenueData {
  day: string;
  revenue: number;
  bookings: number;
}

interface RoomStatusData {
  name: string;
  value: number;
  color: string;
}

interface BookingStatusData {
  name: string;
  value: number;
}

export default function StaffDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    checkinsToday: 0,
    checkoutsToday: 0,
    currentBookings: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    availableRooms: 0,
    totalRooms: 0,
    avgDailyRate: 0,
    pendingReservations: 0,
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [roomStatusData, setRoomStatusData] = useState<RoomStatusData[]>([]);
  const [bookingStatusData, setBookingStatusData] = useState<BookingStatusData[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  
  const user = useAuthStore((state) => state.user);

  const hotelId = user?.role === "Admin" ? undefined : user?.hotelId;

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsRes, revenueRes, roomDistRes, bookingSummaryRes, activitiesRes] = 
        await Promise.all([
          dashboardAPI.getStats(hotelId),
          dashboardAPI.getWeeklyRevenue(hotelId),
          dashboardAPI.getRoomDistribution(hotelId),
          dashboardAPI.getBookingSummary(hotelId),
          bookingsAPI.getTodayActivities(hotelId).catch(() => ({ success: false, data: [] })),
        ]);

      // Update stats
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      // Update revenue data
      if (revenueRes.success) {
        setRevenueData(revenueRes.data);
      }

      // Update room distribution
      if (roomDistRes.success) {
        const roomData = roomDistRes.data.map((item) => ({
          name: item.status,
          value: item.count,
          color:
            item.status === "Occupied"
              ? "#3b82f6"
              : item.status === "Available"
              ? "#10b981"
              : "#f59e0b",
        }));
        setRoomStatusData(roomData);
      }

      // Update booking summary
      if (bookingSummaryRes.success) {
        const bookingData = bookingSummaryRes.data.map((item) => ({
          name: item.status,
          value: item.count,
        }));
        setBookingStatusData(bookingData);
      }

      // Update activities
      if (activitiesRes.success && activitiesRes.data) {
        const activities: Activity[] = activitiesRes.data.slice(0, 5).map((item, index) => ({
          id: item.bookingId,
          type:
            item.activityType === "Check-In"
              ? "checkin"
              : item.activityType === "Check-Out"
              ? "checkout"
              : "booking",
          guest: item.guestName,
          room: item.roomNumber,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          status: item.bookingStatus === "CheckedIn" ? "completed" : "pending",
        }));
        setRecentActivities(activities);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-[230px]"
          } p-6`}
        >
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-sky-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-[230px]"
          } p-6`}
        >
          <div className="flex items-center justify-center h-screen">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-900 mb-2 text-center">
                Error Loading Dashboard
              </h2>
              <p className="text-red-700 text-center mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-[230px]"
        } p-6`}
      >
        {/* Header Section */}
        <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 shadow-sm">
              <LayoutDashboard className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-sm text-gray-500">{formatDate(currentTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 text-gray-600 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm text-gray-700">Refresh</span>
            </button>

            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-gray-300">
              <Clock className="h-5 w-5 text-blue-600" />
              <div className="text-right">
                <p className="text-xs text-gray-500">Current Time</p>
                <p className="text-base font-bold text-gray-900">{formatTime(currentTime)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Key Metrics Cards */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Today's Check-ins"
              value={stats.checkinsToday}
              icon={<DoorOpen className="h-6 w-6" />}
              color="blue"
            />
            <MetricCard
              title="Today's Check-outs"
              value={stats.checkoutsToday}
              icon={<DoorClosed className="h-6 w-6" />}
              color="green"
            />
            <MetricCard
              title="Current Guests"
              value={stats.currentBookings}
              icon={<Users className="h-6 w-6" />}
              color="purple"
            />
            <MetricCard
              title="Occupancy Rate"
              value={`${stats.occupancyRate}%`}
              icon={<Activity className="h-6 w-6" />}
              color="indigo"
            />
          </div>

          {/* Revenue and Room Status Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Overview */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Revenue Overview</h3>
                  <p className="text-sm text-gray-500 mt-1">Last 7 days performance</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    RM {stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No revenue data available
                </div>
              )}
            </div>

            {/* Room Status Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Room Status</h3>
              <p className="text-sm text-gray-500 mb-6">Current distribution</p>
              {roomStatusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={roomStatusData as any}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roomStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {roomStatusData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No room data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Activities and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
                  <p className="text-sm text-gray-500 mt-1">Today's transactions</p>
                </div>
                {/* <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  View All →
                </button> */}
              </div>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No recent activities
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <QuickStatCard
                icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
                title="Avg Daily Rate"
                value={`RM ${stats.avgDailyRate.toFixed(2)}`}
                bgColor="bg-emerald-50"
              />
              <QuickStatCard
                icon={<BedDouble className="h-6 w-6 text-blue-600" />}
                title="Available Rooms"
                value={`${stats.availableRooms} / ${stats.totalRooms}`}
                bgColor="bg-blue-50"
              />
              <QuickStatCard
                icon={<Wallet className="h-6 w-6 text-amber-600" />}
                title="Pending Payments"
                value={stats.pendingPayments}
                bgColor="bg-amber-50"
              />
              <QuickStatCard
                icon={<Calendar className="h-6 w-6 text-purple-600" />}
                title="Pending Reservations"
                value={stats.pendingReservations}
                bgColor="bg-purple-50"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, loading }) => {
  const colorMap = {
    blue: {
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      border: "border-l-blue-600",
    },
    green: {
      iconBg: "bg-green-100",
      iconText: "text-green-600",
      border: "border-l-green-600",
    },
    purple: {
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
      border: "border-l-purple-600",
    },
    indigo: {
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
      border: "border-l-indigo-600",
    },
  };

  const colors = colorMap[color];

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border-l-8 border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-3 w-32"></div>
        <div className="h-10 bg-gray-300 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-shadow border-l-8 ${colors.border}`}>
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${colors.iconBg}`}>
          <div className={colors.iconText}>{icon}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: Activity["type"]): React.ReactNode => {
    switch (type) {
      case "checkin":
        return <DoorOpen className="h-5 w-5 text-green-600" />;
      case "checkout":
        return <DoorClosed className="h-5 w-5 text-blue-600" />;
      case "booking":
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case "payment":
        return <Wallet className="h-5 w-5 text-emerald-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityBg = (type: Activity["type"]): string => {
    switch (type) {
      case "checkin":
        return "bg-green-50";
      case "checkout":
        return "bg-blue-50";
      case "booking":
        return "bg-purple-50";
      case "payment":
        return "bg-emerald-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
      <div className={`p-2 rounded-lg ${getActivityBg(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{activity.guest}</p>
        <p className="text-xs text-gray-500">
          Room {activity.room} • {activity.time}
        </p>
      </div>
      <div>
        {activity.status === "completed" ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Clock className="h-5 w-5 text-amber-600" />
        )}
      </div>
    </div>
  );
};

// Quick Stat Card Component
const QuickStatCard: React.FC<QuickStatCardProps> = ({ icon, title, value, bgColor, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

