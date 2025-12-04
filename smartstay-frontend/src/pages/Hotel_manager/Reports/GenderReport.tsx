// src/pages/Hotel_manager/Reports/GenderReport.tsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store";
import "../../../styles/reports.css";

Chart.register(...registerables);

interface GenderBucket {
  gender: string;
  count: number;
}

interface GenderReportResponse {
  guests: GenderBucket[];
  staff: GenderBucket[];
  receptionists: GenderBucket[];
}

export default function GenderReport() {
  const user = useAuthStore((s) => s.user);

  const [data, setData] = useState<GenderReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const pageRef = useRef<HTMLDivElement | null>(null);

  const pieRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);
  const pieInstance = useRef<Chart | null>(null);
  const barInstance = useRef<Chart | null>(null);



  useEffect(() => {
    if (!user?.hotelId) return;
    fetchData();
  }, [user?.hotelId]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await axios.get<GenderReportResponse>(
        `https://localhost:7168/api/reports/${user?.hotelId}/gender`
      );
      setData(res.data);

      // Delay chart creation until layout is ready
      requestAnimationFrame(() => buildCharts(res.data));
    } catch (err) {
      console.error("GENDER REPORT ERROR:", err);
    }
    setLoading(false);
  }

  function sumBuckets(list: GenderBucket[]) {
    return list.reduce((s, x) => s + x.count, 0);
  }

  function sumGender(list: GenderBucket[], gender: string) {
    return (
      list
        .filter((x) => x.gender.toLowerCase() === gender.toLowerCase())
        .reduce((s, x) => s + x.count, 0)
    );
  }

  function pct(part: number, total: number) {
    if (!total) return "0.0";
    return ((part / total) * 100).toFixed(1);
  }

  function buildCharts(report: GenderReportResponse) {
    if (pieInstance.current) pieInstance.current.destroy();
    if (barInstance.current) barInstance.current.destroy();

    const guestT = sumBuckets(report.guests);
    const staffT = sumBuckets(report.staff);
    const recT = sumBuckets(report.receptionists);

    const maleAll =
      sumGender(report.guests, "Male") +
      sumGender(report.staff, "Male") +
      sumGender(report.receptionists, "Male");

    const femaleAll =
      sumGender(report.guests, "Female") +
      sumGender(report.staff, "Female") +
      sumGender(report.receptionists, "Female");

    const totalAll = guestT + staffT + recT;
    const otherAll = totalAll - maleAll - femaleAll;

    // PIE CHART
    if (pieRef.current) {
      pieInstance.current = new Chart(pieRef.current, {
        type: "pie",
        data: {
          labels: ["Male", "Female", "Other"],
          datasets: [
            {
              data: [maleAll, femaleAll, otherAll],
              backgroundColor: ["#60a5fa", "#f472b6", "#a3a3a3"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          plugins: { legend: { position: "bottom" } },
        },
      });
    }

    // BAR CHART
    if (barRef.current) {
      barInstance.current = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: ["Guests", "Staff", "Receptionists"],
          datasets: [
            {
              label: "Male",
              backgroundColor: "#60a5fa",
              data: [
                sumGender(report.guests, "Male"),
                sumGender(report.staff, "Male"),
                sumGender(report.receptionists, "Male"),
              ],
            },
            {
              label: "Female",
              backgroundColor: "#f472b6",
              data: [
                sumGender(report.guests, "Female"),
                sumGender(report.staff, "Female"),
                sumGender(report.receptionists, "Female"),
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "top" } },
        },
      });
    }
  }

  // KPI CALCULATIONS
  const gT = data ? sumBuckets(data.guests) : 0;
  const sT = data ? sumBuckets(data.staff) : 0;
  const rT = data ? sumBuckets(data.receptionists) : 0;
  const totalAll = gT + sT + rT;

  const maleGuests = data ? sumGender(data.guests, "Male") : 0;
  const femaleGuests = data ? sumGender(data.guests, "Female") : 0;

  const maleStaff = data ? sumGender(data.staff, "Male") : 0;
  const femaleStaff = data ? sumGender(data.staff, "Female") : 0;

  const maleRec = data ? sumGender(data.receptionists, "Male") : 0;
  const femaleRec = data ? sumGender(data.receptionists, "Female") : 0;

  const maleAll = maleGuests + maleStaff + maleRec;
  const femaleAll = femaleGuests + femaleStaff + femaleRec;
  const otherAll = totalAll - maleAll - femaleAll;

  const exportPdf = async () => {
    if (!pageRef.current) return;

    const element = pageRef.current;

    // Increase quality by rendering at higher resolution
    const canvas = await html2canvas(element, {
      scale: 3,              // ← MOST IMPORTANT (High DPI)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
    } as any);

    // Convert to image
    const imgData = canvas.toDataURL("image/png", 1.0);

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add the first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // If content is longer than 1 page, add more pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("Report.pdf");
  };





  if (loading || !data)
    return (
      <div className="report-page">
        <h2>🧑 Gender Overview</h2>
        <p>Loading...</p>
      </div>
    );

  return (
    <div ref={pageRef} className="report-page">

      {/* HEADER */}
      <div className="report-header">
        <h2 className="report-title flex items-center gap-2">
          <span style={{ fontSize: "28px" }}>🧑</span>
          Gender Overview Report
        </h2>

        <div className="report-btn-group">
          <button className="report-btn export" onClick={exportPdf}>
            📄 Export PDF
          </button>
          <Link className="report-btn back" to="/manager/report">
            ← Back to Reports
          </Link>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="report-kpi-grid">
        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Total People</p>
          <p className="kpi-value">{totalAll}</p>
        </div>

        <div className="report-kpi-card kpi-green">
          <p className="kpi-label">Male</p>
          <p className="kpi-value">
            {maleAll} ({pct(maleAll, totalAll)}%)
          </p>
        </div>

        <div className="report-kpi-card kpi-blue">
          <p className="kpi-label">Female</p>
          <p className="kpi-value">
            {femaleAll} ({pct(femaleAll, totalAll)}%)
          </p>
        </div>

        <div className="report-kpi-card kpi-green">
          <p className="kpi-label">Other / Unknown</p>
          <p className="kpi-value">
            {otherAll} ({pct(otherAll, totalAll)}%)
          </p>
        </div>
      </div>

      {/* DETAIL TABLES (MOVE ABOVE CHARTS) */}
      <div className="detail-section">
        <h3 className="chart-title">Detailed Breakdown</h3>

        <div className="detail-tables">

          <div className="detail-card guests">
            <h4>Guests (Total: {gT} )</h4>
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Gender</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.guests.map((g) => (
                  <tr key={`g-${g.gender}`}>
                    <td>{g.gender}</td>
                    <td>{g.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="detail-card staff">
            <h4>Staff (Total: {sT} )</h4>
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Gender</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.staff.map((g) => (
                  <tr key={`s-${g.gender}`}>
                    <td>{g.gender}</td>
                    <td>{g.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="detail-card receptionists">
            <h4>Receptionists (Total: {rT} )</h4>
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Gender</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.receptionists.map((g) => (
                  <tr key={`r-${g.gender}`}>
                    <td>{g.gender}</td>
                    <td>{g.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* SMALLER CHARTS BELOW DETAIL LISTS */}
      <div className="charts-row" style={{ marginTop: "20px" }}>
        <div className="report-chart-card" style={{ maxWidth: "420px" }}>
          <h3 className="chart-title">Overall Gender Distribution</h3>
          <canvas ref={pieRef} height={140}></canvas>
        </div>

        <div className="report-chart-card" style={{ maxWidth: "420px" }}>
          <h3 className="chart-title">Gender by Role</h3>
          <canvas ref={barRef} height={140}></canvas>
        </div>
      </div>

    </div>
  );
}
