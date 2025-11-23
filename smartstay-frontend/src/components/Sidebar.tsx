// components/Sidebar.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome, FiCalendar, FiKey, FiUsers, FiUserCheck, FiSettings,
  FiMenu, FiBell, FiHelpCircle, FiMonitor, FiUserPlus, FiUser, FiLogOut
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
        { name: "Dashboard", path: "/dashboard", icon: <FiHome className="h-5 w-5" /> },
        { name: "Front Desk", path: "/frontDesk", icon: <FiMonitor className="h-5 w-5" /> },
        { name: "Reservation", path: "/reservation", icon: <FiCalendar className="h-5 w-5" /> },
        { name: "Walk-in Booking", path: "/walk-in-booking", icon: <FiUserPlus className="h-5 w-5" /> },
        { name: "Room Operation", path: "/room-operation", icon: <FiKey className="h-5 w-5" /> },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        { name: "Manage Staff", path: "/manage-staff", icon: <FiUsers className="h-5 w-5" /> },
        { name: "Manage Guests", path: "/manage-guests", icon: <FiUserCheck className="h-5 w-5" /> },
      ],
    },
    {
      section: "SETTINGS",
      items: [
        { name: "Profile", path: "/profile", icon: <FiUser className="h-5 w-5" /> },
        { name: "Logout", path: "/settings", icon: <FiLogOut className="h-5 w-5" /> },
      ],
    },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 text-white shadow-[2px_0_6px_rgba(0,0,0,0.05)] transition-all duration-300 ${collapsed ? "w-20" : "w-[230px]"}`}>
      <div className="flex-1 overflow-y-auto px-5 pt-5">
        {/* Logo + Toggle */}
        <div className={`mb-[30px] flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          <h1 className={`font-bold text-[18px] ${collapsed ? "hidden" : "block"}`}>
            🏨 SmartStay
          </h1>
          <button
            onClick={handleToggle}
            className="rounded-md bg-white/10 p-[6px] hover:bg-white/20 transition"
          >
            <FiMenu className="h-[18px] w-[18px] text-cyan-300" />
          </button>
        </div>

        {/* Subtitle - only when expanded */}
        {!collapsed && (
          <div className="mb-5">
            <p className="text-[13px] text-cyan-200 mb-1">Hotel Management System</p>
            <p className="text-[12px] text-cyan-300">Staff</p>
          </div>
        )}

        {/* Menu */}
        {menuItems.map((section) => (
          <div key={section.section} className="mb-6">
            <p className={`text-[11px] font-normal uppercase tracking-[1px] text-cyan-400 mb-2 ${collapsed ? "hidden" : "block"}`}>
              {section.section}
            </p>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActivePage(item.name);
                    navigate(item.path);
                  }}
                  className={`flex w-full items-center rounded-lg text-[14px] font-medium transition-all ${
                    collapsed ? "justify-center py-2.5" : "gap-2.5 py-2.5 pl-4 pr-4"
                  } ${
                    activePage === item.name
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                      : "text-gray-200 hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.name}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-5 py-4">
        {/* {!collapsed && (
          <div className="mb-4 flex gap-6 text-[13px] text-cyan-300">
            <button className="flex items-center gap-1.5 hover:text-white">
              <FiBell className="h-4 w-4" /> Notifications
            </button>
            <button className="flex items-center gap-1.5 hover:text-white">
              <FiHelpCircle className="h-4 w-4" /> Support
            </button>
          </div>
        )} */}

        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
          {!collapsed && (
            <div>
              <p className="text-[14px] font-semibold text-white">Lulu</p>
              <p className="text-[12px] text-cyan-300">Staff Manager</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}