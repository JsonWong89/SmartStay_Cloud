import React from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const dashboardCards = [
    {
      title: 'Manage User Accounts',
      description: 'Manage manager accounts and permissions',
      icon: '👥',
      path: '/admin/manage-managers',
      color: '#667eea',
    },
    {
      title: 'Hotels',
      description: 'Add or remove hotels from the system',
      icon: '🏨',
      path: '/admin/hotels',
      color: '#f093fb',
    },
    {
      title: 'Room Types & Pricing',
      description: 'Configure room types and pricing structures',
      icon: '🛏️',
      path: '/admin/rooms',
      color: '#4facfe',
    },
    {
      title: 'System Reports',
      description: 'View comprehensive reports and metrics',
      icon: '📊',
      path: '/admin/reports',
      color: '#43e97b',
    },
  ];

  return (
    <div className="admin-dashboard">
      <NavigationBar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome to Smart Stay Admin Portal</p>
        </div>
        <div className="dashboard-grid">
          {dashboardCards.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className="dashboard-card"
              style={{ borderTopColor: card.color }}
            >
              <div className="card-icon" style={{ backgroundColor: `${card.color}20` }}>
                <span style={{ color: card.color }}>{card.icon}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <div className="card-arrow" style={{ color: card.color }}>
                →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
