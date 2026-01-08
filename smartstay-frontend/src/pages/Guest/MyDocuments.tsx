import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import { API_BASE_URL } from "../../config";
import GuestNavbar from "../../components/GuestNavbar";

interface Document {
  documentID: number;
  guestID: string;
  fileName: string;
  fileURL: string;
  documentType: string;
  uploadDate: string;
  status: string;
}

const MyDocuments: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/guest/${user.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }

        const result = await response.json();

        // Handle inconsistent API response structures
        const docs = result.success !== undefined
          ? (result.data || [])
          : (Array.isArray(result) ? result : (result.data || []));

        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800",
      Verified: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      Pending: "⏳",
      Verified: "✓",
      Rejected: "✗",
    };
    return icons[status] || "•";
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ID: "🪪 ID Document",
      Visa: "✈️ Visa",
      EmploymentLetter: "💼 Employment Letter",
      WorkPermit: "📋 Work Permit",
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDocument = (documentId: number) => {
    // Open the view endpoint in a new tab
    // The backend will generate a signed S3 URL and redirect the browser to it
    window.open(`${API_BASE_URL}/api/documents/view/${documentId}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestNavbar />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">My Documents</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage your uploaded documents
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
            <div className="text-xl text-gray-600">
              Loading your documents...
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-xl text-gray-600 mb-4">
              No documents uploaded yet
            </p>
            <p className="text-gray-500 mb-6">
              Documents will be uploaded when you make a booking
            </p>
            <button
              onClick={() => navigate("/guest/search")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition"
            >
              Search for Rooms
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div
                key={document.documentID}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {getDocumentTypeLabel(document.documentType)}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            document.status
                          )}`}
                        >
                          {getStatusIcon(document.status)} {document.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">File Name:</span>{" "}
                          {document.fileName}
                        </p>
                        <p>
                          <span className="font-medium">Uploaded:</span>{" "}
                          {formatDate(document.uploadDate)}
                        </p>
                        <p>
                          <span className="font-medium">Document ID:</span> #
                          {document.documentID}
                        </p>
                      </div>

                      {document.status === "Rejected" && (
                        <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                          <p className="text-sm text-red-700">
                            <strong>Rejected:</strong> Please upload a valid
                            document or contact support for assistance.
                          </p>
                        </div>
                      )}

                      {document.status === "Verified" && (
                        <div className="mt-3 bg-green-50 border-l-4 border-green-500 p-3 rounded">
                          <p className="text-sm text-green-700">
                            <strong>Verified:</strong> Your document has been
                            approved.
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        handleViewDocument(document.documentID)
                      }
                      className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDocuments;
