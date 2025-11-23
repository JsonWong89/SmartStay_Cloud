import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/Admin/Register_page"; 
import Dashboard from "./pages/Staff/Dashboard"; 
import ReservationManagement from "./pages/Staff/Reservation"; 
import FrontDeskApp from "./pages/Staff/FrontDesk";
import BookingDetailsPage from "./pages/Staff/BookingDetailsPage";
import WalkInBookingPage from "./pages/Staff/BookingPage";
import RoomOperationPage from "./pages/Staff/RoomOperationPage";
import GuestManagementPage from "./pages/Staff/ManageGuestPage";


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
      <Route path="/" element={<Dashboard />} />

      <Route path="/login" element={<LoginPage />} />

      {/* Admin/Manager Registration */}
      <Route path="/register" element={<RegisterPage />} />

      {/* Staff */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/frontDesk" element={<FrontDeskApp />} />
      <Route path="/reservation" element={<ReservationManagement />} />
      <Route
        path="/booking"
        element={
          <BookingDetailsPage
            booking={{} as any}
            goBack={() => {}}
            updateBooking={() => {}}
          />
        }
      />
      <Route path="/walk-in-booking" element={<WalkInBookingPage />} />
      <Route path="/room-operation" element={<RoomOperationPage />} />
      <Route path="/manage-guests" element={<GuestManagementPage />} />


      {/* Login Page (optional, will use later) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    
  );
};

export default App;
