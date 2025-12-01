import { RoomResponse } from "../../../services/api";

export interface Guest {
  guestId: number;
  fullName: string;
  icNumber: string;
  email: string;
  phoneNumber: string;
}

export interface CurrentBooking {
  bookingId: number;
  guestName: string;
  guest?: Guest;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: number;
  depositAmount: number;
}

export interface Room extends RoomResponse {
  currentBooking?: CurrentBooking | null;
}