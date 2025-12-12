// src/pages/Hotel_manager/Reports/GenderReport.tsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store";
import { API_BASE_URL } from "../../../config/api";
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
        `${API_BASE_URL}/api/reports/${user?.hotelId}/gender`
      );

      setData(res.data);
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
    return list
      .filter((x) => x.gender.toLowerCase() === gender.toLowerCase())
      .reduce((s, x) => s + x.count, 0);
  }

  function pct(part: number, total: number) {
    if (!total) return "0.0";
    return ((part / total) * 100).toFixed(1);
  }

  function buildCharts(report: GenderReportResponse) {
    if (pieInstance.current) pieInstance.current.destroy();
    if (barInstance.current) barInstance.current.destroy();

    const maleAll =
      sumGender(report.guests, "Male") +
      sumGender(report.staff, "Male") +
      sumGender(report.receptionists, "Male");

    const femaleAll =
      sumGender(report.guests, "Female") +
      sumGender(report.staff, "Female") +
      sumGender(report.receptionists, "Female");

    const totalPie = maleAll + femaleAll;

    // Totals per role (for % tooltips in bar chart)
    const guestsTotal =
      sumGender(report.guests, "Male") +
      sumGender(report.guests, "Female");
    const staffTotal =
      sumGender(report.staff, "Male") + sumGender(report.staff, "Female");
    const recTotal =
      sumGender(report.receptionists, "Male") +
      sumGender(report.receptionists, "Female");
    const roleTotals = [guestsTotal, staffTotal, recTotal];

    // PIE CHART – only Male & Female
    if (pieRef.current) {
      pieInstance.current = new Chart(pieRef.current, {
        type: "pie",
        data: {
          labels: ["Male", "Female"],
          datasets: [
            {
              data: [maleAll, femaleAll],
              backgroundColor: ["#34d399", "#f472b6"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: (ctx: any) => {
                  const label = ctx.label || "";
                  const value = ctx.parsed as number;
                  const pctVal = totalPie
                    ? ((value / totalPie) * 100).toFixed(1)
                    : "0.0";
                  return `${label}: ${value} (${pctVal}%)`;
                },
              },
            },
          },
        },
      });
    }

    // BAR CHART – only Male & Female
    if (barRef.current) {
      barInstance.current = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: ["Guests", "Staff", "Receptionists"],
          datasets: [
            {
              label: "Male",
              backgroundColor: "#34d399",
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
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                label: (ctx: any) => {
                  const genderLabel = ctx.dataset.label || "";
                  const value = ctx.parsed.y as number;
                  const roleIndex = ctx.dataIndex; // 0 = guest, 1 = staff, 2 = rec
                  const roleTotal = roleTotals[roleIndex] || 0;
                  const pctVal = roleTotal
                    ? ((value / roleTotal) * 100).toFixed(1)
                    : "0.0";
                  return `${genderLabel}: ${value} (${pctVal}%)`;
                },
              },
            },
          },
          scales: {
            y: {
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    }
  }

  // -----------------------------------
  //  EXPORT PDF FUNCTION (non-blur, multipage)
  // -----------------------------------
  const exportPdf = async () => {
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
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("GenderReport.pdf");
  };

  // KPI calculations
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

  if (loading || !data)
    return (
      <div className="report-page">
        <h2>🧑 Gender Overview</h2>
        <p>Loading...</p>
      </div>
    );

  return (
    <div id="export-panel" ref={pageRef} className="report-page">

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

     {/* === TOP KPI SECTION (Total / Male / Female) === */}
<div className="gender-kpi-row">
  <div className="gender-kpi-card kpi-total">
    <span className="gender-kpi-icon">👥</span>
    <div>
      <p className="kpi-label">Total People</p>
      <p className="kpi-value">{totalAll}</p>
    </div>
  </div>

  <div className="gender-kpi-card kpi-male">
    <span className="gender-kpi-icon">♂️</span>
    <div>
      <p className="kpi-label">Male</p>
      <p className="kpi-value">{maleAll}</p>
    </div>
  </div>

  <div className="gender-kpi-card kpi-female">
    <span className="gender-kpi-icon">♀️</span>
    <div>
      <p className="kpi-label">Female</p>
      <p className="kpi-value">{femaleAll}</p>
    </div>
  </div>
</div>


{/* === CHARTS SIDE-BY-SIDE === */}
<div className="charts-row">
  <div className="report-chart-card chart-fixed">
    <h3 className="chart-title">Overall Gender Distribution</h3>
    <canvas ref={pieRef} height={140}></canvas>
  </div>

  <div className="report-chart-card chart-fixed">
    <h3 className="chart-title">Gender by Role</h3>
    <canvas ref={barRef} height={140}></canvas>
  </div>
</div>


{/* === DETAILED BREAKDOWN (3 cards horizontal) === */}
<div className="detail-section">
  <h3 className="chart-title">Detailed Breakdown</h3>

  <div className="gender-tables">

    {/* Guests */}
    <div className="detail-card guests">
      <h4>Guests (Total: {gT})</h4>
      <table className="rooms-table">
        <thead>
          <tr><th>Gender</th><th>Count</th></tr>
        </thead>
        <tbody>
          {data.guests.map((g) => (
            <tr key={`g-${g.gender}`}>
              <td className="gender-table-gender">
                <span className="gender-kpi-icon">
                  {g.gender.toLowerCase() === "male" ? "♂️" : "♀️"}
                </span>
                {g.gender}
              </td>
              <td>{g.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Staff */}
    <div className="detail-card staff">
      <h4>Staff (Total: {sT})</h4>
      <table className="rooms-table">
        <thead>
          <tr><th>Gender</th><th>Count</th></tr>
        </thead>
        <tbody>
          {data.staff.map((g) => (
            <tr key={`s-${g.gender}`}>
              <td className="gender-table-gender">
                <span className="gender-kpi-icon">
                  {g.gender.toLowerCase() === "male" ? "♂️" : "♀️"}
                </span>
                {g.gender}
              </td>
              <td>{g.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Receptionists */}
    <div className="detail-card receptionists">
      <h4>Receptionists (Total: {rT})</h4>
      <table className="rooms-table">
        <thead>
          <tr><th>Gender</th><th>Count</th></tr>
        </thead>
        <tbody>
          {data.receptionists.map((g) => (
            <tr key={`r-${g.gender}`}>
              <td className="gender-table-gender">
                <span className="gender-kpi-icon">
                  {g.gender.toLowerCase() === "male" ? "♂️" : "♀️"}
                </span>
                {g.gender}
              </td>
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
