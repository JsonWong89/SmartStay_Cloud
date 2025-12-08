import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/Admin/Register_page";
import Dashboard from "./pages/Staff/Dashboard";
import ReservationManagement from "./pages/Staff/Reservation/ReservationManagement";
import FrontDeskApp from "./pages/Staff/FrontDesk/FrontDesk";
import WalkInBookingPage from "./pages/Staff/WalkInBookingPage";
import RoomOperationsPage from "./pages/Staff/RoomOperation/RoomOperationsPage";
import GuestManagementPage from "./pages/Staff/ManageGuest/GuestManagementPage";
import ReceiptPage from "./pages/Staff/ReceiptPage";
import StaffListPage from "./pages/Staff/StaffListPage";
import StaffProfilePage from "./pages/Staff/StaffProfilePage";
import ProfilePasswordPage from "./pages/Staff/ProfilePasswordPage";

import LoginPage from "./pages/LoginPage";
// You can later add:
// import HomePage from "./pages/HomePage";
// import LoginPage from "./pages/LoginPage";

// ✅ App component
const App: React.FC = () => {
  return (
    <Routes>
      {/* Default route -> Login */}
      {/* <Route path="/" element={<LoginPage />} /> */}
      <Route path="/" element={<LoginPage />} />

      <Route path="/login" element={<LoginPage />} />

      {/* Admin/Manager Registration */}
      <Route path="/register" element={<RegisterPage />} />

      {/* Staff */}
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Receptionist"]}>
            <Dashboard />
           </ProtectedRoute>
        }
      />
      <Route
        path="/staff/frontDesk"
        element={
          <ProtectedRoute allowedRoles={["Receptionist"]}>
            <FrontDeskApp />
           </ProtectedRoute> 
        }
      />
      <Route
        path="/staff/reservation"
        element={
          <ProtectedRoute allowedRoles={["Receptionist"]}>
            <ReservationManagement />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/staff/booking"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Manager", "Receptionist"]}>
            <BookingDetailsPage
              booking={{} as any}
              goBack={() => {}}
              updateBooking={() => {}}
            />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/staff/walk-in-booking"
        element={
          <ProtectedRoute allowedRoles={["Receptionist"]}>
            <WalkInBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/room-operation"
        element={
          <ProtectedRoute allowedRoles={["Receptionist"]}>
            <RoomOperationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/manage-guests"
        element={
          <ProtectedRoute allowedRoles={["Receptionist"]}>
            <GuestManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/receipt/:bookingId"
        element={
          <ProtectedRoute allowedRoles={["Receptionist"]}>
            <ReceiptPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/staff-list"
        element={
          <ProtectedRoute allowedRoles={["Receptionist"]}>
            <StaffListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/profile"
        element={
          <ProtectedRoute allowedRoles={["Receptionist"]}>  
            <StaffProfilePage />
          </ProtectedRoute>
        }
      /> 

      <Route
        path="/staff/profile/password"
        element={
          <ProtectedRoute allowedRoles={["Receptionist"]}>
            <ProfilePasswordPage />
          </ProtectedRoute>
        }
      /> 

      {/* Login Page (optional, will use later) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
