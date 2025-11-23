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
  Activity
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
  ResponsiveContainer
} from "recharts";


interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  color: 'blue' | 'green' | 'purple' | 'indigo';
}

interface Activity {
  id: number;
  type: 'checkin' | 'checkout' | 'booking' | 'payment';
  guest: string;
  room: string;
  time: string;
  status: 'completed' | 'pending';
}

interface ActivityItemProps {
  activity: Activity;
}

interface QuickStatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  bgColor: string;
}


export default function StaffDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for DB Data
  const [dashboardData, setDashboardData] = useState({
    checkinsToday: 8,
    checkoutsToday: 5,
    currentBookings: 45,
    pendingPayments: 12,
    totalRevenue: 45780.50,
    occupancyRate: 78.5,
    availableRooms: 23,
    totalRooms: 107,
    avgDailyRate: 285.50,
    pendingReservations: 6
  });

  // Revenue Chart Data (Last 7 Days)
  const revenueData = [
    { day: 'Mon', revenue: 4200, bookings: 8 },
    { day: 'Tue', revenue: 5100, bookings: 10 },
    { day: 'Wed', revenue: 3800, bookings: 7 },
    { day: 'Thu', revenue: 6200, bookings: 12 },
    { day: 'Fri', revenue: 7500, bookings: 15 },
    { day: 'Sat', revenue: 8900, bookings: 18 },
    { day: 'Sun', revenue: 10080, bookings: 20 }
  ];

  // Occupancy Trend (Last 30 Days Summary)
  const occupancyTrend = [
    { week: 'Week 1', occupancy: 72 },
    { week: 'Week 2', occupancy: 68 },
    { week: 'Week 3', occupancy: 75 },
    { week: 'Week 4', occupancy: 78.5 }
  ];

  // Room Status Distribution
  const roomStatusData = [
    { name: 'Occupied', value: 84, color: '#3b82f6' },
    { name: 'Available', value: 23, color: '#10b981' },
    { name: 'Maintenance', value: 0, color: '#f59e0b' }
  ];

  // Booking Status Distribution
  const bookingStatusData = [
    { name: 'Confirmed', value: 28 },
    { name: 'Checked In', value: 45 },
    { name: 'Pending', value: 6 },
    { name: 'Completed Today', value: 5 }
  ];

  // Room Type Performance
  const roomTypeData = [
    { type: 'Standard', booked: 35, available: 10, revenue: 15750 },
    { type: 'Deluxe', booked: 28, available: 8, revenue: 18900 },
    { type: 'Suite', booked: 15, available: 3, revenue: 22500 },
    { type: 'Family', booked: 6, available: 2, revenue: 4500 }
  ];

  // Recent Activities
  const recentActivities: Activity[] = [
    { id: 1, type: 'checkin', guest: 'Sarah Lim', room: '305', time: '09:30 AM', status: 'completed' },
    { id: 2, type: 'checkout', guest: 'Ahmad Razak', room: '207', time: '11:15 AM', status: 'completed' },
    { id: 3, type: 'booking', guest: 'David Chen', room: '110', time: '02:45 PM', status: 'pending' },
    { id: 4, type: 'payment', guest: 'Priya Sharma', room: '402', time: '03:20 PM', status: 'completed' },
    { id: 5, type: 'checkin', guest: 'Emily Wong', room: '201', time: '04:10 PM', status: 'completed' }
  ];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-[230px]"} p-6`}>
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

          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-gray-300">
            <Clock className="h-5 w-5 text-blue-600" />
            <div className="text-right">
              <p className="text-xs text-gray-500">Current Time</p>
              <p className="text-base font-bold text-gray-900">{formatTime(currentTime)}</p>
            </div>
          </div>
        </header>

        {/* Key Metrics Cards */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Today's Check-ins"
              value={dashboardData.checkinsToday}
              icon={<DoorOpen className="h-6 w-6" />}
              trend="+12%"
              trendUp={true}
              color="blue"
            />
            <MetricCard
              title="Today's Check-outs"
              value={dashboardData.checkoutsToday}
              icon={<DoorClosed className="h-6 w-6" />}
              trend="-3%"
              trendUp={false}
              color="green"
            />
            <MetricCard
              title="Current Guests"
              value={dashboardData.currentBookings}
              icon={<Users className="h-6 w-6" />}
              trend="+5%"
              trendUp={true}
              color="purple"
            />
            <MetricCard
              title="Occupancy Rate"
              value={`${dashboardData.occupancyRate}%`}
              icon={<Activity className="h-6 w-6" />}
              trend="+2.5%"
              trendUp={true}
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
                <p className="text-2xl font-bold text-blue-600">RM {dashboardData.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
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
          </div>

          {/* Room Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Room Status</h3>
            <p className="text-sm text-gray-500 mb-6">Current distribution</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roomStatusData}
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
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Occupancy Trend and Room Type Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Occupancy Trend */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Occupancy Trend</h3>
            <p className="text-sm text-gray-500 mb-6">Monthly performance</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Room Type Performance */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Room Type Performance</h3>
            <p className="text-sm text-gray-500 mb-6">Booking distribution by room type</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="type" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="booked" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="available" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
              <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <QuickStatCard
              icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
              title="Avg Daily Rate"
              value={`RM ${dashboardData.avgDailyRate}`}
              bgColor="bg-emerald-50"
            />
            <QuickStatCard
              icon={<BedDouble className="h-6 w-6 text-blue-600" />}
              title="Available Rooms"
              value={`${dashboardData.availableRooms} / ${dashboardData.totalRooms}`}
              bgColor="bg-blue-50"
            />
            <QuickStatCard
              icon={<Wallet className="h-6 w-6 text-amber-600" />}
              title="Pending Payments"
              value={dashboardData.pendingPayments}
              bgColor="bg-amber-50"
            />
            <QuickStatCard
              icon={<Calendar className="h-6 w-6 text-purple-600" />}
              title="Pending Reservations"
              value={dashboardData.pendingReservations}
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
const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, trendUp, color }) => {
  const colorClasses: Record<'blue' | 'green' | 'purple' | 'indigo', string> = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    indigo: 'bg-indigo-100'
  };

  const iconColorClasses: Record<'blue' | 'green' | 'purple' | 'indigo', string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600'
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <div className={iconColorClasses[color]}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// Activity Item Component
const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = (type: Activity['type']): React.ReactNode => {
    switch(type) {
      case 'checkin': return <DoorOpen className="h-5 w-5 text-green-600" />;
      case 'checkout': return <DoorClosed className="h-5 w-5 text-blue-600" />;
      case 'booking': return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'payment': return <Wallet className="h-5 w-5 text-emerald-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityBg = (type: Activity['type']): string => {
    switch(type) {
      case 'checkin': return 'bg-green-50';
      case 'checkout': return 'bg-blue-50';
      case 'booking': return 'bg-purple-50';
      case 'payment': return 'bg-emerald-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
      <div className={`p-2 rounded-lg ${getActivityBg(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{activity.guest}</p>
        <p className="text-xs text-gray-500">Room {activity.room} • {activity.time}</p>
      </div>
      <div>
        {activity.status === 'completed' ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Clock className="h-5 w-5 text-amber-600" />
        )}
      </div>
    </div>
  );
}

// Quick Stat Card Component
const QuickStatCard: React.FC<QuickStatCardProps> = ({ icon, title, value, bgColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}