import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
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

// Hotel Manager imports
import Manager from "./pages/Hotel_manager/ManagerIndex";
import ManageRooms from "./pages/Hotel_manager/ManagerManageRooms";
import ManageBookings from "./pages/Hotel_manager/ManagerManageBookings";
import ManageStaff from "./pages/Hotel_manager/ManagerManageStaff";
import ManageReport from "./pages/Hotel_manager/ManagerManageReport";
import ManagerOverview from "./pages/Hotel_manager/ManageOverview";
import ManagerHotelInfo from "./pages/Hotel_manager/ManagerHotelInfo";
import ManagerReport_Revenue from "./pages/Hotel_manager/Reports/RevenueReport";
import ManagerReport_Occupancy from "./pages/Hotel_manager/Reports/OccupancyReport";
import ManagerReport_Room from "./pages/Hotel_manager/Reports/RoomTypeReport";
import ManagerReport_Booking from "./pages/Hotel_manager/Reports/BookingStatusReport";
import ManagerReport_Gender from "./pages/Hotel_manager/Reports/GenderReport";
import ManagerProfile from "./pages/Hotel_manager/ManageProfile";

// Guest imports
import GuestDashboard from "./pages/Guest/GuestDashboard";
import RoomSearch from "./pages/Guest/RoomSearch";
import RoomDetails from "./pages/Guest/RoomDetails";
import BookingPage from "./pages/Guest/BookingPage";
import BookingConfirmation from "./pages/Guest/BookingConfirmation";
import PaymentPage from "./pages/Guest/PaymentPage";
import MyReservations from "./pages/Guest/MyReservations";
import MyDocuments from "./pages/Guest/MyDocuments";
import GuestProfile from "./pages/Guest/GuestProfile";
import MyReviewsPage from "./pages/Guest/MyReviewsPage";
import ReviewPage from "./pages/Guest/ReviewPage";
import GuestReceiptPage from "./pages/Guest/ReceiptPage";

import AuthPage from "./pages/AuthPage";

// Admin imports
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageManagersPage from "./pages/Admin/ManageManagersPage";
import HotelsPage from "./pages/Admin/HotelsPage";
import RoomTypesPage from "./pages/Admin/RoomTypesPage";
import RoomsPage from "./pages/Admin/RoomsPage";
import ReportsPage from "./pages/Admin/ReportsPage";
import CreateHotelPage from "./pages/Admin/CreateHotelPage";
import EditHotelPage from "./pages/Admin/EditHotelPage";
import CreateManagerPage from "./pages/Admin/CreateManagerPage";
import EditManagerPage from "./pages/Admin/EditManagerPage";
import CreateRoomPage from "./pages/Admin/CreateRoomPage";
import EditRoomPage from "./pages/Admin/EditRoomPage";

import "./styles/modals.css";

// ✅ App component
const App: React.FC = () => {
  return (
    <Routes>
      {/* Default route -> Public Guest Dashboard (no login required) */}
      <Route path="/" element={<GuestDashboard />} />

      <Route path="/login" element={<AuthPage />} />

      {/* Auth routes - handles both login and registration */}
      <Route path="/register" element={<AuthPage />} />

      {/* Guest Routes */}
      <Route
        path="/guest/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <GuestDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/search"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <RoomSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/room/:roomId"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <RoomDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/booking"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/booking-confirmation"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <BookingConfirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/payment"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/reservations"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <MyReservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/documents"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <MyDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/profile"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <GuestProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/reviews"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <MyReviewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/review/:bookingId"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <ReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guest/receipt/:bookingId"
        element={
          <ProtectedRoute allowedRoles={["Guest"]}>
            <GuestReceiptPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-managers"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <ManageManagersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hotels"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <HotelsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/room-types"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <RoomTypesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <RoomsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hotels/new"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <CreateHotelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hotels/edit/:id"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <EditHotelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-managers/new"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <CreateManagerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-managers/edit/:id"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <EditManagerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rooms/new"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <CreateRoomPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rooms/edit/:id"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <EditRoomPage />
          </ProtectedRoute>
        }
      />

      {/* Hotel Manager Routes */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <Manager />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManagerOverview />} />
        <Route path="overview" element={<ManagerOverview />} />
        <Route path="rooms" element={<ManageRooms />} />
        <Route path="bookings" element={<ManageBookings />} />
        <Route path="staff" element={<ManageStaff />} />
        <Route path="report" element={<ManageReport />} />
        <Route path="hotelinfo" element={<ManagerHotelInfo />} />
        <Route path="manageProfile" element={<ManagerProfile />} />
        <Route path="report/revenue" element={<ManagerReport_Revenue />} />
        <Route path="report/occupancy" element={<ManagerReport_Occupancy />} />
        <Route path="report/roomtypes" element={<ManagerReport_Room />} />
        <Route path="report/bookings" element={<ManagerReport_Booking />} />
        <Route path="report/gender" element={<ManagerReport_Gender />} />
      </Route>

      {/* Staff Routes */}
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

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
