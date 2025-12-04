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
  FiUserPlus,
  FiBarChart2
} from "react-icons/fi";

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

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
  const [chartLoaded, setChartLoaded] = useState(false);

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
    if (data && !chartLoaded) {
      setChartLoaded(true);
      renderCharts();
    }
  }, [data]);

  function renderCharts() {
    const revenueCtx = document.getElementById("revenueChart") as any;
    const occupancyCtx = document.getElementById("occupancyChart") as any;

    new Chart(revenueCtx, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Revenue (RM)",
            data: [400, 500, 350, 600, 750, 900, data?.revenue ?? 0],
            backgroundColor: "#4ade80"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { display: false } }
      }
    });

    new Chart(occupancyCtx, {
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
      options: { cutout: "65%", responsive: true }
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
          icon={<FiDollarSign className="text-green-600 text-3xl" />}
          title="Total Revenue"
          value={`RM ${data.revenue.toLocaleString()}`}
          footer={
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <FiTrendingUp /> +{data.revenueGrowth}% this month
            </div>
          }
          border="border-green-500"
        />

        <KpiCard
          icon={<FiUsers className="text-blue-600 text-3xl" />}
          title="Occupancy"
          value={`${data.occupancyRate}%`}
          footer={`${data.totalRooms - data.availableRooms} / ${data.totalRooms} rooms`}
          border="border-blue-500"
        />

        <KpiCard
          icon={<FiCheckCircle className="text-purple-600 text-3xl" />}
          title="New Bookings"
          value={data.newBookings}
          footer="Today"
          border="border-purple-500"
        />

        <KpiCard
          icon={<FiUserPlus className="text-yellow-600 text-3xl" />}
          title="Total Guests"
          value={data.totalGuests}
          footer="Across all bookings"
          border="border-yellow-500"
        />

        <KpiCard
          icon={<FiUsers className="text-red-600 text-3xl" />}
          title="Staff Count"
          value={data.totalStaff}
          footer={`+ ${data.totalReceptionists} receptionists`}
          border="border-red-500"
        />

        <KpiCard
          icon={<FiHome className="text-indigo-600 text-3xl" />}
          title="Available Rooms"
          value={data.availableRooms}
          footer={`Total: ${data.totalRooms}`}
          border="border-indigo-500"
        />

      </div>

      {/* CHART GRID */}
      <div className="dashboard-chart-grid">

        <div className="dashboard-chart-card">
          <h3>📊 Revenue Trend</h3>
          <canvas id="revenueChart"></canvas>
        </div>

        <div className="dashboard-chart-card">
          <h3>🏘 Occupancy Breakdown</h3>
          <canvas id="occupancyChart"></canvas>
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
  icon,
  title,
  value,
  footer,
  border
}: {
  icon: React.ReactNode;
  title: string;
  value: any;
  footer: any;
  border: string;
}) {
  return (
    <div className={`dashboard-kpi-card border-l-8 ${border}`}>
      <div className="icon">{icon}</div>
      <div>
        <p className="info-title">{title}</p>
        <p className="info-value">{value}</p>
        <div className="info-desc">{footer}</div>
      </div>
    </div>
  );
}