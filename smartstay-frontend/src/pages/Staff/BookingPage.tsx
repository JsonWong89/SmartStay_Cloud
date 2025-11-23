import React, { useState } from "react";
import { 
  UserPlus, Bed, Calendar, Users, CreditCard, 
  CheckCircle, Mail, Phone, MapPin, User, DollarSign,
  AlertCircle, FileText, Save
} from "lucide-react";
import Sidebar from "../../components/Sidebar";

// TypeScript Interfaces
interface GuestInfo {
  FullName: string;
  ICNumber: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
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
  PaymentMethod: "CreditCard" | "DebitCard" | "Cash" | "OnlineTransfer";
}

interface Room {
  RoomID: number;
  RoomNumber: string;
  RoomType: string;
  PricePerNight: number;
  Status: "Available" | "Occupied" | "Maintenance";
  Description: string;
}



// Main Component
export default function WalkInBookingPage() {
  const [activePage, setActivePage] = useState("Walk-in Booking");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    FullName: "",
    ICNumber: "",
    Email: "",
    PhoneNumber: "",
    Address: ""
  });
  const [bookingInfo, setBookingInfo] = useState<BookingInfo>({
    RoomID: 0,
    RoomNumber: "",
    RoomType: "",
    PricePerNight: 0,
    CheckInDate: "",
    CheckOutDate: "",
    TotalGuests: 1,
    NumberOfNights: 0
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    DepositAmount: 0,
    PaymentMethod: "Cash"
  });

  // Mock available rooms
  const [availableRooms] = useState<Room[]>([
    {
      RoomID: 101,
      RoomNumber: "101",
      RoomType: "Standard Room",
      PricePerNight: 150.00,
      Status: "Available",
      Description: "Comfortable room with queen bed, AC, TV, and WiFi"
    },
    {
      RoomID: 205,
      RoomNumber: "205",
      RoomType: "Deluxe Suite",
      PricePerNight: 300.00,
      Status: "Available",
      Description: "Spacious suite with king bed, living area, and city view"
    },
    {
      RoomID: 310,
      RoomNumber: "310",
      RoomType: "Family Room",
      PricePerNight: 250.00,
      Status: "Available",
      Description: "Large room with 2 queen beds, perfect for families"
    },
    {
      RoomID: 405,
      RoomNumber: "405",
      RoomType: "Executive Suite",
      PricePerNight: 450.00,
      Status: "Available",
      Description: "Premium suite with separate bedroom, dining area, and balcony"
    }
  ]);

  const handleGuestChange = (field: keyof GuestInfo, value: string) => {
    setGuestInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleRoomSelect = (room: Room) => {
    setBookingInfo(prev => ({
      ...prev,
      RoomID: room.RoomID,
      RoomNumber: room.RoomNumber,
      RoomType: room.RoomType,
      PricePerNight: room.PricePerNight
    }));

    // Auto-calculate deposit when room is selected
    if (bookingInfo.NumberOfNights > 0) {
      const totalAmount = room.PricePerNight * bookingInfo.NumberOfNights;
      const calculatedDeposit = (totalAmount * 30) / 100;
      setPaymentInfo(curr => ({ ...curr, DepositAmount: calculatedDeposit }));
    }
  };

  const handleDateChange = (field: 'CheckInDate' | 'CheckOutDate', value: string) => {
    setBookingInfo(prev => {
      const updated = { ...prev, [field]: value };
      
      // Calculate number of nights
      if (updated.CheckInDate && updated.CheckOutDate) {
        const checkIn = new Date(updated.CheckInDate);
        const checkOut = new Date(updated.CheckOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        updated.NumberOfNights = nights > 0 ? nights : 0;

        // Auto-calculate deposit when dates change
        if (updated.PricePerNight > 0 && updated.NumberOfNights > 0) {
          const totalAmount = updated.PricePerNight * updated.NumberOfNights;
          const calculatedDeposit = (totalAmount * 30) / 100;
          setPaymentInfo(curr => ({ ...curr, DepositAmount: calculatedDeposit }));
        }
      }
      
      return updated;
    });
  };

  const totalAmount = bookingInfo.PricePerNight * bookingInfo.NumberOfNights;
  const balanceDue = totalAmount - paymentInfo.DepositAmount;

  const handleSubmit = () => {
    // Validation
    if (!guestInfo.FullName || !guestInfo.ICNumber || !guestInfo.Email || !guestInfo.PhoneNumber) {
      alert("Please fill in all required guest information fields");
      return;
    }

    if (!bookingInfo.RoomID || !bookingInfo.CheckInDate || !bookingInfo.CheckOutDate) {
      alert("Please select a room and booking dates");
      return;
    }

    if (paymentInfo.DepositAmount <= 0) {
      alert("Please enter a valid deposit amount");
      return;
    }

    const newBooking = {
      Guest: guestInfo,
      Booking: bookingInfo,
      Payment: paymentInfo,
      BookingStatus: "Confirmed",
      CreatedAt: new Date().toISOString()
    };
    
    console.log("New Walk-in Booking:", newBooking);
    alert("Booking created successfully!");
    
    // Reset form
    setGuestInfo({
      FullName: "",
      ICNumber: "",
      Email: "",
      PhoneNumber: "",
      Address: ""
    });
    setBookingInfo({
      RoomID: 0,
      RoomNumber: "",
      RoomType: "",
      PricePerNight: 0,
      CheckInDate: "",
      CheckOutDate: "",
      TotalGuests: 1,
      NumberOfNights: 0
    });
    setPaymentInfo({
      DepositAmount: 0,
      PaymentMethod: "Cash"
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
              activePage={activePage}
              setActivePage={setActivePage}
              setSidebarCollapsed={setSidebarCollapsed}
            />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-[230px]"}`}>
        <main className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 shadow-sm">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Walk-in Guest Booking</h1>
                <p className="text-sm text-gray-500">Quick booking for walk-in guests</p>
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Guest & Booking Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Guest Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Guest Information</h2>
                      <p className="text-xs text-gray-500">Enter guest personal details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={guestInfo.FullName}
                          onChange={(e) => handleGuestChange('FullName', e.target.value)}
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
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={guestInfo.ICNumber}
                          onChange={(e) => handleGuestChange('ICNumber', e.target.value)}
                          placeholder="e.g., 920318-10-5432"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          value={guestInfo.PhoneNumber}
                          onChange={(e) => handleGuestChange('PhoneNumber', e.target.value)}
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
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={guestInfo.Email}
                          onChange={(e) => handleGuestChange('Email', e.target.value)}
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
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <textarea
                          value={guestInfo.Address}
                          onChange={(e) => handleGuestChange('Address', e.target.value)}
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
                      <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
                      <p className="text-xs text-gray-500">Select check-in and check-out dates</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-In Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="date"
                          value={bookingInfo.CheckInDate}
                          onChange={(e) => handleDateChange('CheckInDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
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
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="date"
                          value={bookingInfo.CheckOutDate}
                          onChange={(e) => handleDateChange('CheckOutDate', e.target.value)}
                          min={bookingInfo.CheckInDate || new Date().toISOString().split('T')[0]}
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
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="number"
                          value={bookingInfo.TotalGuests}
                          onChange={(e) => setBookingInfo(prev => ({ ...prev, TotalGuests: parseInt(e.target.value) || 1 }))}
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
                        <span className="font-semibold">{bookingInfo.NumberOfNights} night(s)</span> selected
                        {bookingInfo.PricePerNight > 0 && (
                          <span> • Total: <span className="font-bold">RM {totalAmount.toFixed(2)}</span></span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Room Selection */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Bed className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Available Rooms</h2>
                      <p className="text-xs text-gray-500">Select a room for the guest</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableRooms.map((room) => (
                      <div
                        key={room.RoomID}
                        onClick={() => handleRoomSelect(room)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                          bookingInfo.RoomID === room.RoomID
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900">Room {room.RoomNumber}</h4>
                            <p className="text-xs text-gray-600">{room.RoomType}</p>
                          </div>
                          {bookingInfo.RoomID === room.RoomID && (
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{room.Description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">RM {room.PricePerNight.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">/night</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Payment Summary */}
              <div className="space-y-6">
                {/* Payment Summary */}
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
                            <span className="font-bold text-gray-900">RM {totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-sky-200">
                            <span className="text-gray-600">Deposit (30%)</span>
                            <span className="font-medium text-gray-700">RM {((totalAmount * 30) / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deposit Amount (RM) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={totalAmount}
                            value={paymentInfo.DepositAmount}
                            onChange={(e) => setPaymentInfo(prev => ({ 
                              ...prev, 
                              DepositAmount: parseFloat(e.target.value) || 0 
                            }))}
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
                          {[
                            { value: "Cash", label: "Cash" },
                            { value: "CreditCard", label: "Card" },
                            { value: "DebitCard", label: "Debit" },
                            { value: "OnlineTransfer", label: "Transfer" }
                          ].map((method) => (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() => setPaymentInfo(prev => ({ 
                                ...prev, 
                                PaymentMethod: method.value as any 
                              }))}
                              className={`p-2.5 border-2 rounded-lg transition text-sm font-medium ${
                                paymentInfo.PaymentMethod === method.value
                                  ? 'border-amber-600 bg-amber-50 text-amber-900'
                                  : 'border-gray-200 hover:border-amber-300 bg-white text-gray-700'
                              }`}
                            >
                              {method.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-amber-50 rounded-lg p-3 mb-4">
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Balance Due</span>
                            <span className="font-bold text-amber-600">RM {balanceDue.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-gray-600">To be paid at check-out</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Save size={18} />
                        Create Booking
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Select dates and room to view payment details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}