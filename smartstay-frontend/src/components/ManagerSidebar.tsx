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

    const getInitials = (name?: string) => {
        if (!name) return 'M';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const toggleSidebar = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        setSidebarCollapsed(newState);
    };

    const menu = [
        {
            section: "MAIN",
            items: [
                { name: "Dashboard", path: "/manager/overview", icon: <FiHome className="h-5 w-5" /> },
                { name: "Rooms", path: "/manager/rooms", icon: <FiKey className="h-5 w-5" /> },
                { name: "Bookings", path: "/manager/bookings", icon: <FiCalendar className="h-5 w-5" /> },
                { name: "Staff", path: "/manager/staff", icon: <FiUsers className="h-5 w-5" /> },
                { name: "Reports", path: "/manager/report", icon: <FiBarChart2 className="h-5 w-5" /> },
                { name: "Hotel Info", path: "/manager/hotelinfo", icon: <FiBriefcase className="h-5 w-5" /> },
            ],
        },
        {
            section: "SETTINGS",
            items: [
                { name: "Profile", path: "/manager/manageProfile", icon: <FiUser className="h-5 w-5" /> },
                { name: "Logout", path: "/logout", icon: <FiLogOut className="h-5 w-5" /> },
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
                        Smart<span className="text-blue-600">Stay</span>
                    </h1>
                    <button
                        onClick={toggleSidebar}
                        className="rounded-md bg-white/10 p-[6px] hover:bg-white/20 transition"
                    >
                        <FiMenu className="h-[18px] w-[18px] text-cyan-300" />
                    </button>
                </div>

                {/* Subtitle - only when expanded */}
                {!collapsed && (
                    <div className="mb-5">
                        <p className="text-[14px] text-white font-semibold mt-1">
                            {user?.hotelName || "Hotel Name"}
                        </p>
                        <p className="text-[11px] text-cyan-200 tracking-wide">
                            Hotel Management System
                        </p>
                        <p className="text-[12px] text-cyan-300 mt-2">Manager</p>
                    </div>
                )}

                {/* Menu */}
                {menu.map((section) => (
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
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {getInitials(user?.fullName)}
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="text-[14px] font-semibold text-white">
                                {user?.fullName}
                            </p>
                            <p className="text-[12px] text-cyan-300">Manager</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
