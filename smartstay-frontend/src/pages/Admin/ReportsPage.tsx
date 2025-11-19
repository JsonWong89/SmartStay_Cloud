import React from 'react';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';

const ReportsPage: React.FC = () => {
  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">
        <div className="page-header">
          <h1>System-Wide Reports</h1>
          <p>View comprehensive reports and metrics</p>
        </div>
        <div className="content-card">
          <div className="card-header">
            <h2>Reports & Analytics</h2>
            <button className="btn-primary">Generate Report</button>
          </div>
          <div className="card-body">
            <p className="placeholder-text">Reporting dashboard will be implemented here.</p>
            <ul className="feature-list">
              <li>Booking statistics and trends</li>
              <li>Revenue reports across all hotels</li>
              <li>Occupancy rates and analytics</li>
              <li>Customer satisfaction metrics</li>
              <li>Performance comparisons by hotel</li>
              <li>Export reports to PDF or Excel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
