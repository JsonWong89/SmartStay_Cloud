import React from "react";
import { FiDollarSign, FiUsers, FiCheckCircle } from "react-icons/fi";
import { useAuthStore } from "../../store";

export default function ManagerOverview() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="dashboard-view">
      <h2 className="page-title">Dashboard Overview</h2>
      <p className="page-subtitle">
        Managing operations for <strong>{user?.hotelId ?? "Your Hotel"}</strong>
      </p>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue"><FiDollarSign /></div>
          <div>
            <h4>Total Revenue</h4>
            <p className="stat-value">RM 12,450</p>
            <span className="stat-desc">+15% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon occupancy"><FiUsers /></div>
          <div>
            <h4>Occupancy</h4>
            <p className="stat-value">78%</p>
            <span className="stat-desc">24 / 30 Rooms Occupied</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings"><FiCheckCircle /></div>
          <div>
            <h4>New Bookings</h4>
            <p className="stat-value">12</p>
            <span className="stat-desc">Today</span>
          </div>
        </div>
      </section>
    </div>
  );
}
