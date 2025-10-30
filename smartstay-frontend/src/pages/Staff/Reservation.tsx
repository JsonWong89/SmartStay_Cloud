import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { CalendarDays } from "lucide-react"; // ✅ Reservation icon

export default function Reservation() {
  const [activePage, setActivePage] = useState("Reservation");
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
      height: "26px",
      color: "#0284c7",
    },
    title: {
      fontSize: "24px",
      fontWeight: 700,
    //   color: "#111827",
      color: "#111827",
      margin: 0,
    },
    addButton: {
      backgroundColor: "#0284c7",
      color: "#fff",
      border: "none",
      padding: "10px 16px",
      borderRadius: "8px",
      fontWeight: 500,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    filterBar: {
      display: "flex",
      flexWrap: "wrap" as const,
      alignItems: "center",
      gap: "10px",
      marginBottom: "16px",
    },
    select: {
      padding: "8px 10px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      backgroundColor: "#fff",
      fontSize: "14px",
    },
    searchBox: {
      marginLeft: "auto",
      position: "relative" as const,
    },
    searchInput: {
      padding: "8px 32px 8px 12px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      outline: "none",
      width: "200px",
    },
    exportButtons: {
      display: "flex",
      gap: "8px",
      marginLeft: "12px",
    },
    exportBtn: {
      backgroundColor: "#fff",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: "14px",
    },
    tableContainer: {
      backgroundColor: "#fff",
      borderRadius: "16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      overflow: "hidden",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
      fontSize: "14px",
    },
    th: {
      textAlign: "left" as const,
      borderBottom: "1px solid #e5e7eb",
      padding: "10px",
      color: "#6b7280",
      backgroundColor: "#f9fafb",
      fontWeight: 600,
    },
    td: {
      padding: "10px",
      borderBottom: "1px solid #f3f4f6",
      color: "#111827",
    },
    status: (type: string) => ({
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: 500,
      color:
        type === "Paid"
          ? "#065f46"
          : type === "Online"
          ? "#1d4ed8"
          : "#92400e",
      backgroundColor:
        type === "Paid"
          ? "#d1fae5"
          : type === "Online"
          ? "#dbeafe"
          : "#fef3c7",
    }),
    pagination: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "16px",
    },
    pageBtn: {
      border: "1px solid #d1d5db",
      padding: "6px 12px",
      borderRadius: "8px",
      backgroundColor: "#fff",
      cursor: "pointer",
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
        {/* ===== Header ===== */}
        <div style={styles.header}>
          <div style={styles.titleContainer}>
            <div style={styles.iconBox}>
                <CalendarDays style={styles.icon} /> 
            </div>
            <h1 style={styles.title}>Reservation</h1>
          </div>
          <button style={styles.addButton}>+ Add Booking</button>
        </div>

        {/* ===== Filter Bar ===== */}
        <div style={styles.filterBar}>
          <select style={styles.select}>
            <option>All Booking</option>
          </select>
          <select style={styles.select}>
            <option>All Group</option>
          </select>
          <select style={styles.select}>
            <option>Type & Room</option>
          </select>
          <select style={styles.select}>
            <option>Status</option>
          </select>

          <div style={styles.searchBox}>
            <input type="text" placeholder="Search..." style={styles.searchInput} />
          </div>

          <div style={styles.exportButtons}>
            <button style={styles.exportBtn}>Export PDF</button>
            <button style={styles.exportBtn}>Export Excel</button>
          </div>
        </div>

        {/* ===== Table ===== */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}></th>
                <th style={styles.th}>Booking No</th>
                <th style={styles.th}>Type & Room</th>
                <th style={styles.th}>Group Name</th>
                <th style={styles.th}>Check In</th>
                <th style={styles.th}>Check Out</th>
                <th style={styles.th}>Paid Amount</th>
                <th style={styles.th}>Due Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {[
                { no: "#8012301", room: "Single #101", group: "Halal Indonesia", in: "10 July 2024", out: "12 July 2024", paid: "$1184.31", due: "$184.00", status: "Pending" },
                { no: "#8012302", room: "Twin #201", group: "Musafir Travels", in: "09 July 2024", out: "11 July 2024", paid: "$2184.36", due: "$84.00", status: "Paid" },
                { no: "#8012303", room: "Single #601", group: "Omative Trip", in: "08 July 2024", out: "10 July 2024", paid: "$1844.30", due: "$584.36", status: "Online" },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={styles.td}>
                    <input type="checkbox" />
                  </td>
                  <td style={styles.td}>{row.no}</td>
                  <td style={styles.td}>{row.room}</td>
                  <td style={styles.td}>{row.group}</td>
                  <td style={styles.td}>{row.in}</td>
                  <td style={styles.td}>{row.out}</td>
                  <td style={styles.td}>{row.paid}</td>
                  <td style={styles.td}>{row.due}</td>
                  <td style={styles.td}>
                    <span style={styles.status(row.status)}>{row.status}</span>
                  </td>
                  <td style={styles.td}>⋯</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== Pagination ===== */}
        <div style={styles.pagination}>
          <button style={styles.pageBtn}>← Previous</button>
          <div>
            <button style={{ ...styles.pageBtn, backgroundColor: "#0284c7", color: "#fff" }}>1</button>
            <button style={styles.pageBtn}>2</button>
            <button style={styles.pageBtn}>3</button>
          </div>
          <button style={styles.pageBtn}>Next →</button>
        </div>
      </main>
    </div>
  );
}
