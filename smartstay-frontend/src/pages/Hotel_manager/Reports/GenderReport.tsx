// src/pages/Hotel_manager/Reports/GenderReport.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuthStore } from "../../../store";

Chart.register(...registerables);

// One gender bucket (Male / Female / Unknown, etc.)
interface GenderBucket {
  gender: string;
  count: number;
}

// Shape returned by your API:
// GET /api/reports/{hotelId}/gender
interface GenderReportResponse {
  guests: GenderBucket[];
  staff: GenderBucket[];
  receptionists: GenderBucket[];
}

export default function GenderReport() {
  const user = useAuthStore((s) => s.user);

  const [data, setData] = useState<GenderReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // container for PDF / print
  const reportRef = useRef<HTMLDivElement | null>(null);

  // chart refs
  const pieCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pieChartInstance = useRef<Chart | null>(null);
  const barChartInstance = useRef<Chart | null>(null);

  // ─────────────────────────────
  // Fetch data
  // ─────────────────────────────
  useEffect(() => {
    if (!user?.hotelId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get<GenderReportResponse>(
          `https://localhost:7168/api/reports/${user.hotelId}/gender`
        );
        setData(res.data);
        buildCharts(res.data);
      } catch (err) {
        console.error("GENDER REPORT ERROR:", err);
      }
      setLoading(false);
    };

    fetchData();

    // cleanup old charts when hotel changes / component unmounts
    return () => {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
    };
  }, [user?.hotelId]);

  // ─────────────────────────────
  // Helpers
  // ─────────────────────────────
  function sumBuckets(buckets: GenderBucket[]): number {
    return buckets.reduce((acc, b) => acc + b.count, 0);
  }

  function sumGender(buckets: GenderBucket[], gender: string): number {
    return buckets
      .filter((b) => b.gender.toLowerCase() === gender.toLowerCase())
      .reduce((acc, b) => acc + b.count, 0);
  }

  function pct(part: number, total: number): string {
    if (!total) return "0.0";
    return ((part / total) * 100).toFixed(1);
  }

  function buildCharts(report: GenderReportResponse) {
    // destroy previous instances
    if (pieChartInstance.current) pieChartInstance.current.destroy();
    if (barChartInstance.current) barChartInstance.current.destroy();

    const guestTotal = sumBuckets(report.guests);
    const staffTotal = sumBuckets(report.staff);
    const recTotal = sumBuckets(report.receptionists);

    // Overall gender counts (all roles)
    const totalAll = guestTotal + staffTotal + recTotal;
    const maleAll =
      sumGender(report.guests, "Male") +
      sumGender(report.staff, "Male") +
      sumGender(report.receptionists, "Male");
    const femaleAll =
      sumGender(report.guests, "Female") +
      sumGender(report.staff, "Female") +
      sumGender(report.receptionists, "Female");
    const otherAll = totalAll - maleAll - femaleAll;

    // PIE CHART – overall gender distribution
    if (pieCanvasRef.current) {
      pieChartInstance.current = new Chart(pieCanvasRef.current, {
        type: "pie",
        data: {
          labels: ["Male", "Female", "Other"],
          datasets: [
            {
              label: "All Roles",
              data: [maleAll, femaleAll, otherAll],
            },
          ],
        },
      });
    }

    // BAR CHART – gender per role
    if (barCanvasRef.current) {
      const roles = ["Guests", "Staff", "Receptionists"];
      const maleByRole = [
        sumGender(report.guests, "Male"),
        sumGender(report.staff, "Male"),
        sumGender(report.receptionists, "Male"),
      ];
      const femaleByRole = [
        sumGender(report.guests, "Female"),
        sumGender(report.staff, "Female"),
        sumGender(report.receptionists, "Female"),
      ];

      barChartInstance.current = new Chart(barCanvasRef.current, {
        type: "bar",
        data: {
          labels: roles,
          datasets: [
            {
              label: "Male",
              data: maleByRole,
            },
            {
              label: "Female",
              data: femaleByRole,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
        },
      });
    }
  }

  // Derived KPI values (safe defaults)
  const guestTotal = data ? sumBuckets(data.guests) : 0;
  const staffTotal = data ? sumBuckets(data.staff) : 0;
  const recTotal = data ? sumBuckets(data.receptionists) : 0;
  const totalAll = guestTotal + staffTotal + recTotal;

  const maleGuests = data ? sumGender(data.guests, "Male") : 0;
  const femaleGuests = data ? sumGender(data.guests, "Female") : 0;

  const maleStaff = data ? sumGender(data.staff, "Male") : 0;
  const femaleStaff = data ? sumGender(data.staff, "Female") : 0;

  const maleRec = data ? sumGender(data.receptionists, "Male") : 0;
  const femaleRec = data ? sumGender(data.receptionists, "Female") : 0;

  const maleAll = maleGuests + maleStaff + maleRec;
  const femaleAll = femaleGuests + femaleStaff + femaleRec;
  const otherAll = totalAll - maleAll - femaleAll;

  // ─────────────────────────────
  // PDF & Print
  // ─────────────────────────────
  const handleExportPdf = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(
      reportRef.current as HTMLElement,
      { scale: 2 } as any // cast to any to avoid TS complaining about 'scale'
    );

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("GenderReport.pdf");
  };

  const handlePrint = () => {
    window.print();
  };

  // ─────────────────────────────
  // Render
  // ─────────────────────────────
  if (loading || !data) {
    return (
      <div className="report-page">
        <h2>🧑 Gender Overview</h2>
        <p>Loading gender statistics...</p>
      </div>
    );
  }

  return (
    <div className="report-page" ref={reportRef}>
      <div className="report-header">
        <h2>🧑 Gender Overview Report</h2>

        <div className="report-actions">
          <button className="export-btn" onClick={handleExportPdf}>
            📄 Export PDF
          </button>
          <button className="export-btn" onClick={handlePrint}>
            🖨 Print
          </button>
          <Link to="/manager/report" className="back-btn">
            ← Back to Reports
          </Link>
        </div>
      </div>

      {/* Overall KPIs */}
      <div className="kpi-container">
        <div className="kpi-card">
          <h4>Total People (All Roles)</h4>
          <p>{totalAll}</p>
        </div>
        <div className="kpi-card">
          <h4>Male</h4>
          <p>
            {maleAll} ({pct(maleAll, totalAll)}%)
          </p>
        </div>
        <div className="kpi-card">
          <h4>Female</h4>
          <p>
            {femaleAll} ({pct(femaleAll, totalAll)}%)
          </p>
        </div>
        <div className="kpi-card">
          <h4>Other / Unknown</h4>
          <p>
            {otherAll} ({pct(otherAll, totalAll)}%)
          </p>
        </div>
      </div>

      {/* Role-specific KPIs */}
      <div className="kpi-container">
        <div className="kpi-card">
          <h4>Guests</h4>
          <p>Total: {guestTotal}</p>
          <p>
            M: {maleGuests} ({pct(maleGuests, guestTotal)}%) / F: {femaleGuests} (
            {pct(femaleGuests, guestTotal)}%)
          </p>
        </div>

        <div className="kpi-card">
          <h4>Staff</h4>
          <p>Total: {staffTotal}</p>
          <p>
            M: {maleStaff} ({pct(maleStaff, staffTotal)}%) / F: {femaleStaff} (
            {pct(femaleStaff, staffTotal)}%)
          </p>
        </div>

        <div className="kpi-card">
          <h4>Receptionists</h4>
          <p>Total: {recTotal}</p>
          <p>
            M: {maleRec} ({pct(maleRec, recTotal)}%) / F: {femaleRec} (
            {pct(femaleRec, recTotal)}%)
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Overall Gender Distribution</h3>
          <canvas ref={pieCanvasRef} height={200}></canvas>
        </div>

        <div className="chart-card">
          <h3>Gender by Role</h3>
          <canvas ref={barCanvasRef} height={200}></canvas>
        </div>
      </div>

      {/* Raw detail tables */}
      <div className="detail-section">
        <h3>Detailed Breakdown</h3>

        <div className="detail-tables">
          <div>
            <h4>Guests</h4>
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

          <div>
            <h4>Staff</h4>
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

          <div>
            <h4>Receptionists</h4>
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
    </div>
  );
}
