// Dashboard.tsx
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { LayoutDashboard } from "lucide-react"; // ✅ Reservation icon

export default function Dashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const styles = {
    container: {
      display: "flex",
      backgroundColor: "#f9fafb",
      minHeight: "100vh",
      fontFamily: "Inter, Arial, sans-serif",
    },
    main: {
      flex: 1,
      padding: "24px",
      marginLeft: sidebarCollapsed ? "80px" : "250px",
      transition: "margin-left 0.3s ease",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    title: {
      fontSize: "24px",
      fontWeight: 700,
      // color: "#111827",
      color: "#111827",
      margin: 0,

    },
    titleContainer: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },
    iconBox: {
      backgroundColor: "#e0f2fe", // light blue background
      borderRadius: "12px",
      padding: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "42px",
      height: "42px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    icon: {
      width: "22px",
      height: "22px",
      color: "#0284c7", // blue icon
    },
    searchInput: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      width: "220px",
      outline: "none",
    },
    dashboardContent: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "24px",
    },
    cardsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "20px",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
    },
    cardTitle: {
      color: "#6b7280",
      fontSize: "14px",
      fontWeight: 500,
      marginBottom: "6px",
    },
    cardValue: {
      fontSize: "28px",
      fontWeight: 700,
      color: "#111827",
    },
    chartSection: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      height: "300px",
    },
    recentSection: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
      marginTop: "12px",
    },
    th: {
      textAlign: "left" as const,
      borderBottom: "1px solid #e5e7eb",
      padding: "10px",
      color: "#6b7280",
      fontSize: "13px",
    },
    td: {
      padding: "10px",
      borderBottom: "1px solid #f3f4f6",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <main style={styles.main}>
        <div style={styles.header}>
          {/* <h1 style={styles.title}>Dashboard Overview</h1> */}
          <div style={styles.titleContainer}>
            <div style={styles.iconBox}>
              <LayoutDashboard style={styles.icon} /> 
            </div>
            <h1 style={styles.title}>Dashboard Overview</h1>
          </div>
          <input style={styles.searchInput} placeholder="Search..." />
        </div>

        <div style={styles.dashboardContent}>
          {/* ===== Summary Cards ===== */}
          <div style={styles.cardsRow}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Total Bookings</div>
              <div style={styles.cardValue}>1,245</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Active Guests</div>
              <div style={styles.cardValue}>320</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Revenue (This Month)</div>
              <div style={styles.cardValue}>RM 87,650</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Pending Requests</div>
              <div style={styles.cardValue}>15</div>
            </div>
          </div>

          {/* ===== Chart Section ===== */}
          <div style={styles.chartSection}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
              Booking Statistics
            </h3>
            <p style={{ color: "#9ca3af" }}>Chart placeholder (you can insert chart.js or Recharts here)</p>
          </div>

          {/* ===== Recent Activity Section ===== */}
          <div style={styles.recentSection}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
              Recent Reservations
            </h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Guest</th>
                  <th style={styles.th}>Room</th>
                  <th style={styles.th}>Check-In</th>
                  <th style={styles.th}>Check-Out</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>John Doe</td>
                  <td style={styles.td}>Suite 301</td>
                  <td style={styles.td}>Oct 25</td>
                  <td style={styles.td}>Oct 29</td>
                  <td style={styles.td}>Confirmed</td>
                </tr>
                <tr>
                  <td style={styles.td}>Aisha Karim</td>
                  <td style={styles.td}>Deluxe 207</td>
                  <td style={styles.td}>Oct 26</td>
                  <td style={styles.td}>Nov 1</td>
                  <td style={styles.td}>Pending</td>
                </tr>
                <tr>
                  <td style={styles.td}>Michael Tan</td>
                  <td style={styles.td}>Executive 405</td>
                  <td style={styles.td}>Oct 27</td>
                  <td style={styles.td}>Nov 2</td>
                  <td style={styles.td}>Checked In</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
