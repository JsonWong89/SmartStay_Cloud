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

  const roomColors: Record<string, string> = {
    Deluxe: "#3b82f6",
    Family: "#f59e0b",
    Standard: "#10b981",
    Suite: "#8b5cf6",
  };

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
              backgroundColor: labels.map((l) => roomColors[l]),
              borderColor: labels.map((l) => roomColors[l]),
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

  // -----------------------------------
  //  EXPORT PDF FUNCTION (non-blurry)
  // -----------------------------------
  const exportPDF = async () => {
    const element = document.getElementById("export-panel");
    if (!element) return;

    // Fix fading / blur
    document.body.classList.add("export-mode");

    const canvas = await html2canvas(element as any, {
      scale: 2, // high DPI
      useCORS: true,
      backgroundColor: "#ffffff",
    } as any);

    document.body.classList.remove("export-mode");

    const imgData = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: false,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save("RoomTypeReport.pdf");
  };

  const totalBookings = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    // ⭐ Only screenshot this panel
    <div id="export-panel" className="report-page">

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

      {/* ===== KPI ===== */}
      <div className="report-kpi-grid">

        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Total Bookings</p>
          <p className="kpi-value">{totalBookings}</p>
        </div>

        {stats.map((s) => (
          <div
            key={s.roomType}
            className={`report-kpi-card ${s.roomType === "Deluxe"
              ? "kpi-deluxe"
              : s.roomType === "Family"
                ? "kpi-family"
                : s.roomType === "Standard"
                  ? "kpi-standard"
                  : "kpi-suite"
              }`}
          >
            <p className="kpi-label">{s.roomType}</p>
            <p className="kpi-value">{s.count}</p>
          </div>
        ))}
      </div>


      {/* ===== CHART ===== */}
      <div className="report-chart-card">
        <h3 className="chart-title">Bookings by Room Type</h3>

        <div className="chart-wrapper">
          <canvas ref={chartRef} height={150}></canvas>
        </div>
      </div>

    </div>
  );
}
