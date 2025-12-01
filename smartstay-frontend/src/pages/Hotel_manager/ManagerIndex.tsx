import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store";
import {
  FiGrid, FiBriefcase, FiLogOut, FiHome, FiCalendar, FiBarChart2
} from "react-icons/fi";

import "./ManagerDashboard.css";

export default function ManagerIndex() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <FiHome /> SmartStay
        </div>

        <nav className="nav-links">
          <Link to="/manager/overview" className={`nav-item ${isActive("overview") ? "active" : ""}`}>
            <FiGrid /> Dashboard
          </Link>

          <Link to="/manager/rooms" className={`nav-item ${isActive("rooms") ? "active" : ""}`}>
            <FiHome /> Rooms
          </Link>

          <Link to="/manager/bookings" className={`nav-item ${isActive("bookings") ? "active" : ""}`}>
            <FiCalendar /> Bookings
          </Link>

          <Link to="/manager/staff" className={`nav-item ${isActive("staff") ? "active" : ""}`}>
            <FiBriefcase /> Staff
          </Link>

          <Link to="/manager/report" className={`nav-item ${isActive("report") ? "active" : ""}`}>
            <FiBarChart2 /> Report
          </Link>
        </nav>

        <button onClick={logout} className="logout-btn">
          <FiLogOut /> Logout
        </button>
      </aside>

      {/* Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
