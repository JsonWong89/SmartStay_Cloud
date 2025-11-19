import React from 'react';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';

const HotelsPage: React.FC = () => {
  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">
        <div className="page-header">
          <h1>Hotel Management</h1>
          <p>Add or remove hotels from the system</p>
        </div>
        <div className="content-card">
          <div className="card-header">
            <h2>Hotels</h2>
            <button className="btn-primary">Add New Hotel</button>
          </div>
          <div className="card-body">
            <p className="placeholder-text">Hotel management interface will be implemented here.</p>
            <ul className="feature-list">
              <li>View all registered hotels</li>
              <li>Add new hotels to the system</li>
              <li>Remove or deactivate hotels</li>
              <li>Edit hotel details and information</li>
              <li>Assign managers to hotels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelsPage;
