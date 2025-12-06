import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../../components/Sidebar";
import { bookingsAPI, paymentsAPI } from "../../../services/api";
import { Booking } from "./types";
import ReservationListPage from "./ReservationListPage";
import ReservationDetailsPage from "./ReservationDetailsPage";
import { useAuthStore } from "../../../store";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function ReservationManagement() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "details">("list");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const hotelId = user?.hotelId;

  // Fetch all bookings with payments
  const fetchBookings = useCallback(async () => {
    if (!hotelId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await bookingsAPI.getAllBookings({ hotelId });
      if (!res.success || !res.data) throw new Error("Failed to load bookings");

      const bookingsWithPayments = await Promise.all(
        res.data.map(async (b: any) => {
          try {
            const detail = await bookingsAPI.getBookingById(b.bookingId);
            return detail.success ? detail.data : b;
          } catch (err) {
            console.warn(`Payments failed for booking ${b.bookingId}`, err);
            return b;
          }
        })
      );

      const mapped: Booking[] = bookingsWithPayments.map((b: any) => ({
        bookingId: b.bookingId,
        guest: {
          fullName: b.guest.fullName,
          icNumber: b.guest.icNumber || "-",
          email: b.guest.email,
          phoneNumber: b.guest.phoneNumber,
          address: b.guest.address || "-",
          gender: b.guest.gender,
        },
        room: {
          roomNumber: b.room.roomNumber,
          roomType: b.room.roomType,
          pricePerNight: b.room.pricePerNight,
          status: b.room.status || "Available",
        },
        checkInDate: b.checkInDate.split("T")[0],
        checkOutDate: b.checkOutDate.split("T")[0],
        totalGuests: b.totalGuests,
        totalAmount: b.totalAmount,
        depositAmount: b.depositAmount,
        bookingStatus: b.bookingStatus,
        createdAt: b.createdAt.split("T")[0],
        numberOfNights: b.numberOfNights,
        payments: (b.payments || []).map((p: any) => ({
          paymentId: p.paymentId,
          amount: p.amount,
          paymentDate: p.paymentDate.split("T")[0],
          paymentMethod: p.paymentMethod,
          status: p.status,
        })),
        totalPaid: b.totalPaid || 0,
        pendingAmount: b.pendingAmount || b.totalAmount,
      }));

      setBookings(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  // Load on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Open booking details with fresh data
  const openBookingDetails = useCallback(
    async (id: number) => {
      if (!hotelId) return;

      try {
        setLoading(true);

        const [clickedRes, allRes] = await Promise.all([
          bookingsAPI.getBookingById(id),
          bookingsAPI.getAllBookings({ hotelId }),
        ]);

        if (!clickedRes.success || !allRes.success) {
          throw new Error("Failed to load booking details");
        }

        const clicked = clickedRes.data;
        const allRelated = allRes.data.filter((b: any) => {
          const inDate =
            b.checkInDate.split("T")[0] === clicked.checkInDate.split("T")[0];
          const outDate =
            b.checkOutDate.split("T")[0] === clicked.checkOutDate.split("T")[0];
          return b.guest.email === clicked.guest.email && inDate && outDate;
        });

        const activeRelated = allRelated.filter(
          (b: any) => b.bookingStatus !== "Cancelled"
        );
        if (activeRelated.length === 0)
          throw new Error("No active rooms found");

        const mainData =
          activeRelated.find((b: any) => b.payments?.length > 0) ||
          activeRelated[0];

        const booking: Booking = {
          bookingId: mainData.bookingId,
          guest: mainData.guest,
          room: mainData.room,
          checkInDate: mainData.checkInDate.split("T")[0],
          checkOutDate: mainData.checkOutDate.split("T")[0],
          totalGuests: mainData.totalGuests,
          totalAmount: mainData.totalAmount,
          depositAmount: mainData.depositAmount,
          bookingStatus: mainData.bookingStatus,
          createdAt: mainData.createdAt.split("T")[0],
          numberOfNights: mainData.numberOfNights,
          payments: mainData.payments || [],
          totalPaid: mainData.totalPaid || 0,
          pendingAmount: mainData.pendingAmount || mainData.totalAmount,
        };

        setSelectedBooking(booking);
        setCurrentView("details");
      } catch (err: any) {
        alert(err.message || "Error loading booking");
        setCurrentView("list");
      } finally {
        setLoading(false);
      }
    },
    [hotelId]
  );

  const goBackToList = useCallback(() => {
    setCurrentView("list");
    setSelectedBooking(null);
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (
    id: number,
    status: Booking["bookingStatus"]
  ) => {
    try {
      await bookingsAPI.updateBookingStatus(id, status);

      if (status === "CheckedIn") await bookingsAPI.sendCheckIn(id);
      if (status === "CheckedOut") await bookingsAPI.sendCheckOut(id);

      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === id ? { ...b, bookingStatus: status } : b
        )
      );

      if (selectedBooking?.bookingId === id) {
        setSelectedBooking((prev) =>
          prev ? { ...prev, bookingStatus: status } : null
        );
      }

      if (status === "CheckedIn" || status === "CheckedOut") {
        alert(
          `Guest ${
            status === "CheckedIn" ? "checked in" : "checked out"
          } successfully!`
        );
      }
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    }
  };

  const processPayment = async (
    bookingId: number,
    amount: number,
    method: string
  ) => {
    try {
      const res = await paymentsAPI.processPayment(bookingId, amount, method);
      if (!res.success) throw new Error(res.message || "Payment failed");

      const newPayment = {
        paymentId: res.data.paymentId,
        amount,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: method,
        status: "Completed" as const,
      };

      // Update bookings state
      setBookings((prev) =>
        prev.map((b) => {
          if (
            selectedBooking &&
            b.guest.email === selectedBooking.guest.email &&
            b.checkInDate === selectedBooking.checkInDate &&
            b.checkOutDate === selectedBooking.checkOutDate
          ) {
            return {
              ...b,
              totalPaid: b.totalPaid + amount,
              pendingAmount: b.pendingAmount - amount,
              payments:
                b.bookingId === bookingId
                  ? [...b.payments, newPayment]
                  : b.payments,
            };
          }
          return b;
        })
      );

      // Update selected booking
      setSelectedBooking((prev) =>
        prev
          ? {
              ...prev,
              totalPaid: prev.totalPaid + amount,
              pendingAmount: prev.pendingAmount - amount,
              payments:
                prev.bookingId === bookingId
                  ? [...prev.payments, newPayment]
                  : prev.payments,
            }
          : null
      );

      alert("Payment successful!");
    } catch (err: any) {
      alert("Payment failed: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activePage="Reservation"
        setActivePage={() => {}}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-[230px]"
        }`}
      >
        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <RefreshCw className="h-14 w-14 text-sky-600 animate-spin mx-auto mb-6" />
              <p className="text-xl font-semibold text-gray-800">
                Loading Reservations
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Fetching latest data...
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-red-100">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Oops! Something went wrong
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchBookings}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && currentView === "list" && (
          <ReservationListPage
            bookings={bookings}
            openBookingDetails={openBookingDetails}
            refreshBookings={fetchBookings}
          />
        )}

        {currentView === "details" && selectedBooking && (
          <ReservationDetailsPage
            booking={selectedBooking}
            allBookings={bookings}
            goBack={goBackToList}
            updateBookingStatus={updateBookingStatus}
            processPayment={processPayment}
            refreshDetails={(id?: number) =>
              openBookingDetails(id || selectedBooking.bookingId)
            }
            refreshList={fetchBookings}
          />
        )}
      </div>
    </div>
  );
}
