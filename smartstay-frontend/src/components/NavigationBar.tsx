import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/NavigationBar.css';

const NavigationBar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/manage-managers', label: 'Manage Managers Accounts' },
    { path: '/admin/hotels', label: 'Add or Remove Hotels' },
    { path: '/admin/rooms', label: 'Configure Room Types & Pricing' },
    { path: '/admin/reports', label: 'View System Reports' },
    { path: '/admin/monitor', label: 'Monitor Overall' },
  ];

  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Smart Stay Admin</h1>
          </Link>
        </div>
        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-user">
          <button className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
