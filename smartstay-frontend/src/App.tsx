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
import MonitorPage from "./pages/Admin/MonitorPage";
import ManageManagersPage from "./pages/Admin/ManageManagersPage";
import CreateManagerPage from "./pages/Admin/CreateManagerPage";

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
      <Route path="/admin/hotels" element={<HotelsPage />} />
      <Route path="/admin/room-types" element={<RoomTypesPage />} />
      <Route path="/admin/reports" element={<ReportsPage />} />
      <Route path="/admin/monitor" element={<MonitorPage />} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
