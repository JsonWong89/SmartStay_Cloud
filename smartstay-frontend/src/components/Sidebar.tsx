// Sidebar.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiKey,
  FiUsers,
  FiUserCheck,
  FiTag,
  FiBarChart2,
  FiTool,
  FiSettings,
  FiTrendingUp,
  FiGlobe,
  FiMenu,
  FiBell,
  FiHelpCircle,
} from "react-icons/fi";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  activePage,
  setActivePage,
  setSidebarCollapsed,
}: SidebarProps) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    setSidebarCollapsed(newState);
  };

  const menuItems = [
    {
      section: "MAIN",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: <FiHome /> },
        { name: "Reservation", path: "/reservation", icon: <FiCalendar /> },
        { name: "Room Operation", path: "/room-operation", icon: <FiKey /> },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        { name: "Manage Staff", path: "/manage-staff", icon: <FiUsers /> },
        { name: "Manage Guests", path: "/manage-guests", icon: <FiUserCheck /> },
        // { name: "Promotions", path: "/promotions", icon: <FiTag /> },
        // { name: "Report", path: "/report", icon: <FiBarChart2 /> },
        // { name: "Maintenance", path: "/maintenance", icon: <FiTool /> },
      ],
    },
    {
      section: "SETTINGS",
      items: [
        // { name: "Manage Platform", path: "/manage-platform", icon: <FiGlobe /> },
        // { name: "Upgrade Plan", path: "/upgrade-plan", icon: <FiTrendingUp /> },
        { name: "Settings", path: "/settings", icon: <FiSettings /> },
      ],
    },
  ];

  const styles = {
    sidebar: {
      position: "fixed" as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: collapsed ? "80px" : "250px",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
      borderRight: "1px solid #e5e7eb",
      boxShadow: "2px 0 6px rgba(0,0,0,0.05)",
      transition: "width 0.3s ease",
      overflow: "hidden",
      zIndex: 10,
    },
    topSection: {
      padding: "20px",
    },
    logoRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: collapsed ? "center" : "space-between",
      marginBottom: "30px",
    },
    logoText: {
      fontWeight: 700,
      fontSize: "18px",
      color: "#111827",
      display: collapsed ? "none" : "block",
    },
    toggleBtn: {
      backgroundColor: "#f3f4f6",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "18px",
      padding: "6px 10px",
    },
    subtitle: {
      fontSize: "13px",
      color: "#6b7280",
      display: collapsed ? "none" : "block",
      marginBottom: "4px",
    },
    subinfo: {
      fontSize: "12px",
      color: "#9ca3af",
      display: collapsed ? "none" : "block",
      marginBottom: "20px",
    },
    sectionTitle: {
      fontSize: "11px",
      color: "#9ca3af",
      letterSpacing: "1px",
      marginBottom: "8px",
      display: collapsed ? "none" : "block",
    },
    menuItem: (active: boolean) => ({
      display: "flex",
      alignItems: "center",
      gap: collapsed ? "0" : "10px",
      padding: collapsed ? "10px" : "10px 15px",
      borderRadius: "8px",
      backgroundColor: active ? "#e0f2fe" : "transparent",
      color: active ? "#0284c7" : "#111827",
      fontWeight: active ? 600 : 500,
      cursor: "pointer",
      marginBottom: "6px",
      justifyContent: collapsed ? "center" : "flex-start",
      transition: "all 0.3s",
      fontSize: "14px",
    }),
    footer: {
      borderTop: "1px solid #e5e7eb",
      padding: "16px 20px",
      color: "#6b7280",
      fontSize: "13px",
    },
    userRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginTop: "10px",
    },
    userAvatar: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "#d1d5db",
    },
    userInfo: {
      display: collapsed ? "none" : "block",
    },
    userName: {
      fontWeight: 600,
      color: "#111827",
    },
    userRole: {
      fontSize: "12px",
      color: "#9ca3af",
    },
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.topSection}>
        <div style={styles.logoRow}>
          <div style={styles.logoText}>Smart<span style={{ color: "#0284c7" }}>Stay</span></div>
          <button style={styles.toggleBtn} onClick={handleToggle}>
            <FiMenu />
          </button>
        </div>

        {!collapsed && (
          <>
            <div style={styles.subtitle}>Hotel Management System</div>
            <div style={styles.subinfo}>Staff</div>
          </>
        )}

        {menuItems.map((section) => (
          <div key={section.section}>
            <div style={styles.sectionTitle}>{section.section}</div>
            {section.items.map((item) => (
              <div
                key={item.name}
                style={styles.menuItem(activePage === item.name)}
                onClick={() => {
                  setActivePage(item.name);
                  navigate(item.path);
                }}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <div style={{ display: collapsed ? "none" : "flex", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiBell /> Notifications
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiHelpCircle /> Support
          </div>
        </div>

        <div style={styles.userRow}>
          <div style={styles.userAvatar}></div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>Lulu</div>
            <div style={styles.userRole}>Staff Manager</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
