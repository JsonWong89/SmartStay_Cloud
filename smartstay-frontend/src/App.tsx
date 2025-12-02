import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Admin from './pages/Admin/Admin';
import Manager from './pages/Hotel_manager/ManagerIndex';
import ManageRooms from "./pages/Hotel_manager/ManagerManageRooms";
import ManageBookings from "./pages/Hotel_manager/ManagerManageBookings";
import ManageStaff from "./pages/Hotel_manager/ManagerManageStaff";
import ManageReport from "./pages/Hotel_manager/ManagerReportMenu";
import ManagerOverview from "./pages/Hotel_manager/ManageOverview";
import ManagerHotelInfo from './pages/Hotel_manager/ManagerHotelInfo';
import ManagerReport_Revenue from './pages/Hotel_manager/Reports/RevenueReport';
import ManagerReport_Occupancy from './pages/Hotel_manager/Reports/OccupancyReport';
import ManagerReport_Room from './pages/Hotel_manager/Reports/RoomTypeReport';
import ManagerReport_Booking from './pages/Hotel_manager/Reports/BookingStatusReport';
import ManagerReport_Gender from './pages/Hotel_manager/Reports/GenderReport';

import Staff from './pages/Staff/Staff';
import Customer from './pages/Guest/Guest';
import Unauthorized from './pages/Unauthorized';
import { useAuthStore } from './store';

export default function App() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  return (
    <div>
      <header style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Home</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/manager">Manager</Link>
          <Link to="/staff">Staff</Link>
          <Link to="/customer">Customer</Link>
        </nav>
        <div>
          {user ? (
            <>
              <span style={{ marginRight: 12 }}>{user.name} ({user.role})</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to={user ? `/${user.role.toLowerCase()}` : '/login'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute allow={["ADMIN"] as any} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route element={<ProtectedRoute allow={["ADMIN", "MANAGER"] as any} />}>
          <Route path="/manager" element={<Manager />}>
            <Route index element={<ManagerOverview />} />
            <Route path="overview" element={<ManagerOverview />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="staff" element={<ManageStaff />} />
            <Route path="report" element={<ManageReport />} />
            <Route path="hotelinfo" element={<ManagerHotelInfo />} />

            <Route path="report/revenue" element={<ManagerReport_Revenue />} />
            <Route path="report/occupancy" element={<ManagerReport_Occupancy />} />
            <Route path="report/roomtypes" element={<ManagerReport_Room />} />
            <Route path="report/bookings" element={<ManagerReport_Booking />} />
            <Route path="report/gender" element={<ManagerReport_Gender />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allow={["ADMIN", "MANAGER", "STAFF"] as any} />}>
          <Route path="/staff" element={<Staff />} />
        </Route>
        <Route element={<ProtectedRoute allow={["ADMIN", "MANAGER", "STAFF", "CUSTOMER"] as any} />}>
          <Route path="/customer" element={<Customer />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>




    </div>
  );
}
