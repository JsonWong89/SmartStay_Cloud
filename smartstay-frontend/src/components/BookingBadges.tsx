import React from "react";

export function ActivityBadge({
  type,
}: {
  type: "Check-In" | "Check-Out" | "Stayover";
}) {
  const styles: Record<string, string> = {
    "Check-In": "bg-green-100 text-green-700",
    "Check-Out": "bg-blue-100 text-blue-700",
    Stayover: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[type]}`}
    >
      {type}
    </span>
  );
}

export function StatusBadge({
  status,
}: {
  status: "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled" | "Pending";
}) {
  const styles: Record<string, string> = {
    Confirmed: "bg-sky-100 text-sky-700",
    CheckedIn: "bg-green-100 text-green-700",
    CheckedOut: "bg-gray-100 text-gray-700",
    Cancelled: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };
  const labels: Record<string, string> = {
    CheckedIn: "Checked In",
    CheckedOut: "Checked Out",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

export function PaymentBadge({
  status,
}: {
  status: "Completed" | "Pending" | "Failed";
}) {
  const styles: Record<string, string> = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Failed: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}