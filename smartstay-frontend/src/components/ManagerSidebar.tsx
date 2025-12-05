// src/components/ManagerSidebar.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiHome,
    FiCalendar,
    FiKey,
    FiUsers,
    FiBriefcase,
    FiBarChart2,
    FiMenu,
    FiUser,
    FiLogOut,
} from "react-icons/fi";
import { useAuthStore } from "../store";

export default function ManagerSidebar({
    activePage,
    setActivePage,
    setSidebarCollapsed,
}: {
    activePage: string;
    setActivePage: (p: string) => void;
    setSidebarCollapsed: (v: boolean) => void;
}) {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const user = useAuthStore((s) => s.user);

    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
        setSidebarCollapsed(!collapsed);
    };

    const menu = [
        {
            section: "MAIN",
            items: [
                { name: "Dashboard", path: "/manager/overview", icon: <FiHome /> },
                { name: "Rooms", path: "/manager/rooms", icon: <FiKey /> },
                { name: "Bookings", path: "/manager/bookings", icon: <FiCalendar /> },
                { name: "Staff", path: "/manager/staff", icon: <FiUsers /> },
                { name: "Reports", path: "/manager/report", icon: <FiBarChart2 /> },
                { name: "Hotel Info", path: "/manager/hotelinfo", icon: <FiBriefcase /> },
            ],
        },
        {
            section: "SETTINGS",
            items: [
                { name: "Profile", path: "/manager/manageProfile", icon: <FiUser /> },
                { name: "Logout", path: "/logout", icon: <FiLogOut /> },
            ],
        },
    ];

    return (
        <aside
            className={`manager-sidebar ${collapsed ? "collapsed" : "expanded"
                }`}
        >
            {/* Sidebar Header */}
            <div className="sidebar-header flex items-center justify-between px-4 py-4">

                {/* SmartStay Logo */}
                {!collapsed && (
                    <h1 className="text-2xl font-extrabold tracking-wide flex items-center gap-1">
                        <span className="text-white">Smart</span>
                        <span className="text-[#3AB4FF]">Stay</span>
                    </h1>
                )}

                {/* Right-Aligned Toggle Button */}
                <button
                    className="toggle-btn bg-white/10 hover:bg-white/20 transition p-2 rounded-xl shadow-[0_0_8px_rgba(0,0,0,0.35)] backdrop-blur-sm"
                    onClick={toggleSidebar}
                >
                    <FiMenu className="text-cyan-300 text-2xl" />
                </button>
            </div>




            {/* Hotel Section */}
            {!collapsed && (
                <div className="hotel-info">
                    <p className="hotel-name">{user?.hotelName}</p>
                    <p className="hotel-subtitle">Hotel Management System</p>
                    <p className="role-label">Manager</p>
                </div>
            )}

            {/* Menu Sections */}
            <div className="menu-sections">
                {menu.map((section) => (
                    <div key={section.section} className="menu-section">
                        {!collapsed && (
                            <p className="section-label">{section.section}</p>
                        )}

                        {section.items.map((item) => (
                            <button
                                key={item.name}
                                className={`menu-item ${activePage === item.name ? "active" : ""
                                    } ${collapsed ? "centered" : ""}`}
                                onClick={() => {
                                    if (item.name === "Logout") {
                                        if (confirm("Logout?")) {
                                            logout();
                                            navigate("/login");
                                        }
                                        return;
                                    }
                                    setActivePage(item.name);
                                    navigate(item.path);
                                }}
                            >
                                {item.icon}
                                {!collapsed && <span>{item.name}</span>}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {/* Divider Line */}
            <div className="w-full border-t border-white/20 my-4"></div>

            {/* Profile Footer */}
            <div className="sidebar-footer absolute bottom-5 left-0 w-full px-5 flex items-center gap-3">
                <div className="user-avatar h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
                {!collapsed && (
                    <div>
                        <p className="user-name font-semibold text-white text-[14px]">
                            {user?.fullName}
                        </p>
                        <p className="user-role text-cyan-300 text-[12px]">Manager</p>
                    </div>
                )}
            </div>

        </aside>
    );
}
