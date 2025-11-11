import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ✅ Import your pages
import RegisterPage from "./pages/Admin/Register_page"; // Adjust path if needed
import Dashboard from "./pages/Staff/Dashboard"; 
import Reservation from "./pages/Staff/Reservation"; 

import LoginPage from "./pages/LoginPage";

// ✅ Import Guest pages
import GuestDashboard from "./pages/Guest/GuestDashboard";
import RoomSearch from "./pages/Guest/RoomSearch";
import BookingPage from "./pages/Guest/BookingPage";
import MyReservations from "./pages/Guest/MyReservations";
import PaymentPage from "./pages/Guest/PaymentPage";
import ReviewPage from "./pages/Guest/ReviewPage";
import GuestProfile from "./pages/Guest/GuestProfile";

// ✅ App component
const App: React.FC = () => {
  return (
    <Routes>
      {/* Default route -> Guest Dashboard */}
      <Route path="/" element={<GuestDashboard />} />
      
      {/* Login Page */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin/Manager Registration */}
      <Route path="/register" element={<RegisterPage />} />

      {/* Staff Routes */}
      <Route path="/staff/dashboard" element={<Dashboard />} />
      <Route path="/staff/reservation" element={<Reservation />} />

      {/* Guest Routes */}
      <Route path="/guest/dashboard" element={<GuestDashboard />} />
      <Route path="/guest/search" element={<RoomSearch />} />
      <Route path="/guest/booking/:roomId" element={<BookingPage />} />
      <Route path="/guest/reservations" element={<MyReservations />} />
      <Route path="/guest/payment" element={<PaymentPage />} />
      <Route path="/guest/review/:reservationId" element={<ReviewPage />} />
      <Route path="/guest/profile" element={<GuestProfile />} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    
  );
};

export default App;
