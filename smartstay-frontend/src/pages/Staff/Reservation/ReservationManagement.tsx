import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import { bookingsAPI, paymentsAPI } from "../../../services/api";
import { Booking } from "./types";
import ReservationListPage from "./ReservationListPage";
import ReservationDetailsPage from "./ReservationDetailsPage";
import { useAuthStore } from "../../../store";

export default function ReservationManagement() {
  const [activePage, setActivePage] = useState("Reservation");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "details">("list");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingsAPI.getAllBookings({
        hotelId: user?.hotelId || 0,
      });
      if (res.success && res.data) {
        const mapped: Booking[] = res.data.map((b: any) => ({
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
          payments: b.payments || [],
          totalPaid: b.totalPaid,
          pendingAmount: b.pendingAmount,
        }));
        setBookings(mapped);
      }
    } catch (err: any) {
      setError("Failed to load reservations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openBookingDetails = async (id: number) => {
    try {
      setLoading(true);
      const res = await bookingsAPI.getBookingById(id);
      if (res.success && res.data) {
        const b = res.data;
        const booking: Booking = {
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
            status: b.room.status,
          },
          checkInDate: b.checkInDate.split("T")[0],
          checkOutDate: b.checkOutDate.split("T")[0],
          totalGuests: b.totalGuests,
          totalAmount: b.totalAmount,
          depositAmount: b.depositAmount,
          bookingStatus: b.bookingStatus,
          createdAt: b.createdAt.split("T")[0],
          numberOfNights: b.numberOfNights,
          payments: b.payments.map((p: any) => ({
            paymentId: p.paymentId,
            amount: p.amount,
            paymentDate: p.paymentDate.split("T")[0],
            paymentMethod: p.paymentMethod,
            status: p.status,
          })),
          totalPaid: b.totalPaid,
          pendingAmount: b.pendingAmount,
        };
        setSelectedBooking(booking);
        setCurrentView("details");
      }
    } catch (err: any) {
      alert("Failed to load booking details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBackToList = () => {
    setCurrentView("list");
    setSelectedBooking(null);
    fetchBookings();
  };

  const updateBookingStatus = async (
    id: number,
    status: Booking["bookingStatus"]
  ) => {
    try {
      await bookingsAPI.updateBookingStatus(id, status);
      if (status === "CheckedIn") {
        await bookingsAPI.sendCheckIn(id);
        alert("Check-In successful and email sent to guest.");
      }

      if (status === "CheckedOut") {
        await bookingsAPI.sendCheckOut(id);
        alert("Check-Out successful and email sent to guest.");
      }
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
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const processPayment = async (
    bookingId: number,
    amount: number,
    method: string
  ) => {
    try {
      const res = await paymentsAPI.processPayment(bookingId, amount, method);
      if (res.success) {
        const newPending = res.data.newPendingAmount;
        setBookings((prev) =>
          prev.map((b) =>
            b.bookingId === bookingId
              ? {
                  ...b,
                  totalPaid: b.totalPaid + amount,
                  pendingAmount: newPending,
                }
              : b
          )
        );
        if (selectedBooking?.bookingId === bookingId) {
          setSelectedBooking((prev) =>
            prev
              ? {
                  ...prev,
                  totalPaid: prev.totalPaid + amount,
                  pendingAmount: newPending,
                  payments: [
                    ...prev.payments,
                    {
                      paymentId: res.data.paymentId,
                      amount,
                      paymentDate: new Date().toISOString().split("T")[0],
                      paymentMethod: method,
                      status: "Completed",
                    },
                  ],
                }
              : null
          );
        }
        alert("Payment processed successfully!");
      }
    } catch (err: any) {
      alert("Payment failed: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-[230px]"
        }`}
      >
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg font-medium text-gray-600">
              Loading reservations...
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-6 text-center text-red-600 font-medium">
            {error}
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
            goBack={goBackToList}
            updateBookingStatus={updateBookingStatus}
            processPayment={processPayment}
          />
        )}
      </div>
    </div>
  );
}
