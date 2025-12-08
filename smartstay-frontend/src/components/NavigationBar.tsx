import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MdBedroomParent } from "react-icons/md";
import { useAuthStore } from '../store';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiBarChart2, 
  FiMenu,
  FiLogOut,
  FiUser
} from 'react-icons/fi';

const NavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { 
      section: 'MAIN',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <FiHome className="h-5 w-5" /> }
      ]
    },
    { 
      section: 'MANAGEMENT',
      items: [
        { path: '/admin/manage-managers', label: 'Manage Managers', icon: <FiUsers className="h-5 w-5" /> },
        { path: '/admin/hotels', label: 'Hotels', icon: <FiBriefcase className="h-5 w-5" /> },
        { path: '/admin/rooms', label: 'Rooms & Pricing', icon: <MdBedroomParent className="h-5 w-5" /> },
        { path: '/admin/reports', label: 'System Reports', icon: <FiBarChart2 className="h-5 w-5" /> }
      ]
    },
    {
      section: 'SETTINGS',
      items: [
        { path: '/logout', label: 'Logout', icon: <FiLogOut className="h-5 w-5" /> }
      ]
    }
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;
    
    logout();
    navigate('/login');
  };

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
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md bg-white/10 p-[6px] hover:bg-white/20 transition"
          >
            <FiMenu className="h-[18px] w-[18px] text-cyan-300" />
          </button>
        </div>

        {/* Subtitle - only when expanded */}
        {!collapsed && (
          <div className="mb-5">
            <p className="text-[14px] text-white font-semibold mt-1">
              Hotel Management System
            </p>
            <p className="text-[12px] text-cyan-300 mt-2">Administrator</p>
          </div>
        )}

        {/* Menu */}
        {navItems.map((section) => (
          <div key={section.section} className="mb-6">
            <p
              className={`text-[11px] font-normal uppercase tracking-[1px] text-cyan-400 mb-2 ${
                collapsed ? "hidden" : "block"
              }`}
            >
              {section.section}
            </p>
            <div className="space-y-1.5">
              {section.items.map((item) => {
                if (item.path === '/logout') {
                  return (
                    <button
                      key={item.path}
                      onClick={handleLogout}
                      className={`flex w-full items-center rounded-lg text-[14px] font-medium transition-all ${
                        collapsed
                          ? "justify-center py-2.5"
                          : "gap-2.5 py-2.5 pl-4 pr-4"
                      } text-gray-200 hover:bg-white/10`}
                    >
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex w-full items-center rounded-lg text-[14px] font-medium transition-all ${
                      collapsed
                        ? "justify-center py-2.5"
                        : "gap-2.5 py-2.5 pl-4 pr-4"
                    } ${
                      location.pathname === item.path
                        ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                        : "text-gray-200 hover:bg-white/10"
                    }`}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {(user?.fullName?.[0]?.toUpperCase()) || 'A'}
          </div>
          {!collapsed && (
            <div>
              <p className="text-[14px] font-semibold text-white">
                {user?.fullName || 'Admin'}
              </p>
              <p className="text-[12px] text-cyan-300">{user?.role || 'Administrator'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default NavigationBar;
