import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ManagerDashboard.css";

Chart.register(...registerables);

interface RevenueResponse {
  totalRevenue: number;
  monthlyRevenue: number[];
}

interface OccupancyResponse {
  occupancyRate: number;
}

interface RoomTypeStat {
  roomType: string;
  count: number;
}

interface BookingStatusStat {
  status: string;
  count: number;
}

interface GenderStat {
  gender: string;
  count: number;
}

export default function ManagerReport() {
  const user = useAuthStore((s) => s.user);

  const [revenue, setRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>([]);
  const [occupancy, setOccupancy] = useState(0);
  const [roomTypeStats, setRoomTypeStats] = useState<RoomTypeStat[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStatusStat[]>([]);
  const [genderStats, setGenderStats] = useState<GenderStat[]>([]);

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.hotelId) {
      fetchRevenue();
      fetchOccupancy();
      fetchRoomTypeStats();
      fetchBookingStats();
      fetchGenderStats();
    }
  }, [user?.hotelId]);

  // ----- API CALLS -----
  //Revenue
  async function fetchRevenue() {
    const res = await axios.get<RevenueResponse>(
      `https://localhost:7168/api/reports/${user?.hotelId}/revenue`
    );
    setRevenue(res.data.totalRevenue);
    setMonthlyRevenue(res.data.monthlyRevenue);
  }

  //Occupancy
  async function fetchOccupancy() {
    const res = await axios.get<OccupancyResponse>(
      `https://localhost:7168/api/reports/${user?.hotelId}/occupancy`
    );
    setOccupancy(res.data.occupancyRate);
  }

  //Room Type Popularity
  async function fetchRoomTypeStats() {
    const res = await axios.get<RoomTypeStat[]>(
      `https://localhost:7168/api/reports/${user?.hotelId}/roomtypes`
    );
    setRoomTypeStats(res.data);
  }

  //Booking Status Breakdown
  async function fetchBookingStats() {
    const res = await axios.get<BookingStatusStat[]>(
      `https://localhost:7168/api/reports/${user?.hotelId}/bookings`
    );
    setBookingStats(res.data);
  }

  //Gender Overview
  async function fetchGenderStats() {
    const res = await axios.get<GenderStat[]>(
      `https://localhost:7168/api/reports/${user?.hotelId}/gender`
    );
    setGenderStats(res.data);
  }

  // ----- PDF EXPORT -----
  const exportPDF = async () => {
    if (!dashboardRef.current) return;

    const canvas = await html2canvas(dashboardRef.current!, {
      scale: 2,
    } as any);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("Hotel_Report.pdf");
  };

  return (
    <div className="report-container">
      <h2>📊 Hotel Performance Dashboard</h2>

      <button className="export-btn" onClick={exportPDF}>
        📄 Export PDF
      </button>

      <div className="dashboard" ref={dashboardRef}>
        {/* 1️⃣ Revenue Overview */}
        <div className="report-card">
          <h3>💰 Total Revenue</h3>
          <p className="big-number">RM {revenue.toFixed(2)}</p>
          <canvas id="revenueChart"></canvas>
        </div>

        {/* 2️⃣ Hotel Occupancy */}
        <div className="report-card">
          <h3>🏨 Occupancy Rate</h3>
          <p className="big-number">{occupancy}%</p>
          <canvas id="occupancyChart"></canvas>
        </div>

        {/* 3️⃣ Room Type Popularity */}
        <div className="report-card">
          <h3>🛏️ Room Type Popularity</h3>
          <canvas id="roomTypeChart"></canvas>
        </div>

        {/* 4️⃣ Booking Status Overview */}
        <div className="report-card">
          <h3>📅 Booking Status Breakdown</h3>
          <canvas id="bookingStatusChart"></canvas>
        </div>

        {/* 5️⃣ Gender Overview */}
        <div className="report-card">
          <h3>🧑 Gender Overview</h3>
          <canvas id="genderChart"></canvas>
        </div>
      </div>
    </div>
  );
}
