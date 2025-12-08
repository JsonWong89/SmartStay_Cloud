// src/pages/staff/Reservation/ReservationBadges.tsx
import React from "react";

export function BookingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-sky-100 text-sky-700",
    CheckedIn: "bg-green-100 text-green-700",
    CheckedOut: "bg-gray-100 text-gray-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    CheckedIn: "Checked In",
    CheckedOut: "Checked Out",
  };
  return (
    <span
      className={`inline-flex items-center justify-center text-center px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status]
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

export function RoomStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Available: "bg-green-100 text-green-700",
    Occupied: "bg-amber-100 text-amber-700",
    Maintenance: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center justify-center text-center px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status]
      }`}
    >
      {status}
    </span>
  );
}

export function PaymentMethodBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    CreditCard: "bg-blue-100 text-blue-700",
    DebitCard: "bg-indigo-100 text-indigo-700",
    Cash: "bg-green-100 text-green-700",
    OnlineTransfer: "bg-purple-100 text-purple-700",
  };
  const labels: Record<string, string> = {
    CreditCard: "Credit Card",
    DebitCard: "Debit Card",
    OnlineTransfer: "Online Transfer",
  };
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
        styles[method]
      } mb-1`}
    >
      {labels[method] || method}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Failed: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
        styles[status]
      }`}
    >
      {status}
    </span>
  );
}