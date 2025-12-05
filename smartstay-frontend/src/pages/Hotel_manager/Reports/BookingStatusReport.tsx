import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";
import "../../../styles/reports.css";

Chart.register(...registerables);

interface BookingStatusStat {
  status: string;
  count: number;
}

export default function BookingStatusReport() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [stats, setStats] = useState<BookingStatusStat[]>([]);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (user?.hotelId) fetchStats();
  }, [user?.hotelId]);

  async function fetchStats() {
    const res = await axios.get<BookingStatusStat[]>(
      `https://localhost:7168/api/reports/${user?.hotelId}/bookings`
    );

    setStats(res.data);

    const labels = res.data.map((x) => x.status);
    const values = res.data.map((x) => x.count);

    if (chartInstance.current) chartInstance.current.destroy();

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              label: "Bookings by Status",
              data: values,
              backgroundColor: ["#34d399", "#fbbf24", "#f87171"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          plugins: {
            legend: { position: "bottom", labels: { padding: 12 } },
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

    // Fix blur/fade
    document.body.classList.add("export-mode");

    const canvas = await html2canvas(element as any, {
      scale: 2, // high resolution
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
    pdf.save("BookingStatusReport.pdf");
  };

  // KPI Values
  const totalBookings = stats.reduce((sum, s) => sum + s.count, 0);
  const confirmed = stats.find((s) => s.status === "Confirmed")?.count ?? 0;
  const pending = stats.find((s) => s.status === "Pending")?.count ?? 0;
  const cancelled = stats.find((s) => s.status === "Cancelled")?.count ?? 0;

  return (
    // ⭐ Only screenshot this part ↓↓↓
    <div id="export-panel" className="report-page fade-in">

      {/* HEADER */}
      <div className="report-header">
        <h2 className="report-title flex items-center gap-2">
          <span style={{ fontSize: "28px" }}>📅</span>
          Booking Status Report
        </h2>

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

      {/* KPI CARDS */}
      <div className="report-kpi-grid">

        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Total Bookings</p>
          <p className="kpi-value">{totalBookings}</p>
        </div>

        <div className="report-kpi-card kpi-green">
          <p className="kpi-label">Confirmed</p>
          <p className="kpi-value">{confirmed}</p>
        </div>

        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Pending</p>
          <p className="kpi-value">{pending}</p>
        </div>

        <div className="report-kpi-card kpi-green">
          <p className="kpi-label">Cancelled</p>
          <p className="kpi-value">{cancelled}</p>
        </div>

      </div>

      {/* CHART */}
      <div className="report-chart-card">
        <h3 className="chart-title">Booking Status Breakdown</h3>

        <div className="chart-wrapper">
          <canvas ref={chartRef} height={180}></canvas>
        </div>
      </div>

    </div>
  );
}
