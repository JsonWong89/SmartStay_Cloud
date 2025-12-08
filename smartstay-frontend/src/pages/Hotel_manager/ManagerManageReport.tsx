import React from "react";
import { Link } from "react-router-dom";
import "../../styles/reports.css";

export default function ManagerReportMenu() {
  const reports = [
    {
      title: "Revenue Report",
      icon: "💰",
      link: "/manager/report/revenue",
      color: "#4CAF50",
    },
    {
      title: "Occupancy Rate",
      icon: "🏨",
      link: "/manager/report/occupancy",
      color: "#2196F3",
    },
    {
      title: "Room Type Popularity",
      icon: "🛏️",
      link: "/manager/report/roomtypes",
      color: "#9C27B0",
    },
    {
      title: "Booking Status Breakdown",
      icon: "📅",
      link: "/manager/report/bookings",
      color: "#FF9800",
    },
    {
      title: "Gender Overview",
      icon: "🧑",
      link: "/manager/report/gender",
      color: "#E91E63",
    },
  ];

  return (
    <div className="report-menu-container fade-in">
      <h2 className="menu-title">📊 Hotel Performance Reports</h2>

      <div className="report-grid">
        {reports.map((r) => (
          <Link
            to={r.link}
            key={r.title}
            className="report-card"
            style={{ borderLeft: `7px solid ${r.color}` }}
          >
            <div className="report-icon" style={{ color: r.color }}>
              {r.icon}
            </div>

            <h3 className="report-title">{r.title}</h3>
            <p className="report-desc">View detailed insights →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
