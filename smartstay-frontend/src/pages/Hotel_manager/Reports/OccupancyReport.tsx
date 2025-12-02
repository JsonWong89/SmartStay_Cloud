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
          labels: ["Occupied (%)", "Available (%)"],
          datasets: [
            {
              label: "Occupancy",
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
    <div className="report-page" ref={pageRef} style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>🏨 Occupancy Report</h2>
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
          <h4>Occupancy Rate</h4>
          <p className="big-number">{occupancyRate.toFixed(1)}%</p>
        </div>
        <div className="kpi-card">
          <h4>Available Rooms</h4>
          <p className="big-number">
            {/* we only know percentage now */}
            {(100 - occupancyRate).toFixed(1)}% of rooms
          </p>
        </div>
      </div>

      <div className="report-card">
        <h3>Occupancy Distribution</h3>
        <canvas ref={chartRef} height={140} />
      </div>
    </div>
  );
}
