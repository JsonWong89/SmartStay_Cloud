import React from 'react';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';

const RoomTypesPage: React.FC = () => {
  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">
        <div className="page-header">
          <h1>Room Types & Pricing</h1>
          <p>Configure room types and pricing structures</p>
        </div>
        <div className="content-card">
          <div className="card-header">
            <h2>Room Configuration</h2>
            <button className="btn-primary">Add Room Type</button>
          </div>
          <div className="card-body">
            <p className="placeholder-text">Room type and pricing configuration will be implemented here.</p>
            <ul className="feature-list">
              <li>Define room types (Standard, Deluxe, Suite, etc.)</li>
              <li>Set base pricing for each room type</li>
              <li>Configure seasonal pricing adjustments</li>
              <li>Manage room amenities and features</li>
              <li>Set capacity and availability rules</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomTypesPage;
