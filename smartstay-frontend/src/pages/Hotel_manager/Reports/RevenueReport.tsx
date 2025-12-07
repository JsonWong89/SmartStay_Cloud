import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";
import "../../../styles/reports.css";

Chart.register(...registerables);

// TYPES
interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
}

interface RevenueResponse {
  totalRevenue: number;
  monthlyRevenue: MonthlyRevenuePoint[];
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

export default function RevenueReport() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenuePoint[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeStat[]>([]);
  const [bookingStatus, setBookingStatus] = useState<BookingStatusStat[]>([]);
  const [guestGender, setGuestGender] = useState<GenderStat[]>([]);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!user?.hotelId) return;
    fetchRevenue();
    fetchRoomTypes();
    fetchBookingStatus();
    fetchGenderStats();
  }, [user?.hotelId]);

  // ───────────── REVENUE ─────────────
  async function fetchRevenue() {
    const res = await axios.get<RevenueResponse>(
      `https://localhost:7168/api/reports/${user?.hotelId}/revenue`
    );

    setTotalRevenue(res.data.totalRevenue);
    setMonthlyRevenue(res.data.monthlyRevenue);

    const labels = res.data.monthlyRevenue.map((m: MonthlyRevenuePoint) => m.month);
    const values = res.data.monthlyRevenue.map((m: MonthlyRevenuePoint) => m.revenue);

    if (chartInstance.current) chartInstance.current.destroy();

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Monthly Revenue (RM)",
              data: values,
              borderColor: "#2563eb",
              borderWidth: 3,
              tension: 0.3,
            },
          ],
        },
      });
    }
  }

  // ───────────── ROOM TYPES ─────────────
  async function fetchRoomTypes() {
    const res = await axios.get<RoomTypeStat[]>(
      `https://localhost:7168/api/reports/${user?.hotelId}/roomtypes`
    );
    setRoomTypes(res.data);
  }

  // ───────────── BOOKING STATUS ─────────────
  async function fetchBookingStatus() {
    const res = await axios.get<BookingStatusStat[]>(
      `https://localhost:7168/api/reports/${user?.hotelId}/bookings`
    );
    setBookingStatus(res.data);
  }

  // ───────────── GENDER ─────────────
  async function fetchGenderStats() {
    const res = await axios.get<{ guests: GenderStat[] }>(
      `https://localhost:7168/api/reports/${user?.hotelId}/gender`
    );
    setGuestGender(res.data.guests);
  }

  // ───────────── EXPORT PDF ─────────────
  const exportPDF = async () => {
    const element = document.getElementById("export-panel");
    if (!element) return;

    document.body.classList.add("export-mode");

    const canvas = await html2canvas(element, {
      background: "#ffffff",
    });

    document.body.classList.remove("export-mode");

    const img = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(img, "PNG", 0, 0, width, height);
    pdf.save("RevenueReport.pdf");
  };

  return (
    <div id="export-panel" className="report-page fade-in">
      {/* HEADER */}
      <div className="report-header">
        <h2 className="report-title">💰 Revenue Report</h2>

        <div className="report-btn-group">
          <button className="report-btn export" onClick={exportPDF}>📄 Export PDF</button>
          <button className="report-btn back" onClick={() => navigate("/manager/report")}>
            ← Back
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="report-kpi-grid">
        <div className="report-kpi-card kpi-green">
          <p className="kpi-label">Total Revenue</p>
          <p className="kpi-value">RM {totalRevenue.toFixed(2)}</p>
        </div>

        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Months Recorded</p>
          <p className="kpi-value">{monthlyRevenue.length}</p>
        </div>
      </div>

      {/* REVENUE TREND */}
      <div className="report-chart-card">
        <h3 className="chart-title">Revenue Trend</h3>
        <canvas ref={chartRef} height={180}></canvas>
      </div>

      {/* ROOM TYPE POPULARITY */}
      <div className="detail-card">
        <h3>Most Popular Room Types</h3>

        {roomTypes.map((rt) => (
          <div key={rt.roomType} className="stat-row">
            <span>
              <span className="stat-icon">🏨</span>
              {rt.roomType}
            </span>
            <span className="stat-number">{rt.count}</span>
          </div>
        ))}
      </div>


      {/* BOOKING STATUS */}
      <div className="detail-card">
        <h3>Booking Status Overview</h3>

        {bookingStatus.map((b) => (
          <div key={b.status} className="stat-row">
            <span>
              {b.status === "Confirmed" && <span className="status-confirmed">✔</span>}
              {b.status === "Pending" && <span className="status-pending">⏳</span>}
              {b.status === "Cancelled" && <span className="status-cancelled">✖</span>}
              {b.status === "Completed" && <span className="status-confirmed">💼</span>}
              &nbsp; {b.status}
            </span>

            <span className="stat-number">{b.count}</span>
          </div>
        ))}
      </div>


      {/* GENDER */}
      <div className="detail-card">
        <h3>Guest Demographics</h3>

        {guestGender.map((g) => (
          <div key={g.gender} className="stat-row">
            <span>
              {g.gender === "Male" && <span className="gender-male">👨</span>}
              {g.gender === "Female" && <span className="gender-female">👩</span>}
              &nbsp; {g.gender}
            </span>
            <span className="stat-number">{g.count}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
