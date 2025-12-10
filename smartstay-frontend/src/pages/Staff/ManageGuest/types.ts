export interface Guest {
  guestId: string;
  fullName: string;
  icNumber: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  createdAt: string;
  totalBookings: number;
  totalSpent?: number;
  lastBookingDate: string | null;
  isActive: boolean;
  hasAccount: boolean;
  bookingHistory: Booking[];
  uploadedDocuments: Document[];
  reviews: Review[];
}

export interface Booking {
  bookingId: number;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: number;
  depositAmount: number;
  totalPaid?: number;
  bookingStatus: "Pending" | "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled";
  createdAt: string;
}

export interface Document {
  documentId: number;
  fileName: string;
  fileUrl: string;
  documentType: string;
  uploadDate: string;
  status: "Pending" | "Verified";
}

export interface Review {
  reviewId: number;
  bookingId: number;
  hotelName: string;
  roomNumber: string;
  roomType: string;
  rating: number;
  comment: string | null;
  reviewDate: string;
}