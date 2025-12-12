// src/pages/staff/WalkInBookingPage.tsx
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
import { useLocation } from "react-router-dom";

// Stripe Imports
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface GuestInfo {
  FullName: string;
  ICNumber: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
  Gender: "Male" | "Female" | "Other" | "";
}

interface BookingInfo {
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
  const [selectedRooms, setSelectedRooms] = useState<AvailableRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const location = useLocation();

  const { user } = useAuthStore();
  const hotelId = user?.hotelId;

  // Fetch rooms when dates change
  useEffect(() => {
    if (bookingInfo.CheckInDate && bookingInfo.CheckOutDate) {
      fetchAvailableRooms();
    } else {
      setAvailableRooms([]);
      setSelectedRooms([]);
    }

    if (location.state?.guestInfo) {
      const info = location.state.guestInfo;
      setGuestInfo({
        FullName: info.FullName || "",
        ICNumber: info.ICNumber || "",
        Email: info.Email || "",
        PhoneNumber: info.PhoneNumber || "",
        Address: info.Address || "",
        Gender: info.Gender || "",
      });
    }
  }, [bookingInfo.CheckInDate, bookingInfo.CheckOutDate, location.state]);

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
    const errorKey = field.toLowerCase();
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
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
      }
      return updated;
    });

    // Recalculate deposit
    if (bookingInfo.CheckInDate && bookingInfo.CheckOutDate) {
      const total = selectedRooms.reduce(
        (sum, room) => sum + room.pricePerNight * bookingInfo.NumberOfNights,
        0
      );
      setPaymentInfo((p) => ({
        ...p,
        DepositAmount: Number((total * 0.2).toFixed(2)),
      }));
    }

    const errorKey = field.toLowerCase();
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const handleGuestsChange = (value: number) => {
    setBookingInfo((prev) => ({
      ...prev,
      TotalGuests: value,
    }));
    if (errors.totalguests) {
      setErrors((prev) => ({ ...prev, totalguests: "" }));
    }
  };

  const handleDepositChange = (value: number) => {
    setPaymentInfo((prev) => ({
      ...prev,
      DepositAmount: value,
    }));
    if (errors.depositamount) {
      setErrors((prev) => ({ ...prev, depositamount: "" }));
    }
  };

  // Toggle room selection
  const toggleRoom = (room: AvailableRoom) => {
    setSelectedRooms((prev) => {
      const exists = prev.find((r) => r.roomId === room.roomId);
      if (exists) {
        return prev.filter((r) => r.roomId !== room.roomId);
      }
      return [...prev, room];
    });

    // Recalculate deposit
    const total =
      selectedRooms.reduce(
        (sum, r) => sum + r.pricePerNight * bookingInfo.NumberOfNights,
        0
      ) +
      room.pricePerNight * bookingInfo.NumberOfNights;
    setPaymentInfo((p) => ({
      ...p,
      DepositAmount: Number((total * 0.2).toFixed(2)),
    }));

    if (errors.room) {
      setErrors((prev) => ({ ...prev, room: "" }));
    }
  };

  const totalAmount = selectedRooms.reduce(
    (sum, room) => sum + room.pricePerNight * bookingInfo.NumberOfNights,
    0
  );
  const balanceDue = totalAmount - paymentInfo.DepositAmount;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!guestInfo.FullName.trim())
      newErrors.fullname = "Full name is required";
    if (!guestInfo.ICNumber || !/^\d{12}$/.test(guestInfo.ICNumber))
      newErrors.icnumber = "IC Number must be 12 digits";
    if (!guestInfo.Gender) newErrors.gender = "Gender is required";
    if (!guestInfo.Email || !/^\S+@\S+\.\S+$/.test(guestInfo.Email))
      newErrors.email = "Valid email required";
    if (!guestInfo.PhoneNumber) newErrors.phonenumber = "Phone number required";

    if (!bookingInfo.CheckInDate)
      newErrors.checkindate = "Check-in date is required";
    if (!bookingInfo.CheckOutDate)
      newErrors.checkoutdate = "Check-out date is required";
    if (bookingInfo.NumberOfNights <= 0)
      newErrors.checkoutdate = "Check-out must be after check-in";
    if (bookingInfo.TotalGuests < 1)
      newErrors.totalguests = "At least 1 guest is required";
    if (selectedRooms.length === 0)
      newErrors.room = "Please select at least one room";
    if (paymentInfo.DepositAmount <= 0)
      newErrors.depositamount = "Deposit must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkExistingGuest = async (): Promise<{
    exists: boolean;
    guestId?: string;
    fullName?: string;
  }> => {
    if (!guestInfo.ICNumber && !guestInfo.Email) return { exists: false };

    try {
      const response = await guestsAPI.getAllGuests(hotelId!, {
        searchQuery: guestInfo.ICNumber || guestInfo.Email,
      });

      if (response.success && response.data.length > 0) {
        const matchedGuest = response.data.find(
          (g: any) =>
            g.icNumber === guestInfo.ICNumber ||
            g.email.toLowerCase() === guestInfo.Email.toLowerCase()
        );

        if (matchedGuest) {
          return {
            exists: true,
            guestId: matchedGuest.guestId,
            fullName: matchedGuest.fullName,
          };
        }
      }
    } catch (err) {
      console.warn("Could not check existing guest");
    }

    return { exists: false };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    let guestId: string;
    let guestMessage = "";

    try {
      const {
        exists,
        guestId: existingId,
        fullName,
      } = await checkExistingGuest();

      if (exists && existingId) {
        guestId = existingId;
        guestMessage = `Guest already registered! Using existing profile: ${fullName}`;
        alert(guestMessage);
      } else {
        const guestRes = await guestsAPI.createGuest({
          FullName: guestInfo.FullName,
          ICNumber: guestInfo.ICNumber,
          Email: guestInfo.Email,
          PhoneNumber: guestInfo.PhoneNumber,
          Address: guestInfo.Address || undefined,
          Gender: guestInfo.Gender || "Other",
        });

        if (!guestRes.success)
          throw new Error(guestRes.message || "Failed to register guest");

        guestId = guestRes.data.guestId;
        guestMessage = `New guest registered: ${guestRes.data.fullName}`;
        alert(guestMessage);
      }

      // Multi-room booking
      const roomIds = selectedRooms.map((r) => r.roomId);

      const bookingRes = await bookingsAPI.createBooking({
        GuestID: guestId,
        RoomIDs: roomIds, // Now array!
        CheckInDate: bookingInfo.CheckInDate,
        CheckOutDate: bookingInfo.CheckOutDate,
        TotalGuests: bookingInfo.TotalGuests,
        DepositPaid: paymentInfo.DepositAmount,
        PaymentMethod: paymentInfo.PaymentMethod,
      });

      if (!bookingRes.success)
        throw new Error(bookingRes.message || "Booking failed");

      alert(
        `Success! ${selectedRooms.length} room(s) booked!\n` +
          `Total: RM ${totalAmount.toFixed(2)}\n` +
          `Deposit: RM ${paymentInfo.DepositAmount.toFixed(2)}`
      );

      // Reset form
      setGuestInfo({
        FullName: "",
        ICNumber: "",
        Email: "",
        PhoneNumber: "",
        Address: "",
        Gender: "",
      });
      setBookingInfo({
        CheckInDate: "",
        CheckOutDate: "",
        TotalGuests: 1,
        NumberOfNights: 0,
      });
      setSelectedRooms([]);
      setPaymentInfo({ DepositAmount: 0, PaymentMethod: "Cash" });
      elements?.getElement(CardElement)?.clear();
    } catch (err: any) {
      console.error("Booking error:", err);
      alert(
        "Error: " + (err.message || "Something went wrong. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRooms = availableRooms
    .filter(
      (room) =>
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomType.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((room) => !selectedType || room.roomType === selectedType)
    .filter((room) => minPrice === null || room.pricePerNight >= minPrice)
    .filter((room) => maxPrice === null || room.pricePerNight <= maxPrice);

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
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${
                          errors.fullname ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.fullname && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.fullname}
                      </p>
                    )}
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
                          handleGuestChange(
                            "ICNumber",
                            e.target.value.replace(/\D/g, "").slice(0, 12)
                          )
                        }
                        placeholder="e.g., 920318105432"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${
                          errors.icnumber ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.icnumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.icnumber}
                      </p>
                    )}
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
                        className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none appearance-none bg-white text-gray-900 ${
                          errors.gender ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      >
                        <option value="" disabled>
                          Select gender
                        </option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
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
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.gender}
                      </p>
                    )}
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
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${
                          errors.phonenumber
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.phonenumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.phonenumber}
                      </p>
                    )}
                  </div>

                  <div>
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
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.email}
                      </p>
                    )}
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
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${
                          errors.checkindate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.checkindate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.checkindate}
                      </p>
                    )}
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
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${
                          errors.checkoutdate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.checkoutdate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.checkoutdate}
                      </p>
                    )}
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
                          handleGuestsChange(parseInt(e.target.value) || 1)
                        }
                        min="1"
                        max="10"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${
                          errors.totalguests
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.totalguests && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.totalguests}
                      </p>
                    )}
                  </div>
                </div>

                {bookingInfo.NumberOfNights > 0 && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-900">
                      <span className="font-semibold">
                        {bookingInfo.NumberOfNights} night(s)
                      </span>{" "}
                      selected
                      {selectedRooms.length > 0 && (
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
                      Available Rooms ({selectedRooms.length} selected)
                    </h2>
                    <p className="text-xs text-gray-500">
                      Click to select multiple rooms
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
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
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
                    filteredRooms.map((room) => {
                      const isSelected = selectedRooms.some(
                        (r) => r.roomId === room.roomId
                      );
                      return (
                        <div
                          key={room.roomId}
                          onClick={() => toggleRoom(room)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                            isSelected
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
                            {isSelected && (
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
                            <span className="text-xs text-gray-500">
                              /night
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {errors.room && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.room}
                  </p>
                )}
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

                {selectedRooms.length > 0 ? (
                  <>
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 mb-4">
                      <div className="space-y-2 text-sm">
                        {selectedRooms.map((room) => (
                          <div
                            key={room.roomId}
                            className="flex justify-between"
                          >
                            <span>
                              Room {room.roomNumber} ×{" "}
                              {bookingInfo.NumberOfNights} nights
                            </span>
                            <span>
                              RM{" "}
                              {(
                                room.pricePerNight * bookingInfo.NumberOfNights
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-sky-200">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="font-bold text-gray-900">
                            RM {totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deposit (20%)</span>
                          <span className="font-medium text-gray-700">
                            RM {(totalAmount * 0.2).toFixed(2)}
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
                            handleDepositChange(parseFloat(e.target.value) || 0)
                          }
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-semibold ${
                            errors.depositamount
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          required
                        />
                      </div>
                      {errors.depositamount && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.depositamount}
                        </p>
                      )}
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
                      {isSubmitting
                        ? "Processing..."
                        : `Create Booking (${selectedRooms.length} room${
                            selectedRooms.length > 1 ? "s" : ""
                          })`}
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
