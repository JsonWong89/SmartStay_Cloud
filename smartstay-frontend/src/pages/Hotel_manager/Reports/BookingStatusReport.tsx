import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";

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
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?.hotelId) return;
    fetchStats();
  }, [user?.hotelId]);

  async function fetchStats() {
    const res = await axios.get<BookingStatusStat[]>(
      `https://localhost:7168/api/reports/${user?.hotelId}/bookings`
    );
    setStats(res.data);

    const labels = res.data.map((x) => x.status);
    const values = res.data.map((x) => x.count);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              label: "Bookings by Status",
              data: values,
            },
          ],
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
    pdf.save("BookingStatusReport.pdf");
  };

  const totalBookings = stats.reduce((sum, s) => sum + s.count, 0);
  const confirmed = stats.find((s) => s.status === "Confirmed")?.count ?? 0;
  const pending = stats.find((s) => s.status === "Pending")?.count ?? 0;
  const cancelled = stats.find((s) => s.status === "Cancelled")?.count ?? 0;

  return (
    <div className="report-page" ref={pageRef} style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>📅 Booking Status Report</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="primary-btn" onClick={exportPDF}>
            📄 Export PDF
          </button>
          <button className="secondary-btn" onClick={() => navigate("/manager/report")}>
            ← Back to Reports
          </button>
        </div>
      </div>

      <div
        className="kpi-row"
        style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}
      >
        <div className="kpi-card">
          <h4>Total Bookings</h4>
          <p className="big-number">{totalBookings}</p>
        </div>
        <div className="kpi-card">
          <h4>Confirmed</h4>
          <p className="big-number">{confirmed}</p>
        </div>
        <div className="kpi-card">
          <h4>Pending</h4>
          <p className="big-number">{pending}</p>
        </div>
        <div className="kpi-card">
          <h4>Cancelled</h4>
          <p className="big-number">{cancelled}</p>
        </div>
      </div>

      <div className="report-card">
        <h3>Status Breakdown</h3>
        <canvas ref={chartRef} height={140} />
      </div>
    </div>
  );
}
