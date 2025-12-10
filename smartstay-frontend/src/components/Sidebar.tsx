import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiKey,
  FiUsers,
  FiUserCheck,
  FiSettings,
  FiMenu,
  FiBell,
  FiHelpCircle,
  FiMonitor,
  FiUserPlus,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { useAuthStore } from "../store"; 

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
  const { logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const user = useAuthStore((state) => state.user);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    setSidebarCollapsed(newState);
  };

  const getInitials = (name?: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const menuItems = [
    {
      section: "MAIN",
      items: [
        {
          name: "Dashboard",
          path: "/staff/dashboard",
          icon: <FiHome className="h-5 w-5" />,
        },
        {
          name: "Front Desk",
          path: "/staff/frontDesk",
          icon: <FiMonitor className="h-5 w-5" />,
        },
        {
          name: "Reservation",
          path: "/staff/reservation",
          icon: <FiCalendar className="h-5 w-5" />,
        },
        {
          name: "Walk-in Booking",
          path: "/staff/walk-in-booking",
          icon: <FiUserPlus className="h-5 w-5" />,
        },
        {
          name: "Room Operation",
          path: "/staff/room-operation",
          icon: <FiKey className="h-5 w-5" />,
        },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        {
          name: "Manage Guests",
          path: "/staff/manage-guests",
          icon: <FiUserCheck className="h-5 w-5" />,
        },
        {
          name: "View Staff",
          path: "/staff/staff-list",
          icon: <FiUsers className="h-5 w-5" />,
        },
      ],
    },
    {
      section: "SETTINGS",
      items: [
        {
          name: "Profile",
          path: "/staff/profile",
          icon: <FiUser className="h-5 w-5" />,
        },
        {
          name: "Logout",
          path: "/logout",
          icon: <FiLogOut className="h-5 w-5" />,
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 text-white shadow-[2px_0_6px_rgba(0,0,0,0.05)] transition-all duration-300 ${
        collapsed ? "w-20" : "w-[230px]"
      }`}
    >
      <div className="flex-1 overflow-y-auto px-5 pt-5">
        {/* Logo + Toggle */}
        <div
          className={`mb-[30px] flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <h1
            className={`font-bold text-[18px] ${
              collapsed ? "hidden" : "block"
            }`}
          >
            {/* 🏨 SmartStay */}
            Smart<span className="text-blue-600">Stay</span>
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
            {/* <div className="p-3 rounded-lg bg-white/10 border border-white/20 shadow-sm backdrop-blur-sm"> */}

            {/* Hotel name slightly bigger */}
            <p className="text-[14px] text-white font-semibold mt-1">
              {user?.hotelName}
            </p>
            {/* Title small */}
            <p className="text-[11px] text-cyan-200 tracking-wide">
              Hotel Management System
            </p>

            {/* </div> */}

            <p className="text-[12px] text-cyan-300 mt-2">Staff</p>
          </div>
        )}

        {/* Menu */}
        {menuItems.map((section) => (
          <div key={section.section} className="mb-6">
            <p
              className={`text-[11px] font-normal uppercase tracking-[1px] text-cyan-400 mb-2 ${
                collapsed ? "hidden" : "block"
              }`}
            >
              {section.section}
            </p>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.name === "Logout") {
                      const confirmLogout = window.confirm(
                        "Are you sure you want to log out?"
                      );
                      if (!confirmLogout) return;

                      logout();
                      navigate("/login");
                      return;
                    }

                    setActivePage(item.name);
                    navigate(item.path);
                  }}
                  className={`flex w-full items-center rounded-lg text-[14px] font-medium transition-all ${
                    collapsed
                      ? "justify-center py-2.5"
                      : "gap-2.5 py-2.5 pl-4 pr-4"
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

        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold" >
            {getInitials(user?.fullName)}
          </div>
          {!collapsed && (
            <div>
              <p className="text-[14px] font-semibold text-white">
                {user?.fullName}
              </p>
              <p className="text-[12px] text-cyan-300">{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}