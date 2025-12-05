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
import '../styles/NavigationBar.css';

const NavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { 
      section: 'MAIN',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> }
      ]
    },
    { 
      section: 'MANAGEMENT',
      items: [
        { path: '/admin/manage-managers', label: 'Manage Managers', icon: <FiUsers /> },
        { path: '/admin/hotels', label: 'Hotels', icon: <FiBriefcase /> },
        { path: '/admin/rooms', label: 'Rooms & Pricing', icon: <MdBedroomParent /> },
        { path: '/admin/reports', label: 'System Reports', icon: <FiBarChart2 /> }
      ]
    }
  ];

  const handleLogout = () => {
    setUser({ fullName: '', email: '', role: '' });
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        {/* Header */}
        <div className="sidebar-header">
          {!collapsed && (
            <Link to="/admin/dashboard" className="sidebar-brand">
              <h1>Smart<span>Stay</span></h1>
            </Link>
          )}
          <button 
            className="sidebar-toggle" 
            onClick={() => setCollapsed(!collapsed)}
          >
            <FiMenu />
          </button>
        </div>

        {/* Hotel Info */}
        {!collapsed && (
          <div className="sidebar-info">
            <p className="hotel-name">Hotel Management System</p>
            <p className="user-role">Admin</p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section} className="nav-section">
              {!collapsed && (
                <p className="section-label">{section.section}</p>
              )}
              <div className="nav-items">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!collapsed && <span className="nav-label">{item.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Settings Section */}
          <div className="nav-section">
            {!collapsed && (
              <p className="section-label">SETTINGS</p>
            )}
            <div className="nav-items">
              <button className="nav-item" onClick={handleLogout}>
                <span className="nav-icon"><FiLogOut /></span>
                {!collapsed && <span className="nav-label">Logout</span>}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="sidebar-footer">
        <div className="user-avatar">
          <div className="avatar-circle">
            {(user?.fullName?.[0]?.toUpperCase()) || 'A'}
          </div>
        </div>
        {!collapsed && (
          <div className="user-info">
            <p className="user-name">{user?.fullName || 'Admin'}</p>
            <p className="user-role-label">{user?.role || 'Administrator'}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default NavigationBar;
