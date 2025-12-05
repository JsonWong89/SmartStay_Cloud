// src/pages/Hotel_manager/Reports/OccupancyReport.tsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";
import "../../../styles/reports.css";

Chart.register(...registerables);

interface OccupancyResponse {
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
}

export default function OccupancyReport() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [occupancyRate, setOccupancyRate] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [occupiedRooms, setOccupiedRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!user?.hotelId) return;
    fetchOccupancy();
  }, [user?.hotelId]);

  async function fetchOccupancy() {
    const res = await axios.get<OccupancyResponse>(
      `https://localhost:7168/api/reports/${user?.hotelId}/occupancy`
    );

    setOccupancyRate(res.data.occupancyRate);
    setTotalRooms(res.data.totalRooms);
    setOccupiedRooms(res.data.occupiedRooms);
    setAvailableRooms(res.data.availableRooms);

    if (chartInstance.current) chartInstance.current.destroy();

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Occupied Rooms", "Available Rooms"],
          datasets: [
            {
              data: [res.data.occupiedRooms, res.data.availableRooms],
              backgroundColor: ["#60a5fa", "#d1fae5"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          plugins: { legend: { position: "bottom" } },
        },
      });
    }
  }

  // -----------------------------------
  //  EXPORT PDF FUNCTION (high quality)
  // -----------------------------------
  const exportPDF = async () => {
    const element = document.getElementById("export-panel");
    if (!element) return;

    document.body.classList.add("export-mode");

    const canvas = await html2canvas(element as any, {
      scale: 2,
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
    pdf.save("OccupancyReport.pdf");
  };

  return (
    <div id="export-panel" className="report-page">
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

      {/* KPI MAIN GRID */}
      <div className="report-kpi-grid">
        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Occupancy Rate</p>
          <p className="kpi-value">{occupancyRate.toFixed(1)}%</p>
        </div>

        <div className="report-kpi-card kpi-green">
          <p className="kpi-label">Available (%)</p>
          <p className="kpi-value">
            {(totalRooms > 0 ? (availableRooms / totalRooms) * 100 : 0).toFixed(
              1
            )}
            %
          </p>
        </div>
      </div>

      {/* DETAILED COUNTS */}
      <div className="report-kpi-grid" style={{ marginTop: "10px" }}>
        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Total Rooms</p>
          <p className="kpi-value">{totalRooms}</p>
        </div>

        <div className="report-kpi-card kpi-green">
          <p className="kpi-label">Occupied Rooms</p>
          <p className="kpi-value">{occupiedRooms}</p>
        </div>

        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Available Rooms</p>
          <p className="kpi-value">{availableRooms}</p>
        </div>
      </div>

      {/* CHART */}
      <div className="report-chart-card">
        <h3 className="chart-title">Occupancy Distribution</h3>

        <div className="chart-wrapper">
          <canvas ref={chartRef} height={160}></canvas>
        </div>
      </div>
    </div>
  );
}
