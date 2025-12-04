import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";

Chart.register(...registerables);

interface OccupancyResponse {
  occupancyRate: number; // 0–100
}

export default function OccupancyReport() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [occupancyRate, setOccupancyRate] = useState(0);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?.hotelId) return;
    fetchOccupancy();
  }, [user?.hotelId]);

  async function fetchOccupancy() {
    const res = await axios.get<OccupancyResponse>(
      `https://localhost:7168/api/reports/${user?.hotelId}/occupancy`
    );

    setOccupancyRate(res.data.occupancyRate);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Occupied", "Available"],
          datasets: [
            {
              label: "Occupancy Distribution",
              data: [res.data.occupancyRate, 100 - res.data.occupancyRate],
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
    pdf.save("OccupancyReport.pdf");
  };

  return (
    <div className="report-page" ref={pageRef}>
      {/* Header */}
      <div className="report-header">
        <h2 className="report-title">🏨 Occupancy Report</h2>

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

      {/* KPI */}
      <div className="report-kpi-grid">
        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Occupancy Rate</p>
          <p className="kpi-value">{occupancyRate.toFixed(1)}%</p>
        </div>

        <div className="report-kpi-card kpi-green">
          <p className="kpi-label">Available Rooms (%)</p>
          <p className="kpi-value">{(100 - occupancyRate).toFixed(1)}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="report-chart-card">
        <h3 className="chart-title">Occupancy Distribution</h3>

        <div className="chart-wrapper">
          <canvas ref={chartRef} height={150}></canvas>
        </div>
      </div>
    </div>
  );
}
