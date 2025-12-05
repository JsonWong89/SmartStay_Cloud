import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";
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
  revenue: number;
  bookings: number;
  newBookings: number;
  occupancyRate: number;
  totalRooms: number;
  availableRooms: number;
  totalGuests: number;
  totalStaff: number;
  totalReceptionists: number;
  revenueGrowth: number;
}

export default function ManagerOverview() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<OverviewResponse | null>(null);

  useEffect(() => {
    if (!user?.hotelId) return;

    axios
      .get<OverviewResponse>(
        `https://localhost:7168/api/dashboard/${user.hotelId}/overview`
      )
      .then((res) => setData(res.data))
      .catch((err) => console.error("MANAGER DASHBOARD ERROR:", err));
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
            data: [400, 550, 350, 650, 900, 1100, data?.revenue ?? 0],
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

  if (!data) return <p className="p-6">Loading dashboard...</p>;

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
  value={`RM ${data.revenue.toLocaleString()}`}
  footer={<div className="flex items-center gap-1 text-green-600 text-xs">
    <FiTrendingUp /> +{data.revenueGrowth}% this month
  </div>}
/>

<KpiCard
  className="kpi-blue"
  icon={<FiUsers className="text-blue-600 text-3xl" />}
  title="Occupancy"
  value={`${data.occupancyRate}%`}
  footer={`${data.totalRooms - data.availableRooms} / ${data.totalRooms} rooms`}
/>

<KpiCard
  className="kpi-purple"
  icon={<FiCheckCircle className="text-purple-600 text-3xl" />}
  title="New Bookings"
  value={data.newBookings}
  footer="Today"
/>

<KpiCard
  className="kpi-yellow"
  icon={<FiUserPlus className="text-yellow-600 text-3xl" />}
  title="Total Guests"
  value={data.totalGuests}
  footer="Across all bookings"
/>

<KpiCard
  className="kpi-red"
  icon={<FiUsers className="text-red-600 text-3xl" />}
  title="Staff Count"
  value={data.totalStaff}
  footer={`+ ${data.totalReceptionists} receptionists`}
/>

<KpiCard
  className="kpi-indigo"
  icon={<FiHome className="text-indigo-600 text-3xl" />}
  title="Available Rooms"
  value={data.availableRooms}
  footer={`Total: ${data.totalRooms}`}
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

      <p className="text-center text-gray-400 text-sm mt-6">
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