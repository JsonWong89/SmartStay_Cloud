import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";  // ⭐ import plugin
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";
import { API_BASE_URL } from "../../../config/api";
import "../../../styles/reports.css";

Chart.register(...registerables, ChartDataLabels); // ⭐ register plugin

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
      `${API_BASE_URL}/api/reports/${user?.hotelId}/bookings`
    );

    setStats(res.data);

    const labels = res.data.map((x) => x.status);
    const values = res.data.map((x) => x.count);

    const colors: string[] = [
      "#ef4444", // Cancelled (red)
      "#facc15", // Completed (yellow)
      "#10b981", // Confirmed (green)
      "#8b5cf6", // Pending (purple)
    ];

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
              backgroundColor: colors,
              borderColor: "#ffffff",
              borderWidth: 3,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              position: "bottom",
              labels: { padding: 12 },
            },
            datalabels: {
              color: "#ffffff",
              font: {
                weight: "bold",
                size: 14,
              },
              formatter: (value: number) => value, // ⭐ show number inside slice
            },
          },
        },
      });
    }
  }

  // EXPORT PDF
  const exportPDF = async () => {
    const element = document.getElementById("export-panel");
    if (!element) return;

    document.body.classList.add("export-mode");

    const canvas = await html2canvas(element as any, {
      scale: 2,
      useCORS: true,
      background: "#ffffff",
    } as any);

    document.body.classList.remove("export-mode");

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");

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
  const completed = stats.find((s) => s.status === "Completed")?.count ?? 0;

  return (
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
          <button className="report-btn back" onClick={() => navigate("/manager/report")}>
            ← Back
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

        <div className="report-kpi-card kpi-yellow">
          <p className="kpi-label">Completed</p>
          <p className="kpi-value">{completed}</p>
        </div>

        <div className="report-kpi-card kpi-purple">
          <p className="kpi-label">Pending</p>
          <p className="kpi-value">{pending}</p>
        </div>

        <div className="report-kpi-card kpi-red">
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
