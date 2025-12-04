import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";

Chart.register(...registerables);

interface RoomTypeStat {
  roomType: string;
  count: number;
}

export default function RoomTypeReport() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [stats, setStats] = useState<RoomTypeStat[]>([]);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?.hotelId) return;
    fetchStats();
  }, [user?.hotelId]);

  async function fetchStats() {
    const res = await axios.get<RoomTypeStat[]>(
      `https://localhost:7168/api/reports/${user?.hotelId}/roomtypes`
    );
    setStats(res.data);

    const labels = res.data.map((x) => x.roomType);
    const values = res.data.map((x) => x.count);

    if (chartInstance.current) chartInstance.current.destroy();

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Bookings by Room Type",
              data: values,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    }
  }

  const exportPDF = async () => {
    if (!pageRef.current) return;

    const canvas = await html2canvas(pageRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("RoomTypeReport.pdf");
  };

  const totalBookings = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="report-page" ref={pageRef}>
      {/* ===== HEADER ===== */}
      <div className="report-header">
        <h2 className="report-title">🛏️ Room Type Popularity</h2>

        <div className="report-btn-group">
          <button className="report-btn export" onClick={exportPDF}>
            📄 Export PDF
          </button>

          <button
            className="report-btn back"
            onClick={() => navigate("/manager/report")}
          >
            ← Back to Reports
          </button>
        </div>
      </div>

      {/* ===== KPI SECTION ===== */}
      <div className="report-kpi-grid">
        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Total Bookings</p>
          <p className="kpi-value">{totalBookings}</p>
        </div>

        {stats.map((s, index) => (
          <div
            key={s.roomType}
            className={`report-kpi-card ${
              index % 2 === 0 ? "kpi-green" : "kpi-blue"
            }`}
          >
            <p className="kpi-label">{s.roomType}</p>
            <p className="kpi-value">{s.count}</p>
          </div>
        ))}
      </div>

      {/* ===== CHART CARD ===== */}
      <div className="report-chart-card">
        <h3 className="chart-title">Bookings by Room Type</h3>

        <div className="chart-wrapper">
          <canvas ref={chartRef} height={150}></canvas>
        </div>
      </div>
    </div>
  );
}
