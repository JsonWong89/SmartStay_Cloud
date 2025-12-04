import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";

Chart.register(...registerables);

interface MonthlyRevenuePoint {
  month: string;   // e.g. "2025-11"
  revenue: number; // e.g. 500
}

interface RevenueResponse {
  totalRevenue: number;
  monthlyRevenue: MonthlyRevenuePoint[];
}

export default function RevenueReport() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenuePoint[]>([]);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?.hotelId) return;
    fetchRevenue();
  }, [user?.hotelId]);

  async function fetchRevenue() {
    const res = await axios.get<RevenueResponse>(
      `https://localhost:7168/api/reports/${user?.hotelId}/revenue`
    );

    setTotalRevenue(res.data.totalRevenue);
    setMonthlyRevenue(res.data.monthlyRevenue);

    const labels = res.data.monthlyRevenue.map((m) => m.month);
    const values = res.data.monthlyRevenue.map((m) => m.revenue);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Monthly Revenue (RM)",
              data: values,
              borderWidth: 3,
              tension: 0.3,
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
    pdf.save("RevenueReport.pdf");
  };

  return (
  <div ref={pageRef} className="report-page fade-in">

    {/* HEADER */}
    <div className="report-header">
      <h2 className="report-title flex items-center gap-2">
        <span style={{ fontSize: "28px" }}>💰</span>
        Revenue Report
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

      <div className="report-kpi-card kpi-green">
        <p className="kpi-label">Total Revenue</p>
        <p className="kpi-value">RM {totalRevenue.toFixed(2)}</p>
      </div>

      <div className="report-kpi-card kpi-blue">
        <p className="kpi-label">Months Recorded</p>
        <p className="kpi-value">{monthlyRevenue.length}</p>
      </div>
    </div>

    {/* CHART */}
    <div className="report-chart-card">
      <h3 className="chart-title">Revenue Trend</h3>

      <div className="chart-wrapper canvas">
        <canvas ref={chartRef} height={180}></canvas>
      </div>
    </div>

  </div>
);
}