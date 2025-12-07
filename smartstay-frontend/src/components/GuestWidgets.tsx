import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

export function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const bgColors: Record<string, string> = {
    purple: "bg-purple-50",
    green: "bg-green-50",
    blue: "bg-blue-50",
    amber: "bg-amber-50",
    emerald: "bg-emerald-50",
  };
  const borderColors: Record<string, string> = {
    purple: "border-l-purple-600",
    green: "border-l-green-600",
    blue: "border-l-blue-600",
    amber: "border-l-amber-600",
    emerald: "border-l-emerald-600",
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border-l-8 ${borderColors[color]}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${bgColors[color]}`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

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
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}