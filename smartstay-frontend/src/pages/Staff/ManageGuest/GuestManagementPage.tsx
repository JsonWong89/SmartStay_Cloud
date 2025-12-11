import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../../components/Sidebar";
import { guestsAPI, bookingsAPI, documentsAPI, reviewsAPI } from "../../../services/api";
import { useAuthStore } from "../../../store";
import { useNavigate } from "react-router-dom";
import GuestListView from "./GuestListView";
import GuestDetailsView from "./GuestDetailsView";
import EditGuestView from "./EditGuestView";
import { Guest } from "./types";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function GuestManagementPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active">("all");
  const [filterMinBookings, setFilterMinBookings] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "details" | "edit">("list");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "bookings" | "spent" | "recent">("name");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);        // Main loading (initial + refresh)
  const [contentLoading, setContentLoading] = useState(false); // For details/edit transitions
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const hotelId = user?.hotelId || 1;

  // Fetch guests list
  const fetchGuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await guestsAPI.getAllGuests(hotelId, {
        status: filterStatus === "active" ? "active" : undefined,
        minBookings: filterMinBookings === "" ? undefined : Number(filterMinBookings),
        searchQuery: searchQuery || undefined,
      });

      if (response.success) {
        setGuests(
          response.data.map((g: any) => ({
            ...g,
            bookingHistory: [],
            uploadedDocuments: [],
            reviews: [],
          }))
        );
      } else {
        throw new Error("Failed to fetch guests");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load guests");
    } finally {
      setLoading(false);
    }
  }, [hotelId, searchQuery, filterStatus, filterMinBookings]);

  // Initial load
  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // View guest details with full data
  const handleViewDetails = async (guest: Guest) => {
    setContentLoading(true);
    try {
      const [bookingsRes, docsRes, reviewsRes] = await Promise.all([
        bookingsAPI.getAllBookings({ hotelId, guestId: guest.guestId }),
        documentsAPI.getDocumentsByGuestId(guest.guestId),
        reviewsAPI.getReviewsByGuestId(guest.guestId),
      ]);

      const bookingHistory = bookingsRes.success ? bookingsRes.data.map((b: any) => ({
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
      })) : [];

      // const uploadedDocuments = docsRes.success ? docsRes.data.map((d: any) => ({
      //   documentId: d.documentId,
      //   fileName: d.fileName,
      //   fileUrl: d.fileUrl,
      //   documentType: d.documentType,
      //   uploadDate: d.uploadDate.split("T")[0],
      //   status: d.status,
      // })) : [];

      // const reviews = reviewsRes.success ? reviewsRes.data.map((r: any) => ({
      //   reviewId: r.reviewId,
      //   bookingId: r.bookingId,
      //   hotelName: r.hotelName,
      //   roomNumber: r.roomNumber,
      //   roomType: r.roomType,
      //   rating: r.rating,
      //   comment: r.comment,
      //   reviewDate: r.reviewDate.split("T")[0],
      // })) : [];

      const uploadedDocuments = docsRes?.success && docsRes.data
  ? docsRes.data.map((d: any) => ({
      documentId: d.documentID,
      fileName: d.fileName,
      fileUrl: d.fileURL,
      documentType: d.documentType,
      uploadDate: d.uploadDate.split("T")[0],
      status: d.status,
    }))
  : [];

      const reviews = Array.isArray(reviewsRes) ? reviewsRes.map((r: any) => ({
        reviewId: r.reviewID,
        bookingId: r.bookingID,
        hotelName: r.hotelName,
        roomNumber: r.roomNumber, 
        roomType: r.roomType,
        rating: r.rating,
        comment: r.comment,
        reviewDate: r.reviewDate.split("T")[0],
      })) : [];

      setSelectedGuest({
        ...guest,
        bookingHistory,
        uploadedDocuments,
        reviews,
      });
      setCurrentView("details");
    } catch (err: any) {
      alert("Failed to load guest details: " + err.message);
    } finally {
      setContentLoading(false);
    }
  };

  const handleEdit = () => setCurrentView("edit");

  const handleSaveEdit = async (updatedData: Partial<Guest>) => {
    setSaving(true);
    try {
      await guestsAPI.updateGuest(selectedGuest!.guestId, hotelId, {
        FullName: updatedData.fullName,
        ICNumber: updatedData.icNumber,
        Email: updatedData.email,
        PhoneNumber: updatedData.phoneNumber,
        Address: updatedData.address,
        Gender: updatedData.gender,
      });

      setSelectedGuest(prev => prev ? { ...prev, ...updatedData } : null);
      setSuccess(true);
      setTimeout(() => {
        setCurrentView("details");
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to update guest");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentView === "edit") setCurrentView("details");
    else if (currentView === "details") {
      setCurrentView("list");
      setSelectedGuest(null);
    }
  };

  const handleVerifyDocument = async (docId: number) => {
    if (!confirm("Mark this document as verified?")) return;
    try {
      await documentsAPI.verifyDocument(docId);
      setSelectedGuest(prev =>
        prev
          ? {
              ...prev,
              uploadedDocuments: prev.uploadedDocuments.map(d =>
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

  // Filtered & sorted guests
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

  const stats = {
    total: guests.length,
    active: guests.filter(g => g.isActive).length,
    registered: guests.filter(g => g.hasAccount).length,
    newThisMonth: guests.filter(g => {
      const created = new Date(g.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
  };

  const exportToCSV = () => {
    const headers = ["Guest ID", "Name", "Email", "Phone", "IC Number", "Total Bookings", "Last Booking", "Member Since"];
    const rows = filteredGuests.map(g => [
      g.guestId,
      g.fullName,
      g.email,
      g.phoneNumber,
      g.icNumber,
      g.totalBookings,
      g.lastBookingDate ? new Date(g.lastBookingDate).toLocaleDateString("en-MY") : "N/A",
      new Date(g.createdAt).toLocaleDateString("en-MY"),
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guests_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Always visible */}
      <Sidebar
        activePage="Manage Guests"
        setActivePage={() => {}}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-[230px]"}`}>
        {/* Global Loading (initial load) */}
        {loading && currentView === "list" && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <RefreshCw className="h-14 w-14 text-sky-600 animate-spin mx-auto mb-6" />
              <p className="text-xl font-semibold text-gray-800">Loading Guests</p>
              <p className="text-sm text-gray-500 mt-2">Fetching latest data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-red-100">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchGuests}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Loading (when opening details) */}
        {contentLoading && currentView !== "list" && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <RefreshCw className="h-14 w-14 text-sky-600 animate-spin mx-auto mb-6" />
              <p className="text-xl font-semibold text-gray-800">Loading Guest Details</p>
              <p className="text-sm text-gray-500 mt-2">Please wait...</p>
            </div>
          </div>
        )}

        {/* Actual Views - Only render when not loading */}
        {!loading && !error && !contentLoading && (
          <>
            {currentView === "list" && (
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
            )}

            {currentView === "details" && selectedGuest && (
              <GuestDetailsView
                guest={selectedGuest}
                onBack={handleBack}
                onVerifyDocument={handleVerifyDocument}
                onEdit={handleEdit}
                navigate={navigate}
              />
            )}

            {currentView === "edit" && selectedGuest && (
              <EditGuestView
                guest={selectedGuest}
                onSave={handleSaveEdit}
                onBack={handleBack}
                saving={saving}
                success={success}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}