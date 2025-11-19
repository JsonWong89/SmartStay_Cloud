import React from 'react';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';

const MonitorPage: React.FC = () => {
  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">
        <div className="page-header">
          <h1>System Monitor</h1>
          <p>Monitor overall system health and activities</p>
        </div>
        <div className="content-card">
          <div className="card-header">
            <h2>System Overview</h2>
            <button className="btn-primary">Refresh</button>
          </div>
          <div className="card-body">
            <p className="placeholder-text">System monitoring dashboard will be implemented here.</p>
            <ul className="feature-list">
              <li>Real-time system status</li>
              <li>Active bookings and check-ins</li>
              <li>User activity monitoring</li>
              <li>System alerts and notifications</li>
              <li>Performance metrics (response times, uptime)</li>
              <li>Database health and usage statistics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorPage;
