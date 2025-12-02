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
    <div className="report-page" ref={pageRef} style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>💰 Revenue Report</h2>
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
          <h4>Total Revenue</h4>
          <p className="big-number">RM {totalRevenue.toFixed(2)}</p>
        </div>

        <div className="kpi-card">
          <h4>Months Recorded</h4>
          <p className="big-number">{monthlyRevenue.length}</p>
        </div>
      </div>

      <div className="report-card">
        <h3>Revenue Trend</h3>
        <canvas ref={chartRef} height={120} />
      </div>
    </div>
  );
}
