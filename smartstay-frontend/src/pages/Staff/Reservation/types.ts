export interface Guest {
  fullName: string;
  icNumber: string;
  email: string;
  phoneNumber: string;
  address: string;
}

export interface Room {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  status: string;
}

export interface Payment {
  paymentId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

export interface Booking {
  bookingId: number;
  guest: Guest;
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: number;
  depositAmount: number;
  bookingStatus: string;
  createdAt: string;
  numberOfNights: number;
  payments: Payment[];
  totalPaid: number;
  pendingAmount: number;
}

export interface FilterOptions {
  status: string;
  dateFrom: string;
  dateTo: string;
  searchQuery: string;
}