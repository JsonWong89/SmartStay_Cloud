// src/pages/Hotel_manager/ManagerIndex.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "../../components/ManagerSidebar";
import "../../styles/dashboard.css";

export default function ManagerIndex() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [collapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="manager-layout">
      
      <ManagerSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <main
        className={`manager-main transition-all duration-300 ${
          collapsed ? "collapsed" : "expanded"
        }`}
      >
        <Outlet />
      </main>

    </div>
  );
}
