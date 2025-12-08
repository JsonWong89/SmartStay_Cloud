import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import { guestsAPI, bookingsAPI, documentsAPI, reviewsAPI } from "../../../services/api";
import { useAuthStore } from "../../../store";
import { useNavigate } from "react-router-dom";

import GuestListView from "./GuestListView";
import GuestDetailsView from "./GuestDetailsView";
import { Guest } from "./types";

export default function GuestManagementPage() {
  const [activePage] = useState("Manage Guests");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active">("all");
  const [filterMinBookings, setFilterMinBookings] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "details">("list");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "bookings" | "spent" | "recent">("name");

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const hotelId = user?.hotelId || 1;

  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      try {
        const response = await guestsAPI.getAllGuests(hotelId, {
          status: filterStatus === "active" ? "active" : undefined,
          minBookings: filterMinBookings === "" ? undefined : Number(filterMinBookings),
          searchQuery: searchQuery || undefined,
        });

        if (response.success) {
          setGuests(
            response.data.map((g) => ({
              ...g,
              bookingHistory: [],
              uploadedDocuments: [],
              reviews: [],
            }))
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to load guests");
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, [searchQuery, filterStatus, filterMinBookings]);

  const handleViewDetails = async (guest: Guest) => {
    setLoading(true);
    try {
      // Fetch bookings
      const bookingsRes = await bookingsAPI.getAllBookings({ hotelId, guestId: guest.guestId });
      const bookingHistory = bookingsRes.success
        ? bookingsRes.data.map((b: any) => ({
            bookingId: b.bookingId,
            roomNumber: b.room.roomNumber,
            roomType: b.room.roomType,
            checkInDate: b.checkInDate.split("T")[0],
            checkOutDate: b.checkOutDate.split("T")[0],
            totalGuests: b.totalGuests,
            totalAmount: b.totalAmount,
            depositAmount: b.depositAmount,
            bookingStatus: b.bookingStatus,
            createdAt: b.createdAt,
          }))
        : [];

      // Fetch documents
      const docsRes = await documentsAPI.getDocumentsByGuestId(guest.guestId);
      const uploadedDocuments = docsRes.success
        ? docsRes.data.map((d: any) => ({
            documentId: d.documentId,
            fileName: d.fileName,
            fileUrl: d.fileUrl,
            documentType: d.documentType,
            uploadDate: d.uploadDate.split("T")[0],
            status: d.status,
          }))
        : [];

      // Fetch reviews
      const reviewsRes = await reviewsAPI.getReviewsByGuestId(guest.guestId);
      const reviews = reviewsRes.success
        ? reviewsRes.data.map((r: any) => ({
            reviewId: r.reviewId,
            bookingId: r.bookingId,
            hotelName: r.hotelName,
            roomNumber: r.roomNumber,
            roomType: r.roomType,
            rating: r.rating,
            comment: r.comment,
            reviewDate: r.reviewDate.split("T")[0],
          }))
        : [];

      setSelectedGuest({
        ...guest,
        bookingHistory,
        uploadedDocuments,
        reviews,
      });
      setCurrentView("details");
    } catch (err) {
      alert("Failed to load guest details");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedGuest(null);
  };

  const handleVerifyDocument = async (docId: number) => {
    if (!confirm("Mark this document as verified?")) return;
    try {
      await documentsAPI.verifyDocument(docId);
      setSelectedGuest((prev) =>
        prev
          ? {
              ...prev,
              uploadedDocuments: prev.uploadedDocuments.map((d) =>
                d.documentId === docId ? { ...d, status: "Verified" } : d
              ),
            }
          : null
      );
      alert("Document verified successfully!");
    } catch (err) {
      alert("Failed to verify document");
    }
  };

  // Filtered & Sorted Guests
  const filteredGuests = guests
    .filter((g) => {
      const matchesStatus = filterStatus === "all" || (filterStatus === "active" && g.isActive);
      const minBookings = filterMinBookings === "" ? 0 : Number(filterMinBookings);
      return matchesStatus && g.totalBookings >= minBookings;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "bookings":
          return b.totalBookings - a.totalBookings;
        case "recent":
          if (!a.lastBookingDate) return 1;
          if (!b.lastBookingDate) return -1;
          return new Date(b.lastBookingDate).getTime() - new Date(a.lastBookingDate).getTime();
        default:
          return a.fullName.localeCompare(b.fullName);
      }
    });

  // Stats
  const stats = {
    total: guests.length,
    active: guests.filter((g) => g.isActive).length,
    registered: guests.filter((g) => g.hasAccount).length,
    newThisMonth: guests.filter((g) => {
      const created = new Date(g.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
  };

  const exportToCSV = () => {
    const headers = ["Guest ID", "Name", "Email", "Phone", "IC Number", "Total Bookings", "Last Booking", "Member Since"];
    const rows = filteredGuests.map((g) => [
      g.guestId,
      g.fullName,
      g.email,
      g.phoneNumber,
      g.icNumber,
      g.totalBookings,
      g.lastBookingDate ? new Date(g.lastBookingDate).toLocaleDateString("en-MY") : "N/A",
      new Date(g.createdAt).toLocaleDateString("en-MY"),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guests_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading && currentView === "list") {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-lg text-gray-600">Loading guests...</div>
      </div>
    );
  }

  if (error && currentView === "list") {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePage={activePage} setActivePage={() => {}} setSidebarCollapsed={setSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-[230px]"}`}>
        {currentView === "list" ? (
          <GuestListView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterMinBookings={filterMinBookings}
            setFilterMinBookings={setFilterMinBookings}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filteredGuests={filteredGuests}
            stats={stats}
            onViewDetails={handleViewDetails}
            exportToCSV={exportToCSV}
          />
        ) : (
          <GuestDetailsView
            guest={selectedGuest!}
            onBack={handleBackToList}
            onVerifyDocument={handleVerifyDocument}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}