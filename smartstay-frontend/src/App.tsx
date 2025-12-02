import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import RegisterPage from "./pages/Admin/Register_page";
import LoginPage from "./pages/LoginPage";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import HotelManagerPage from "./pages/HotelManagerPage";
import GuestPage from "./pages/GuestPage";
import StaffPage from "./pages/StaffPage";
import HotelsPage from "./pages/Admin/HotelsPage";
import RoomTypesPage from "./pages/Admin/RoomTypesPage";
import ReportsPage from "./pages/Admin/ReportsPage";
import ManageManagersPage from "./pages/Admin/ManageManagersPage";
import CreateManagerPage from "./pages/Admin/CreateManagerPage";
import EditManagerPage from "./pages/Admin/EditManagerPage";
import CreateHotelPage from "./pages/Admin/CreateHotelPage";
import EditHotelPage from "./pages/Admin/EditHotelPage";
import RoomsPage from "./pages/Admin/RoomsPage";
import CreateRoomPage from "./pages/Admin/CreateRoomPage";
import EditRoomPage from "./pages/Admin/EditRoomPage";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Default route -> Login */}
      <Route path="/" element={<LoginPage />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin routes - Protected */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/manage-managers" element={<ProtectedRoute allowedRoles={['Admin']}><ManageManagersPage /></ProtectedRoute>} />
      <Route path="/admin/manage-managers/new" element={<ProtectedRoute allowedRoles={['Admin']}><CreateManagerPage /></ProtectedRoute>} />
      <Route path="/admin/manage-managers/edit/:id" element={<ProtectedRoute allowedRoles={['Admin']}><EditManagerPage /></ProtectedRoute>} />
      <Route path="/admin/hotels" element={<ProtectedRoute allowedRoles={['Admin']}><HotelsPage /></ProtectedRoute>} />
      <Route path="/admin/hotels/new" element={<ProtectedRoute allowedRoles={['Admin']}><CreateHotelPage /></ProtectedRoute>} />
      <Route path="/admin/hotels/edit/:id" element={<ProtectedRoute allowedRoles={['Admin']}><EditHotelPage /></ProtectedRoute>} />
      <Route path="/admin/rooms" element={<ProtectedRoute allowedRoles={['Admin']}><RoomsPage /></ProtectedRoute>} />
      <Route path="/admin/rooms/new" element={<ProtectedRoute allowedRoles={['Admin']}><CreateRoomPage /></ProtectedRoute>} />
      <Route path="/admin/rooms/edit/:id" element={<ProtectedRoute allowedRoles={['Admin']}><EditRoomPage /></ProtectedRoute>} />
      <Route path="/admin/room-types" element={<ProtectedRoute allowedRoles={['Admin']}><RoomTypesPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['Admin']}><ReportsPage /></ProtectedRoute>} />

      {/* Role-based routes - Protected */}
      <Route path="/hotel-manager" element={<ProtectedRoute allowedRoles={['Hotel Manager']}><HotelManagerPage /></ProtectedRoute>} />
      <Route path="/guest" element={<ProtectedRoute allowedRoles={['Guest']}><GuestPage /></ProtectedRoute>} />
      <Route path="/staff" element={<ProtectedRoute allowedRoles={['Staff']}><StaffPage /></ProtectedRoute>} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
