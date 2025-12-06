import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import AuthPage from "./pages/AuthPage";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import HotelManagerPage from "./pages/HotelManagerPage";
import StaffPage from "./pages/StaffPage";
import HotelsPage from "./pages/Admin/HotelsPage";

// Guest Pages
import GuestDashboard from "./pages/Guest/GuestDashboard";
import RoomSearch from "./pages/Guest/RoomSearch";
import RoomDetails from "./pages/Guest/RoomDetails";
import BookingPage from "./pages/Guest/BookingPage";
import BookingConfirmation from "./pages/Guest/BookingConfirmation";
import MyReservations from "./pages/Guest/MyReservations";
import GuestProfile from "./pages/Guest/GuestProfile";
import PaymentPage from "./pages/Guest/PaymentPage";
import ReceiptPage from "./pages/Guest/ReceiptPage";
import ReviewPage from "./pages/Guest/ReviewPage";
import MyReviewsPage from "./pages/Guest/MyReviewsPage";
import MyDocuments from "./pages/Guest/MyDocuments";
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
      {/* Default route -> Guest Dashboard (Public) */}
      <Route path="/" element={<GuestDashboard />} />
      
      {/* Auth routes - Unified animated page */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

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
      <Route path="/staff" element={<ProtectedRoute allowedRoles={['Staff']}><StaffPage /></ProtectedRoute>} />

      {/* Guest routes - Protected */}
      <Route path="/guest" element={<ProtectedRoute allowedRoles={['Guest']}><GuestDashboard /></ProtectedRoute>} />
      <Route path="/guest/dashboard" element={<ProtectedRoute allowedRoles={['Guest']}><GuestDashboard /></ProtectedRoute>} />
      <Route path="/guest/search" element={<ProtectedRoute allowedRoles={['Guest']}><RoomSearch /></ProtectedRoute>} />
      <Route path="/guest/room/:roomId" element={<ProtectedRoute allowedRoles={['Guest']}><RoomDetails /></ProtectedRoute>} />
      <Route path="/guest/booking" element={<ProtectedRoute allowedRoles={['Guest']}><BookingPage /></ProtectedRoute>} />
      <Route path="/guest/booking-confirmation/:bookingId" element={<ProtectedRoute allowedRoles={['Guest']}><BookingConfirmation /></ProtectedRoute>} />
      <Route path="/guest/reservations" element={<ProtectedRoute allowedRoles={['Guest']}><MyReservations /></ProtectedRoute>} />
      <Route path="/guest/profile" element={<ProtectedRoute allowedRoles={['Guest']}><GuestProfile /></ProtectedRoute>} />
      <Route path="/guest/payment/:bookingId" element={<ProtectedRoute allowedRoles={['Guest']}><PaymentPage /></ProtectedRoute>} />
      <Route path="/guest/receipt/:bookingId" element={<ProtectedRoute allowedRoles={['Guest']}><ReceiptPage /></ProtectedRoute>} />
      <Route path="/guest/review/:reservationId" element={<ProtectedRoute allowedRoles={['Guest']}><ReviewPage /></ProtectedRoute>} />
      <Route path="/guest/reviews" element={<ProtectedRoute allowedRoles={['Guest']}><MyReviewsPage /></ProtectedRoute>} />
      <Route path="/guest/documents" element={<ProtectedRoute allowedRoles={['Guest']}><MyDocuments /></ProtectedRoute>} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    
  );
};

export default App;
