import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Bed,
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  User,
  DollarSign,
  AlertCircle,
  FileText,
  Save,
  Search,
  Loader2,
  VenusAndMars,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import {
  guestsAPI,
  roomsAPI,
  bookingsAPI,
  paymentsAPI,
} from "../../services/api";
import { useAuthStore } from "../../store";
import { STRIPE_PUBLISHABLE_KEY } from "../../config";

// Stripe Imports
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Load Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Types
interface GuestInfo {
  FullName: string;
  ICNumber: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
  Gender: "Male" | "Female" | "Other" | "";
}

interface BookingInfo {
  RoomID: number;
  RoomNumber: string;
  RoomType: string;
  PricePerNight: number;
  CheckInDate: string;
  CheckOutDate: string;
  TotalGuests: number;
  NumberOfNights: number;
}

interface PaymentInfo {
  DepositAmount: number;
  PaymentMethod: "Card" | "Cash";
}

type AvailableRoom = {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  description: string;
  imageURL: string | null;
  hotelName: string;
};

// Main Component
export default function WalkInBookingPage() {
  const [activePage, setActivePage] = useState("Walk-in Booking");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Elements stripe={stripePromise}>
      <WalkInBookingContent
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
    </Elements>
  );
}

// Core Content Component
function WalkInBookingContent({
  activePage,
  setActivePage,
  sidebarCollapsed,
  setSidebarCollapsed,
}: {
  activePage: string;
  setActivePage: (page: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    FullName: "",
    ICNumber: "",
    Email: "",
    PhoneNumber: "",
    Address: "",
    Gender: "",
  });

  const [bookingInfo, setBookingInfo] = useState<BookingInfo>({
    RoomID: 0,
    RoomNumber: "",
    RoomType: "",
    PricePerNight: 0,
    CheckInDate: "",
    CheckOutDate: "",
    TotalGuests: 1,
    NumberOfNights: 0,
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    DepositAmount: 0,
    PaymentMethod: "Cash",
  });

  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();
  const hotelId = user?.hotelId;

  // Fetch rooms when dates change
  useEffect(() => {
    if (bookingInfo.CheckInDate && bookingInfo.CheckOutDate) {
      fetchAvailableRooms();
    } else {
      setAvailableRooms([]);
    }
  }, [bookingInfo.CheckInDate, bookingInfo.CheckOutDate]);

  const fetchAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await roomsAPI.getAvailableRooms(
        bookingInfo.CheckInDate,
        bookingInfo.CheckOutDate,
        hotelId
      );
      if (res.success) {
        setAvailableRooms(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleGuestChange = (field: keyof GuestInfo, value: string) => {
    setGuestInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoomSelect = (room: AvailableRoom) => {
    setBookingInfo((prev) => ({
      ...prev,
      RoomID: room.roomId,
      RoomNumber: room.roomNumber,
      RoomType: room.roomType,
      PricePerNight: room.pricePerNight,
    }));

    if (bookingInfo.NumberOfNights > 0) {
      const total = room.pricePerNight * bookingInfo.NumberOfNights;
      setPaymentInfo((p) => ({
        ...p,
        DepositAmount: Number((total * 0.3).toFixed(2)),
      }));
    }
  };

  const handleDateChange = (
    field: "CheckInDate" | "CheckOutDate",
    value: string
  ) => {
    setBookingInfo((prev) => {
      const updated = { ...prev, [field]: value };
      if (updated.CheckInDate && updated.CheckOutDate) {
        const nights = Math.ceil(
          (new Date(updated.CheckOutDate).getTime() -
            new Date(updated.CheckInDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        updated.NumberOfNights = nights > 0 ? nights : 0;

        if (updated.PricePerNight > 0 && updated.NumberOfNights > 0) {
          const total = updated.PricePerNight * updated.NumberOfNights;
          setPaymentInfo((p) => ({
            ...p,
            DepositAmount: Number((total * 0.3).toFixed(2)),
          }));
        }
      }
      return updated;
    });
  };

  const totalAmount = bookingInfo.PricePerNight * bookingInfo.NumberOfNights;
  const balanceDue = totalAmount - paymentInfo.DepositAmount;

  const handleSubmit = async () => {
    if (
      !guestInfo.FullName ||
      !guestInfo.ICNumber ||
      !guestInfo.Email ||
      !guestInfo.PhoneNumber
    ) {
      alert("Please fill in all required guest information fields");
      return;
    }
    if (
      !bookingInfo.RoomID ||
      !bookingInfo.CheckInDate ||
      !bookingInfo.CheckOutDate
    ) {
      alert("Please select a room and booking dates");
      return;
    }
    if (paymentInfo.DepositAmount <= 0) {
      alert("Please enter a valid deposit amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Guest — NOW INCLUDES GENDER
      const guestRes = await guestsAPI.createGuest({
        FullName: guestInfo.FullName,
        ICNumber: guestInfo.ICNumber,
        Email: guestInfo.Email,
        PhoneNumber: guestInfo.PhoneNumber,
        Address: guestInfo.Address || undefined,
        Gender: guestInfo.Gender,
      });
      if (!guestRes.success)
        throw new Error(guestRes.message || "Failed to create guest");
      const guestId = guestRes.data.guestId;

      // 2. Create Booking
      const bookingRes = await bookingsAPI.createBooking({
        GuestID: guestId,
        RoomID: bookingInfo.RoomID,
        CheckInDate: bookingInfo.CheckInDate,
        CheckOutDate: bookingInfo.CheckOutDate,
        TotalGuests: bookingInfo.TotalGuests,
        DepositPaid: 0,
        PaymentMethod: paymentInfo.PaymentMethod,
      });
      if (!bookingRes.success)
        throw new Error(bookingRes.message || "Failed to create booking");
      const bookingId = bookingRes.data.bookingId;

      // 3. Handle Payment
      if (paymentInfo.PaymentMethod === "Cash") {
        await paymentsAPI.processPayment(
          bookingId,
          paymentInfo.DepositAmount,
          "Cash"
        );
        alert("Walk-in booking created successfully! Cash deposit recorded.");
      } else {
        if (!stripe || !elements) {
          alert("Stripe is not loaded.");
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          alert("Card input not ready.");
          return;
        }

        const { clientSecret } = await paymentsAPI.createPaymentIntent(
          bookingId,
          Math.round(paymentInfo.DepositAmount * 100)
        );

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: guestInfo.FullName,
              email: guestInfo.Email,
              phone: guestInfo.PhoneNumber,
            },
          },
        });

        if (result.error) {
          alert("Payment failed: " + result.error.message);
          return;
        }

        await paymentsAPI.confirmStripePayment(
          bookingId,
          paymentInfo.DepositAmount
        );
        alert("Booking & Card Payment Successful!");
      }

      const booking_Id = bookingRes.data.bookingId;
      // 4. Send Confirmation Email
      await bookingsAPI.sendConfirmationEmail(booking_Id);

      // Reset form
      setGuestInfo({
        FullName: "",
        ICNumber: "",
        Email: "",
        PhoneNumber: "",
        Address: "",
        Gender: "Male",
      });
      setBookingInfo({
        RoomID: 0,
        RoomNumber: "",
        RoomType: "",
        PricePerNight: 0,
        CheckInDate: "",
        CheckOutDate: "",
        TotalGuests: 1,
        NumberOfNights: 0,
      });
      setPaymentInfo({ DepositAmount: 0, PaymentMethod: "Cash" });
      elements?.getElement(CardElement)?.clear?.();
    } catch (err: any) {
      alert("Error: " + (err.message || "Something went wrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRooms = availableRooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.roomType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || room.roomType === selectedType;
    const matchesMinPrice = minPrice === null || room.pricePerNight >= minPrice;
    const matchesMaxPrice = maxPrice === null || room.pricePerNight <= maxPrice;
    return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice;
  });

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
        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 shadow-sm">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Walk-in Guest Booking
                </h1>
                <p className="text-sm text-gray-500">
                  Quick booking for walk-in guests
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Guest Information
                    </h2>
                    <p className="text-xs text-gray-500">
                      Enter guest personal details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={guestInfo.FullName}
                        onChange={(e) =>
                          handleGuestChange("FullName", e.target.value)
                        }
                        placeholder="Enter guest full name"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IC/Passport Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={guestInfo.ICNumber}
                        onChange={(e) =>
                          handleGuestChange("ICNumber", e.target.value)
                        }
                        placeholder="e.g., 920318-10-5432"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <VenusAndMars
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <select
                        value={guestInfo.Gender}
                        onChange={(e) =>
                          handleGuestChange("Gender", e.target.value)
                        }
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none appearance-none bg-white text-gray-900"
                        required
                      >
                        <option value="" disabled selected hidden>
                          Select gender
                        </option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {/* Little dropdown arrow */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="tel"
                        value={guestInfo.PhoneNumber}
                        onChange={(e) =>
                          handleGuestChange("PhoneNumber", e.target.value)
                        }
                        placeholder="+60123456789"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="email"
                        value={guestInfo.Email}
                        onChange={(e) =>
                          handleGuestChange("Email", e.target.value)
                        }
                        placeholder="guest@email.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address (Optional)
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <textarea
                        value={guestInfo.Address}
                        onChange={(e) =>
                          handleGuestChange("Address", e.target.value)
                        }
                        placeholder="Enter full address"
                        rows={2}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* === REST OF YOUR CODE IS 100% UNCHANGED BELOW === */}
              {/* Booking Dates */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Booking Details
                    </h2>
                    <p className="text-xs text-gray-500">
                      Select check-in and check-out dates
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-In Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="date"
                        value={bookingInfo.CheckInDate}
                        onChange={(e) =>
                          handleDateChange("CheckInDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-Out Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="date"
                        value={bookingInfo.CheckOutDate}
                        onChange={(e) =>
                          handleDateChange("CheckOutDate", e.target.value)
                        }
                        min={
                          bookingInfo.CheckInDate ||
                          new Date().toISOString().split("T")[0]
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guests <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="number"
                        value={bookingInfo.TotalGuests}
                        onChange={(e) =>
                          setBookingInfo((prev) => ({
                            ...prev,
                            TotalGuests: parseInt(e.target.value) || 1,
                          }))
                        }
                        min="1"
                        max="10"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {bookingInfo.NumberOfNights > 0 && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-900">
                      <span className="font-semibold">
                        {bookingInfo.NumberOfNights} night(s)
                      </span>{" "}
                      selected
                      {bookingInfo.PricePerNight > 0 && (
                        <span>
                          {" "}
                          • Total:{" "}
                          <span className="font-bold">
                            RM {totalAmount.toFixed(2)}
                          </span>
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Available Rooms */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Bed className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Available Rooms
                    </h2>
                    <p className="text-xs text-gray-500">
                      Select a room for the guest
                    </p>
                  </div>
                </div>

                <div className="mb-5 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Search room..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                    </div>

                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    >
                      <option value="">All Room Types</option>
                      {Array.from(
                        new Set(availableRooms.map((r) => r.roomType))
                      ).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="RM Min"
                        value={minPrice ?? ""}
                        onChange={(e) =>
                          setMinPrice(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                      <span className="text-gray-500">—</span>
                      <input
                        type="number"
                        placeholder="RM Max"
                        value={maxPrice ?? ""}
                        onChange={(e) =>
                          setMaxPrice(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedType("");
                        setMinPrice(null);
                        setMaxPrice(null);
                      }}
                      className="px-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-shirt font-medium transition"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {loadingRooms ? (
                    <div className="col-span-2 text-center py-8">
                      <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-3" />
                      <p className="text-gray-500">
                        Loading available rooms...
                      </p>
                    </div>
                  ) : filteredRooms.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <Bed className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        No rooms match your filters
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting the filters
                      </p>
                    </div>
                  ) : (
                    filteredRooms.map((room) => (
                      <div
                        key={room.roomId}
                        onClick={() => handleRoomSelect(room)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                          bookingInfo.RoomID === room.roomId
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900">
                              Room {room.roomNumber}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {room.roomType}
                            </p>
                          </div>
                          {bookingInfo.RoomID === room.roomId && (
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {room.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            RM {room.pricePerNight.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">/night</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Payment */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Payment</h2>
                    <p className="text-xs text-gray-500">Deposit collection</p>
                  </div>
                </div>

                {totalAmount > 0 ? (
                  <>
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="font-bold text-gray-900">
                            RM {totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-sky-200">
                          <span className="text-gray-600">Deposit (30%)</span>
                          <span className="font-medium text-gray-700">
                            RM {(totalAmount * 0.3).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deposit Amount (RM){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={totalAmount}
                          value={paymentInfo.DepositAmount}
                          onChange={(e) =>
                            setPaymentInfo((prev) => ({
                              ...prev,
                              DepositAmount: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Cash", "Card"].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() =>
                              setPaymentInfo((prev) => ({
                                ...prev,
                                PaymentMethod: method as "Cash" | "Card",
                              }))
                            }
                            className={`p-2.5 border-2 rounded-lg transition text-sm font-medium ${
                              paymentInfo.PaymentMethod === method
                                ? "border-amber-600 bg-amber-50 text-amber-900"
                                : "border-gray-200 hover:border-amber-300 bg-white text-gray-700"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>

                      {paymentInfo.PaymentMethod === "Card" && (
                        <div className="mt-4 p-4 border-2 border-amber-200 rounded-lg bg-amber-50">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Details
                          </label>
                          <div className="p-4 bg-white rounded-lg border border-gray-300">
                            <CardElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: "16px",
                                    color: "#1f2937",
                                    "::placeholder": { color: "#9ca3af" },
                                  },
                                },
                                hidePostalCode: true,
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Your card is secure and never stored.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-amber-50 rounded-lg p-3 mb-4">
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Balance Due</span>
                          <span className="font-bold text-amber-600">
                            RM {balanceDue.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          To be paid at check-out
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      {isSubmitting ? "Processing..." : "Create Booking"}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Select dates and room to view payment details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
