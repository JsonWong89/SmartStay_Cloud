import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import RegisterPage from "./pages/Admin/Register_page";
import LoginPage from "./pages/LoginPage";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageUsersPage from "./pages/Admin/ManageManagersPage";
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

      {/* Admin routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/manage-managers" element={<ManageManagersPage />} />
      <Route path="/admin/manage-managers/new" element={<CreateManagerPage />} />
      <Route path="/admin/manage-managers/edit/:id" element={<EditManagerPage />} />
      <Route path="/admin/hotels" element={<HotelsPage />} />
      <Route path="/admin/hotels/new" element={<CreateHotelPage />} />
      <Route path="/admin/hotels/edit/:id" element={<EditHotelPage />} />
      <Route path="/admin/rooms" element={<RoomsPage />} />
      <Route path="/admin/rooms/new" element={<CreateRoomPage />} />
      <Route path="/admin/rooms/edit/:id" element={<EditRoomPage />} />
      <Route path="/admin/room-types" element={<RoomTypesPage />} />
      <Route path="/admin/reports" element={<ReportsPage />} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
