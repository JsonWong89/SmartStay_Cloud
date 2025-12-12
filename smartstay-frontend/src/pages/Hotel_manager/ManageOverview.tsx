import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store";
import { dashboardAPI } from "../../services/api";
import "../../styles/dashboard.css";

import {
  FiDollarSign,
  FiUsers,
  FiHome,
  FiTrendingUp,
  FiCheckCircle,
  FiUserPlus
} from "react-icons/fi";

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

// 🔹 STORE chart instances so they do not duplicate
let revenueChartInstance: Chart | null = null;
let occupancyChartInstance: Chart | null = null;

interface OverviewResponse {
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

export default function ManagerOverview() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user?.hotelId) {
      console.log("No hotelId found in user:", user);
      setError("No hotel ID found for user");
      setLoading(false);
      return;
    }

    console.log("Fetching dashboard stats for hotelId:", user.hotelId);
    setLoading(true);

    // Use the Dashboard API service
    dashboardAPI.getStats(user.hotelId)
      .then((response) => {
        console.log("Dashboard API response:", response);
        
        if (response.success && response.data) {
          console.log("Setting dashboard data:", response.data);
          setData(response.data);
        } else {
          throw new Error("Invalid response format");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("MANAGER DASHBOARD ERROR:", err);
        setError(err.message || "Failed to load dashboard stats");
        setLoading(false);
      });
  }, [user?.hotelId]);

  useEffect(() => {
    if (!data) return;

    setTimeout(() => {
      renderCharts();
    }, 50);
  }, [data]);

  function renderCharts() {
    const revenueCanvas = document.getElementById("revenueChart") as HTMLCanvasElement;
    const occupancyCanvas = document.getElementById("occupancyChart") as HTMLCanvasElement;

    if (!revenueCanvas || !occupancyCanvas) return;

    // 🔄 Destroy old charts before re-creating
    if (revenueChartInstance) revenueChartInstance.destroy();
    if (occupancyChartInstance) occupancyChartInstance.destroy();

    // 📊 Revenue Bar Chart
    revenueChartInstance = new Chart(revenueCanvas, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Revenue (RM)",
            data: [400, 550, 350, 650, 900, 1100,1350],
            backgroundColor: "#4ade80"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { display: false } }
      }
    });

    // 🟡 Occupancy Doughnut Chart
    occupancyChartInstance = new Chart(occupancyCanvas, {
      type: "doughnut",
      data: {
        labels: ["Occupied", "Available"],
        datasets: [
          {
            data: [
              (data?.totalRooms ?? 0) - (data?.availableRooms ?? 0),
              data?.availableRooms ?? 0
            ],
            backgroundColor: ["#6366f1", "#facc15"]
          }
        ]
      },
      options: {
        cutout: "60%",
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  
  if (error) {
    return (
      <div className="p-6">
        <div style={{ padding: '20px', background: '#fee', border: '1px solid #fcc', borderRadius: '8px' }}>
          <h3 style={{ color: '#c00' }}>Error Loading Dashboard</h3>
          <p>{error}</p>
          <p style={{ fontSize: '0.9em', marginTop: '10px' }}>
            Check browser console for details. User hotelId: {user?.hotelId || 'none'}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return <p className="p-6">No data available</p>;

  return (
    <div className="manager-dashboard">

      <div>
        <h2>🏨 Manager Dashboard</h2>
        <p className="text-gray-500">
          Managing hotel <strong>{user?.hotelId}</strong>
        </p>
      </div>

      {/* KPI GRID */}
      <div className="dashboard-kpi-grid">

        <KpiCard
          className="kpi-green"
          icon={<FiDollarSign className="text-green-600 text-3xl" />}
          title="Total Revenue"
          value={`RM ${data.totalRevenue.toLocaleString()}`}
          footer={<div className="flex items-center gap-1 text-green-600 text-xs">
            <FiTrendingUp /> This month
          </div>}
        />

        <KpiCard
          className="kpi-blue"
          icon={<FiUsers className="text-blue-600 text-3xl" />}
          title="Occupancy"
          value={`${data.occupancyRate.toFixed(1)}%`}
          footer={`${data.totalRooms - data.availableRooms} / ${data.totalRooms} rooms`}
        />

        <KpiCard
          className="kpi-purple"
          icon={<FiCheckCircle className="text-purple-600 text-3xl" />}
          title="Check-ins Today"
          value={data.checkinsToday}
          footer={`${data.checkoutsToday} check-outs today`}
        />

        <KpiCard
          className="kpi-yellow"
          icon={<FiUserPlus className="text-yellow-600 text-3xl" />}
          title="Current Bookings"
          value={data.currentBookings}
          footer={`${data.pendingReservations} pending`}
        />

        <KpiCard
          className="kpi-red"
          icon={<FiUsers className="text-red-600 text-3xl" />}
          title="Pending Payments"
          value={data.pendingPayments}
          footer="Awaiting payment"
        />

        <KpiCard
          className="kpi-indigo"
          icon={<FiHome className="text-indigo-600 text-3xl" />}
          title="Available Rooms"
          value={data.availableRooms}
          footer={`Total: ${data.totalRooms} | Avg Rate: RM${data.avgDailyRate.toFixed(2)}`}
        />

      </div>

      {/* CHART GRID */}
      <div className="dashboard-chart-grid">

        <div className="dashboard-chart-card">
          <h3>📊 Revenue Trend</h3>
          <div style={{ width: "100%", height: "260px" }}>
            <canvas id="revenueChart"></canvas>
          </div>
        </div>

        <div className="dashboard-chart-card">
          <h3>🏘 Occupancy Breakdown</h3>
          <div style={{ width: "100%", height: "260px" }}>
            <canvas id="occupancyChart"></canvas>
          </div>
        </div>

      </div>

      <p className="manager-footer-text">
        SmartStay Manager Dashboard © {new Date().getFullYear()}
      </p>

    </div>
  );
}

/* 🔹 Reusable KPI Component */
function KpiCard({
  className,
  icon,
  title,
  value,
  footer
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  value: any;
  footer: any;
}) {
  return (
    <div className={`dashboard-kpi-card ${className}`}>
      <div className="icon">{icon}</div>
      <div>
        <p className="info-title">{title}</p>
        <p className="info-value">{value}</p>
        <div className="info-desc">{footer}</div>
      </div>
    </div>
  );
}