// src/services/api.ts
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

// Generic API call function with error handling
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Always try to parse JSON — even for errors!
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      // This captures your backend messages perfectly!
      const message = data.message || data.error || response.statusText;
      throw new Error(message);
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error; // This will now contain "This email is already used..."
  }
}

// Dashboard API calls
export const dashboardAPI = {
  getStats: async (hotelId?: number) => {
    const params = hotelId ? `?hotelId=${hotelId}` : '';
    return apiCall<{
      success: boolean;
      data: {
        checkinsToday: number;
        checkoutsToday: number;
        currentBookings: number;
        pendingPayments: number;
        totalRevenue: number;
        occupancyRate: number;
        availableRooms: number;
        totalRooms: number;
        avgDailyRate: number;
        pendingReservations: number;
      };
    }>(`/api/Dashboard/stats${params}`);
  },

  getWeeklyRevenue: async (hotelId?: number) => {
    const params = hotelId ? `?hotelId=${hotelId}` : '';
    return apiCall<{
      success: boolean;
      data: Array<{
        day: string;
        date: string;
        revenue: number;
        bookings: number;
      }>;
    }>(`/api/Dashboard/revenue/weekly${params}`);
  },

  getRoomDistribution: async (hotelId?: number) => {
    const params = hotelId ? `?hotelId=${hotelId}` : '';
    return apiCall<{
      success: boolean;
      data: Array<{
        status: string;
        count: number;
      }>;
    }>(`/api/Dashboard/rooms/distribution${params}`);
  },

  getBookingSummary: async (hotelId?: number) => {
    const params = hotelId ? `?hotelId=${hotelId}` : '';
    return apiCall<{
      success: boolean;
      data: Array<{
        status: string;
        count: number;
      }>;
    }>(`/api/Dashboard/bookings/summary${params}`);
  },
};

// Bookings API
export const bookingsAPI = {

  // Create a new booking
  // createBooking: async (payload: {
  //   GuestID: string;
  //   RoomID: number;
  //   CheckInDate: string;
  //   CheckOutDate: string;
  //   TotalGuests: number;
  //   DepositPaid: number;
  //   PaymentMethod: "Cash" | "Card";
  // }) => {
  //   return apiCall<{
  //     success: boolean;
  //     message: string;
  //     data: {
  //       bookingId: number;
  //       bookingStatus: string;
  //       totalAmount: number;
  //       depositAmount: number;
  //     };
  //   }>('/api/bookings', {
  //     method: 'POST',
  //     body: JSON.stringify(payload),
  //   });
  // },

 
createBooking: async (payload: {
  GuestID: string;
  RoomIDs: number[];           
  CheckInDate: string;
  CheckOutDate: string;
  TotalGuests: number;
  DepositPaid: number;
  PaymentMethod: "Cash" | "Card";
}) => {
  return apiCall<{
    success: boolean;
    message: string;
    data: {
      bookingIds: number[];
      totalAmount: number;
      requiredDeposit: number;
      confirmed: boolean;
    };
  }>('/api/bookings/staff', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
},

  sendConfirmationEmail: async (bookingId: number) => {
    return apiCall<{
      success: boolean;
      message: string;
      data: {
        email: string;
        guestName: string;
        bookingId: number;
      };
    }>(`/api/bookings/${bookingId}/send-confirmation`, {
      method: 'POST',
    });
  },

  // Check-In Email
  sendCheckIn: async (bookingId: number) => {
    return apiCall<{
      success: boolean;
      message: string;
      data?: {
        email: string;
        guestName: string;
        bookingId: number;
      };
    }>(`/api/bookings/${bookingId}/send-checkin-email`, {
      method: "POST",
    });
  },

  // Check-Out Email
  sendCheckOut: async (bookingId: number) => {
    return apiCall<{
      success: boolean;
      message: string;
      data?: {
        email: string;
        guestName: string;
        bookingId: number;
      };
    }>(`/api/bookings/${bookingId}/send-checkout-email`, {
      method: "POST",
    });
  },


  // Get today's front desk activities
  getTodayActivities: async (hotelId?: number) => {
    const params = hotelId ? `?hotelId=${hotelId}` : '';
    return apiCall<{
      success: boolean;
      data: Array<{
        bookingId: number;
        guestName: string;
        roomNumber: string;
        roomType: string;
        checkInDate: string;
        checkOutDate: string;
        activityType: 'Check-In' | 'Check-Out' | 'Stayover';
        bookingStatus: string;
        totalAmount: number;
        totalPaid: number;
        pendingAmount: number;
        totalGuests: number;
        email: string;
        phoneNumber: string;
      }>;
    }>(`/api/bookings/frontdesk/today${params}`);
  },

  // Get booking by ID
  getBookingById: async (id: number) => {
    return apiCall<{
      success: boolean;
      data: {
        bookingId: number;
        guest: {
          guestId: string;
          fullName: string;
          email: string;
          phoneNumber: string;
          icNumber: string;
          address: string;
          gender: string;
        };
        room: {
          roomId: number;
          roomNumber: string;
          roomType: string;
          pricePerNight: number;
          status: string;
          hotelName: string;
        };
        checkInDate: string;
        checkOutDate: string;
        totalGuests: number;
        totalAmount: number;
        depositAmount: number;
        bookingStatus: string;
        createdAt: string;
        numberOfNights: number;
        payments: Array<{
          paymentId: number;
          amount: number;
          paymentDate: string;
          paymentMethod: string;
          status: string;
        }>;
        totalPaid: number;
        pendingAmount: number;
      };
    }>(`/api/bookings/staff/${id}`);
  },

  // Update booking status
  updateBookingStatus: async (id: number, status: string) => {
    return apiCall<{
      success: boolean;
      message: string;
      data: {
        bookingId: number;
        bookingStatus: string;
        roomStatus: string;
      };
    }>(`/api/Bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
    getAllBookings: async (params?: {
    hotelId?: number;
    guestId?: string;
    status?: string;
    dateFrom?: string | null;
    dateTo?: string | null;
    searchQuery?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.hotelId) query.append('hotelId', params.hotelId.toString());
    if (params?.guestId) query.append('guestId', params.guestId);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);
    if (params?.searchQuery) query.append('searchQuery', params.searchQuery);

    return apiCall<any>(`/api/bookings/staff?${query}`);
  },
};

// Reviews API
export const reviewsAPI = {
  getAllReviews: async (filters?: {
    hotelId?: number;
    minRating?: number;
    maxRating?: number;
  }) => {
    const query = new URLSearchParams();
    if (filters?.hotelId) query.append('hotelId', filters.hotelId.toString());
    if (filters?.minRating) query.append('minRating', filters.minRating.toString());
    if (filters?.maxRating) query.append('maxRating', filters.maxRating.toString());

    return apiCall<{
      success: boolean;
      data: Array<{
        reviewId: number;
        bookingId: number;
        guestId: string;
        guestName: string;
        hotelName: string;
        roomNumber: string;
        roomType: string;
        rating: number;
        comment: string | null;
        reviewDate: string;
      }>;
    }>(`/api/reviews${query.toString() ? `?${query}` : ''}`);
  },

  getReviewsByBookingId: async (bookingId: number) => {
    return apiCall<any>(`/api/reviews/booking/${bookingId}`);
  },

  getReviewsByGuestId: async (guestId: string) => {
    return apiCall<{
      success: boolean;
      data: Array<{
        reviewId: number;
        bookingId: number;
        hotelName: string;
        roomNumber: string;
        roomType: string;
        rating: number;
        comment: string | null;
        reviewDate: string;
      }>;
    }>(`/api/reviews/guest/${guestId}`);
  },

  // submitReview: async (payload: {
  //   BookingID: number;
  //   GuestID: string;
  //   Rating: number;
  //   Comment?: string;
  // }) => {
  //   return apiCall<{
  //     success: boolean;
  //     message: string;
  //     data: { reviewId: number; rating: number; reviewDate: string };
  //   }>('/api/reviews', {
  //     method: 'POST',
  //     body: JSON.stringify(payload),
  //   });
  // },

  // updateReview: async (id: number, payload: { Rating?: number; Comment?: string }) => {
  //   return apiCall<any>(`/api/reviews/${id}`, {
  //     method: 'PUT',
  //     body: JSON.stringify(payload),
  //   });
  // },

  // deleteReview: async (id: number) => {
  //   return apiCall<any>(`/api/reviews/${id}`, { method: 'DELETE' });
  // },
};

// Documents API
export const documentsAPI = {
  getDocumentsByGuestId: async (guestId: string) => {
    return apiCall<{
      success: boolean;
      data: Array<{
        documentId: number;
        guestId: string;
        fileName: string;
        fileUrl: string;
        documentType: string;
        uploadDate: string;
        status: 'Pending' | 'Verified';
      }>;
    }>(`/api/documents/guest/${guestId}`);
  },

  uploadDocument: async (formData: FormData) => {
    return fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData, 
    })
      .then((res) => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      })
      .catch((err) => {
        console.error('Document upload error:', err);
        throw err;
      });
  },

  verifyDocument: async (id: number) => {
    return apiCall<any>(`/api/documents/${id}/verify`, { method: 'PUT' });
  },

  deleteDocument: async (id: number) => {
    return apiCall<any>(`/api/documents/${id}`, { method: 'DELETE' });
  },
};

// Payments API
export const paymentsAPI = {
  // Process payment (backend handles auto-confirm)
  processPayment: async (bookingId: number, amount: number, paymentMethod: string) => {
    return apiCall<{
      success: boolean;
      message: string;
      data: {
        paymentId: number;
        amount: number;
        paymentMethod: string;
        paymentDate: string;
        newPendingAmount: number;
        bookingStatus?: string;
        roomBlocked?: boolean;
      };
    }>('/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        bookingID: bookingId,
        amount: amount,
        paymentMethod: paymentMethod,
      }),
    });
  },

  // Get payments by booking ID
  getPaymentsByBooking: async (bookingId: number) => {
    return apiCall<{
      success: boolean;
      data: Array<{
        paymentId: number;
        bookingId: number;
        amount: number;
        paymentMethod: string;
        paymentDate: string;
        status: string;
        receiptUrl: string | null;
      }>;
    }>(`/api/payments/booking/${bookingId}`);
  },

  // Create Stripe Payment Intent
  createPaymentIntent: async (bookingId: number, amount: number) => {
    return apiCall<{
      clientSecret: string;
      paymentIntentId: string;
    }>('/api/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ BookingID: bookingId, Amount: amount }),
    });
  },

  // Confirm Stripe Payment (backend handles auto-confirm)
  confirmStripePayment: async (bookingId: number, amount: number) => {
    return apiCall<{
      success: boolean;
      message: string;
      data?: {
        paymentId: number;
        bookingId: number;
        paymentDate: string;
        amount: number;
        paymentMethod: string;
        status: string;
        receiptUrl: string | null;
      };
    }>('/api/Payments/staff/confirm', {
      method: 'POST',
      body: JSON.stringify({
        BookingID: bookingId,
        Amount: amount,
        PaymentMethod: "Card"
      }),
    });
  },
};

interface GetAllGuestsParams {
  hotelId: number;
  status?: string;
  searchQuery?: string;
}

// Guests API 
export const guestsAPI = {
  // Create new guest (walk-in)
  createGuest: async (data: {
    FullName: string;
    ICNumber: string;
    Email: string;
    PhoneNumber: string;
    Address?: string;
    Gender: string;
  }) => {
    return apiCall<{
      success: boolean;
      message: string;
      data: { guestId: string; fullName: string; icNumber: string };
    }>('/api/guests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all guests for a specific hotel
  getAllGuests: async (
    hotelId: number,
    filters?: {
      status?: 'all' | 'active';
      minBookings?: number;
      searchQuery?: string;
    }
  ) => {
    const params = new URLSearchParams();
    params.append('hotelId', hotelId.toString());

    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.minBookings !== undefined) {
      params.append('minBookings', filters.minBookings.toString());
    }
    if (filters?.searchQuery) {
      params.append('searchQuery', filters.searchQuery);
    }

    return apiCall<{
      success: boolean;
      data: Array<{
        guestId: string;
        fullName: string;
        icNumber: string;
        email: string;
        phoneNumber: string;
        address: string;
        gender: string;
        cognitoId: string | null;
        createdAt: string;
        totalBookings: number;
        lastBookingDate: string | null;
        isActive: boolean;
        hasAccount: boolean;
      }>;
    }>(`/api/guests?${params.toString()}`);
  },

  // Get single guest by ID 
  getGuestById: async (guestId: string, hotelId: number) => {
    const params = new URLSearchParams();
    params.append('hotelId', hotelId.toString());

    return apiCall<{
      success: boolean;
      data: {
        guestId: string;
        fullName: string;
        icNumber: string;
        email: string;
        phoneNumber: string;
        address: string | null;
        gender: string;
        createdAt: string;
        cognitoId?: string | null;
      };
    }>(`/api/guests/${guestId}?${params.toString()}`);
  },

  // Update guest info
  updateGuest: async (
    guestId: string,
    hotelId: number,
    data: {
      FullName?: string;
      ICNumber?: string;
      Email?: string;
      PhoneNumber?: string;
      Address?: string;
      Gender?: string;
    }
  ) => {
    return apiCall<{
      success: boolean;
      message: string;
    }>(`/api/guests/${guestId}?hotelId=${hotelId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // // Delete guest (only if no active bookings)
  // deleteGuest: async (guestId: string, hotelId: number) => {
  //   return apiCall<{
  //     success: boolean;
  //     message: string;
  //   }>(`/api/guests/${guestId}?hotelId=${hotelId}`, {
  //     method: 'DELETE',
  //   });
  // },
};

type AvailableRoom = {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  description: string;
  imageURL: string | null;
  hotelName: string;
};


export interface RoomGuest {
  guestId: number;
  fullName: string;
  icNumber: string;
  email: string;
  phoneNumber: string;
  gender: string;
}

export interface RoomCurrentBooking {
  bookingId: number;
  guestName: string;
  guest?: RoomGuest;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: number;
  depositAmount: number;
}

export interface RoomResponse {
  roomId: number;
  hotelId: number;
  hotelName?: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  status: "Available" | "Occupied" | "Maintenance";
  description: string;
  imageURL?: string | null;
  currentBooking?: RoomCurrentBooking | null;
}
// Rooms API
export const roomsAPI = {
  // Get all rooms with filters (used in Room Operations page)
  getAllRooms: async (filters?: {
    hotelId?: number;
    status?: string;
    roomType?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
  }): Promise<{ success: boolean; data: RoomResponse[] }> => {
    const params = new URLSearchParams();
    if (filters?.hotelId) params.append('hotelId', filters.hotelId.toString());
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.roomType && filters.roomType !== 'all') params.append('roomType', filters.roomType);
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);

    const queryString = params.toString();
    return apiCall(`/api/rooms${queryString ? `?${queryString}` : ''}`);
  },

  // Get single room by ID (with full guest details)
  getRoomById: async (roomId: number): Promise<{ success: boolean; data: RoomResponse }> => {
    return apiCall(`/api/rooms/${roomId}`);
  },
  getAvailableRooms: async (checkIn: string, checkOut: string, hotelId?: number) => {
    const params = new URLSearchParams({
      checkInDate: checkIn,
      checkOutDate: checkOut,
      ...(hotelId && { hotelId: hotelId.toString() })
    });

    return apiCall<{ success: boolean; data: AvailableRoom[] }>(
      `/api/rooms/available?${params}`
    );
  },
  // Update room status (e.g. set to Maintenance)
  updateRoomStatus: async (roomId: number, status: "Available" | "Occupied" | "Maintenance") => {
    return apiCall<{
      success: boolean;
      message: string;
      data: { roomId: number; status: string };
    }>(`/api/rooms/${roomId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ Status: status }),
    });
  },
};

// FIXED staffAPI — now works 100% with your backend
export const staffAPI = {
  getAllStaff: async (hotelId?: number, position?: string) => {
    const params = new URLSearchParams();
    if (hotelId) params.append('hotelId', hotelId.toString());
    if (position) params.append('position', position);

    const queryString = params.toString();
    const endpoint = `/api/Staff${queryString ? `?${queryString}` : ''}`;

    return apiCall<{
      success: boolean;
      data: Array<{
        staffId: number;
        hotelId: number;
        hotelName: string;
        fullName: string;
        position: string;
        contactNumber: string;
        email: string;
        gender: string;
        hireDate: string;
      }>;
    }>(endpoint);
  },

  getStaffById: async (id: number) => {
    return apiCall<any>(`/api/Staff/${id}`);
  },

  // createStaff: async (data: {
  //   hotelID: number;
  //   fullName: string;
  //   position: string;
  //   contactNumber: string;
  //   email: string;
  //   gender: string;
  //   hireDate?: string;
  // }) => {
  //   return apiCall<any>('/api/Staff', {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //   });
  // },

  // updateStaff: async (id: number, data: Partial<{
  //   fullName: string;
  //   position: string;
  //   contactNumber: string;
  //   email: string;
  //   gender: string;
  // }>) => {
  //   return apiCall<any>(`/api/Staff/${id}`, {
  //     method: 'PUT',
  //     body: JSON.stringify(data),
  //   });
  // },

  // deleteStaff: async (id: number) => {
  //   return apiCall<any>(`/api/Staff/${id}`, { method: 'DELETE' });
  // },
};

// Users API
export const usersAPI = {
  getCurrentUser: async (userId: string) => {
    return apiCall<{
      success: boolean;
      data: {
        userId: string;
        fullName: string;
        email: string;
        role: string;
        hotelId: number | null;
        hotel: {
          hotelId: number;
          hotelName: string;
          address: string;
          city: string;
        } | null;
        gender: string;
        createdAt: string;
      };
    }>(`/api/users/${userId}`);
  },

  // GET /api/users → Get all system users (with filters)
  getAllUsers: async (filters?: {
    role?: string;
    hotelId?: number;
    searchQuery?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.hotelId) params.append('hotelId', filters.hotelId.toString());
    if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);

    const query = params.toString();
    return apiCall<{
      success: boolean;
      data: Array<{
        userId: string;
        fullName: string;
        email: string;
        role: string;
        hotelId: number | null;
        hotelName: string | null;
        gender: string;
        createdAt: string;
      }>;
    }>(`/api/users${query ? `?${query}` : ''}`);
  },


  updateProfile: async (userId: string, data: {
    FullName?: string;
    Email?: string;
    Role?: string;
    HotelID?: number | null;
  }) => {
    return apiCall<{
      success: boolean;
      message: string;
      data: {
        userId: string;
        fullName: string;
        email: string;
        role: string;
        hotelId: number | null;
      };
    }>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (userId: string, payload: {
    CurrentPassword: string;
    NewPassword: string;
  }) => {
    return apiCall<{
      success: boolean;
      message: string;
    }>(`/api/users/${userId}/change-password`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },




};

export default { dashboardAPI, bookingsAPI, paymentsAPI, guestsAPI, roomsAPI, staffAPI, reviewsAPI, documentsAPI, usersAPI };

// // src/services/api.ts
// import { API_BASE_URL } from '../config';

// const API_URL = API_BASE_URL;

// // Generic API call function with error handling
// async function apiCall<T>(
//   endpoint: string,
//   options?: RequestInit
// ): Promise<T> {
//   try {
//     const response = await fetch(`${API_URL}${endpoint}`, {
//       ...options,
//       headers: {
//         'Content-Type': 'application/json',
//         ...options?.headers,
//       },
//     });

//     if (!response.ok) {
//       const error = await response.json().catch(() => ({}));
//       throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error(`API Error [${endpoint}]:`, error);
//     throw error;
//   }
// }

// // Dashboard API calls
// export const dashboardAPI = {
//   getStats: async (hotelId?: number) => {
//     const params = hotelId ? `?hotelId=${hotelId}` : '';
//     return apiCall<{
//       success: boolean;
//       data: {
//         checkinsToday: number;
//         checkoutsToday: number;
//         currentBookings: number;
//         pendingPayments: number;
//         totalRevenue: number;
//         occupancyRate: number;
//         availableRooms: number;
//         totalRooms: number;
//         avgDailyRate: number;
//         pendingReservations: number;
//       };
//     }>(`/api/Dashboard/stats${params}`);
//   },

//   getWeeklyRevenue: async (hotelId?: number) => {
//     const params = hotelId ? `?hotelId=${hotelId}` : '';
//     return apiCall<{
//       success: boolean;
//       data: Array<{
//         day: string;
//         date: string;
//         revenue: number;
//         bookings: number;
//       }>;
//     }>(`/api/Dashboard/revenue/weekly${params}`);
//   },

//   getRoomDistribution: async (hotelId?: number) => {
//     const params = hotelId ? `?hotelId=${hotelId}` : '';
//     return apiCall<{
//       success: boolean;
//       data: Array<{
//         status: string;
//         count: number;
//       }>;
//     }>(`/api/Dashboard/rooms/distribution${params}`);
//   },

//   getBookingSummary: async (hotelId?: number) => {
//     const params = hotelId ? `?hotelId=${hotelId}` : '';
//     return apiCall<{
//       success: boolean;
//       data: Array<{
//         status: string;
//         count: number;
//       }>;
//     }>(`/api/Dashboard/bookings/summary${params}`);
//   },
// };

// // Bookings API
// export const bookingsAPI = {

//   // Create a new booking
//   createBooking: async (payload: {
//     GuestID: string;
//     RoomID: number;
//     CheckInDate: string;
//     CheckOutDate: string;
//     TotalGuests: number;
//     DepositPaid: number;
//     PaymentMethod: "Cash" | "Card";
//   }) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data: {
//         bookingId: number;
//         bookingStatus: string;
//         totalAmount: number;
//         depositAmount: number;
//       };
//     }>('/api/bookings', {
//       method: 'POST',
//       body: JSON.stringify(payload),
//     });
//   },

//   sendConfirmationEmail: async (bookingId: number) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data: {
//         email: string;
//         guestName: string;
//         bookingId: number;
//       };
//     }>(`/api/bookings/${bookingId}/send-confirmation`, {
//       method: 'POST',
//     });
//   },

//   // Check-In Email
//   sendCheckIn: async (bookingId: number) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data?: {
//         email: string;
//         guestName: string;
//         bookingId: number;
//       };
//     }>(`/api/bookings/${bookingId}/send-checkin-email`, {
//       method: "POST",
//     });
//   },

//   // Check-Out Email
//   sendCheckOut: async (bookingId: number) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data?: {
//         email: string;
//         guestName: string;
//         bookingId: number;
//       };
//     }>(`/api/bookings/${bookingId}/send-checkout-email`, {
//       method: "POST",
//     });
//   },


//   // Get today's front desk activities
//   getTodayActivities: async (hotelId?: number) => {
//     // Backend doesn't have /frontdesk/today endpoint, fetch all bookings and filter
//     const response = await apiCall<any>(`/api/bookings`);
    
//     if (!response || !Array.isArray(response)) {
//       return { success: false, data: [] };
//     }
    
//     const today = new Date().toISOString().split('T')[0];
    
//     // Filter bookings for today's check-ins/check-outs and by hotelId
//     const todayActivities = response
//       .filter((booking: any) => {
//         const checkIn = booking.checkInDate?.split('T')[0];
//         const checkOut = booking.checkOutDate?.split('T')[0];
//         const matchesHotel = !hotelId || booking.hotelId === hotelId || booking.hotelID === hotelId;
//         return matchesHotel && (checkIn === today || checkOut === today);
//       })
//       .map((booking: any) => ({
//         bookingId: booking.bookingID || booking.bookingId,
//         guestName: booking.guestName || 'Unknown',
//         roomNumber: booking.roomNumber || '',
//         roomType: booking.roomType || '',
//         checkInDate: booking.checkInDate,
//         checkOutDate: booking.checkOutDate,
//         activityType: booking.checkInDate?.split('T')[0] === today ? 'Check-In' : 'Check-Out',
//         bookingStatus: booking.status || booking.bookingStatus,
//         totalAmount: booking.totalAmount || 0,
//         totalPaid: booking.totalPaid || 0,
//         pendingAmount: (booking.totalAmount || 0) - (booking.totalPaid || 0),
//         totalGuests: booking.totalGuests || 1,
//         email: booking.email || '',
//         phoneNumber: booking.phoneNumber || booking.contactNumber || ''
//       }));
    
//     return { success: true, data: todayActivities };
//   },

//   // Get booking by ID
//   getBookingById: async (id: number) => {
//     return apiCall<{
//       success: boolean;
//       data: {
//         bookingId: number;
//         guest: {
//           guestId: string;
//           fullName: string;
//           email: string;
//           phoneNumber: string;
//           icNumber: string;
//           address: string;
//           gender: string;
//         };
//         room: {
//           roomId: number;
//           roomNumber: string;
//           roomType: string;
//           pricePerNight: number;
//           status: string;
//           hotelName: string;
//         };
//         checkInDate: string;
//         checkOutDate: string;
//         totalGuests: number;
//         totalAmount: number;
//         depositAmount: number;
//         bookingStatus: string;
//         createdAt: string;
//         numberOfNights: number;
//         payments: Array<{
//           paymentId: number;
//           amount: number;
//           paymentDate: string;
//           paymentMethod: string;
//           status: string;
//         }>;
//         totalPaid: number;
//         pendingAmount: number;
//       };
//     }>(`/api/bookings/${id}`);
//   },

//   // Update booking status
//   updateBookingStatus: async (id: number, status: string) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data: {
//         bookingId: number;
//         bookingStatus: string;
//         roomStatus: string;
//       };
//     }>(`/api/Bookings/${id}/status`, {
//       method: 'PUT',
//       body: JSON.stringify({ status }),
//     });
//   },
//     getAllBookings: async (params?: {
//     hotelId?: number;
//     guestId?: string;
//     status?: string;
//     dateFrom?: string | null;
//     dateTo?: string | null;
//     searchQuery?: string;
//   }) => {
//     const query = new URLSearchParams();
//     if (params?.hotelId) query.append('hotelId', params.hotelId.toString());
//     if (params?.guestId) query.append('guestId', params.guestId);
//     if (params?.status && params.status !== 'all') query.append('status', params.status);
//     if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
//     if (params?.dateTo) query.append('dateTo', params.dateTo);
//     if (params?.searchQuery) query.append('searchQuery', params.searchQuery);

//     return apiCall<any>(`/api/bookings?${query}`);
//   },
// };

// // Reviews API
// export const reviewsAPI = {
//   getAllReviews: async (filters?: {
//     hotelId?: number;
//     minRating?: number;
//     maxRating?: number;
//   }) => {
//     const query = new URLSearchParams();
//     if (filters?.hotelId) query.append('hotelId', filters.hotelId.toString());
//     if (filters?.minRating) query.append('minRating', filters.minRating.toString());
//     if (filters?.maxRating) query.append('maxRating', filters.maxRating.toString());

//     return apiCall<{
//       success: boolean;
//       data: Array<{
//         reviewId: number;
//         bookingId: number;
//         guestId: string;
//         guestName: string;
//         hotelName: string;
//         roomNumber: string;
//         roomType: string;
//         rating: number;
//         comment: string | null;
//         reviewDate: string;
//       }>;
//     }>(`/api/reviews${query.toString() ? `?${query}` : ''}`);
//   },

//   getReviewsByBookingId: async (bookingId: number) => {
//     return apiCall<any>(`/api/reviews/booking/${bookingId}`);
//   },

//   getReviewsByGuestId: async (guestId: string) => {
//     return apiCall<{
//       success: boolean;
//       data: Array<{
//         reviewId: number;
//         bookingId: number;
//         hotelName: string;
//         roomNumber: string;
//         roomType: string;
//         rating: number;
//         comment: string | null;
//         reviewDate: string;
//       }>;
//     }>(`/api/reviews/guest/${guestId}`);
//   },

//   submitReview: async (payload: {
//     BookingID: number;
//     GuestID: string;
//     Rating: number;
//     Comment?: string;
//   }) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data: { reviewId: number; rating: number; reviewDate: string };
//     }>('/api/reviews', {
//       method: 'POST',
//       body: JSON.stringify(payload),
//     });
//   },

//   updateReview: async (id: number, payload: { Rating?: number; Comment?: string }) => {
//     return apiCall<any>(`/api/reviews/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(payload),
//     });
//   },

//   deleteReview: async (id: number) => {
//     return apiCall<any>(`/api/reviews/${id}`, { method: 'DELETE' });
//   },
// };

// // Documents API
// export const documentsAPI = {
//   getDocumentsByGuestId: async (guestId: string) => {
//     return apiCall<{
//       success: boolean;
//       data: Array<{
//         documentId: number;
//         guestId: string;
//         fileName: string;
//         fileUrl: string;
//         documentType: string;
//         uploadDate: string;
//         status: 'Pending' | 'Verified';
//       }>;
//     }>(`/api/documents/guest/${guestId}`);
//   },

//   uploadDocument: async (formData: FormData) => {
//     return fetch(`${API_URL}/api/documents/upload`, {
//       method: 'POST',
//       body: formData, 
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error('Upload failed');
//         return res.json();
//       })
//       .catch((err) => {
//         console.error('Document upload error:', err);
//         throw err;
//       });
//   },

//   verifyDocument: async (id: number) => {
//     return apiCall<any>(`/api/documents/${id}/verify`, { method: 'PUT' });
//   },

//   deleteDocument: async (id: number) => {
//     return apiCall<any>(`/api/documents/${id}`, { method: 'DELETE' });
//   },
// };

// // Payments API
// export const paymentsAPI = {
//   // Process payment (backend handles auto-confirm)
//   processPayment: async (bookingId: number, amount: number, paymentMethod: string) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data: {
//         paymentId: number;
//         amount: number;
//         paymentMethod: string;
//         paymentDate: string;
//         newPendingAmount: number;
//         bookingStatus?: string;
//         roomBlocked?: boolean;
//       };
//     }>('/api/payments', {
//       method: 'POST',
//       body: JSON.stringify({
//         bookingID: bookingId,
//         amount: amount,
//         paymentMethod: paymentMethod,
//       }),
//     });
//   },

//   // Get payments by booking ID
//   getPaymentsByBooking: async (bookingId: number) => {
//     return apiCall<{
//       success: boolean;
//       data: Array<{
//         paymentId: number;
//         bookingId: number;
//         amount: number;
//         paymentMethod: string;
//         paymentDate: string;
//         status: string;
//         receiptUrl: string | null;
//       }>;
//     }>(`/api/payments/booking/${bookingId}`);
//   },

//   // Create Stripe Payment Intent
//   createPaymentIntent: async (bookingId: number, amount: number) => {
//     return apiCall<{
//       clientSecret: string;
//       paymentIntentId: string;
//     }>('/api/payments/create-payment-intent', {
//       method: 'POST',
//       body: JSON.stringify({ BookingID: bookingId, Amount: amount }),
//     });
//   },

//   // Confirm Stripe Payment (backend handles auto-confirm)
//   confirmStripePayment: async (bookingId: number, amount: number) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data?: {
//         paymentId: number;
//         bookingId: number;
//         paymentDate: string;
//         amount: number;
//         paymentMethod: string;
//         status: string;
//         receiptUrl: string | null;
//       };
//     }>('/api/Payments/confirm', {
//       method: 'POST',
//       body: JSON.stringify({
//         BookingID: bookingId,
//         Amount: amount,
//         PaymentMethod: "Card"
//       }),
//     });
//   },
// };

// interface GetAllGuestsParams {
//   hotelId: number;
//   status?: string;
//   searchQuery?: string;
// }

// // Guests API 
// export const guestsAPI = {
//   // Create new guest (walk-in)
//   createGuest: async (data: {
//     FullName: string;
//     ICNumber: string;
//     Email: string;
//     PhoneNumber: string;
//     Address?: string;
//     Gender: string;
//   }) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data: { guestId: string; fullName: string; icNumber: string };
//     }>('/api/guests', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },

//   // Get all guests for a specific hotel
//   getAllGuests: async (
//     hotelId: number,
//     filters?: {
//       status?: 'all' | 'active';
//       minBookings?: number;
//       searchQuery?: string;
//     }
//   ) => {
//     const params = new URLSearchParams();
//     params.append('hotelId', hotelId.toString());

//     if (filters?.status && filters.status !== 'all') {
//       params.append('status', filters.status);
//     }
//     if (filters?.minBookings !== undefined) {
//       params.append('minBookings', filters.minBookings.toString());
//     }
//     if (filters?.searchQuery) {
//       params.append('searchQuery', filters.searchQuery);
//     }

//     return apiCall<{
//       success: boolean;
//       data: Array<{
//         guestId: string;
//         fullName: string;
//         icNumber: string;
//         email: string;
//         phoneNumber: string;
//         address: string;
//         gender: string;
//         cognitoId: string | null;
//         createdAt: string;
//         totalBookings: number;
//         lastBookingDate: string | null;
//         isActive: boolean;
//         hasAccount: boolean;
//       }>;
//     }>(`/api/guests?${params.toString()}`);
//   },

//   // Get single guest by ID 
//   getGuestById: async (guestId: string, hotelId: number) => {
//     const params = new URLSearchParams();
//     params.append('hotelId', hotelId.toString());

//     return apiCall<{
//       success: boolean;
//       data: {
//         guestId: string;
//         fullName: string;
//         icNumber: string;
//         email: string;
//         phoneNumber: string;
//         address: string | null;
//         gender: string;
//         createdAt: string;
//         cognitoId?: string | null;
//       };
//     }>(`/api/guests/${guestId}?${params.toString()}`);
//   },

//   // Update guest info
//   updateGuest: async (
//     guestId: string,
//     hotelId: number,
//     data: {
//       FullName?: string;
//       PhoneNumber?: string;
//       Address?: string;
//       Gender?: string;
//     }
//   ) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//     }>(`/api/guests/${guestId}?hotelId=${hotelId}`, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   },

//   // Delete guest (only if no active bookings)
//   deleteGuest: async (guestId: string, hotelId: number) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//     }>(`/api/guests/${guestId}?hotelId=${hotelId}`, {
//       method: 'DELETE',
//     });
//   },
// };

// type AvailableRoom = {
//   roomId: number;
//   roomNumber: string;
//   roomType: string;
//   pricePerNight: number;
//   description: string;
//   imageURL: string | null;
//   hotelName: string;
// };


// export interface RoomGuest {
//   guestId: number;
//   fullName: string;
//   icNumber: string;
//   email: string;
//   phoneNumber: string;
//   gender: string;
// }

// export interface RoomCurrentBooking {
//   bookingId: number;
//   guestName: string;
//   guest?: RoomGuest;
//   checkInDate: string;
//   checkOutDate: string;
//   totalGuests: number;
//   totalAmount: number;
//   depositAmount: number;
// }

// export interface RoomResponse {
//   roomId: number;
//   hotelId: number;
//   hotelName?: string;
//   roomNumber: string;
//   roomType: string;
//   pricePerNight: number;
//   status: "Available" | "Occupied" | "Maintenance";
//   description: string;
//   imageURL?: string | null;
//   currentBooking?: RoomCurrentBooking | null;
// }
// // Rooms API
// export const roomsAPI = {
//   // Get all rooms with filters (used in Room Operations page)
//   getAllRooms: async (filters?: {
//     hotelId?: number;
//     status?: string;
//     roomType?: string;
//     minPrice?: number;
//     maxPrice?: number;
//     searchQuery?: string;
//   }): Promise<{ success: boolean; data: RoomResponse[] }> => {
//     const params = new URLSearchParams();
//     if (filters?.hotelId) params.append('hotelId', filters.hotelId.toString());
//     if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
//     if (filters?.roomType && filters.roomType !== 'all') params.append('roomType', filters.roomType);
//     if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
//     if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
//     if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);

//     const queryString = params.toString();
//     const response = await apiCall<any>(`/api/rooms${queryString ? `?${queryString}` : ''}`);
    
//     // Backend returns array directly, not wrapped in {success, data}
//     if (Array.isArray(response)) {
//       // Filter by hotelId on frontend if provided (backend only filters by status=Available)
//       let rooms = response;
//       if (filters?.hotelId) {
//         rooms = rooms.filter((r: any) => 
//           (r.hotelID || r.hotelId) === filters.hotelId
//         );
//       }
      
//       // Map response to ensure consistent field names
//       const mappedRooms = rooms.map((r: any) => ({
//         ...r,
//         roomId: r.roomId || r.id || r.roomID,
//         hotelId: r.hotelId || r.hotelID,
//         imageURL: r.imageURL || r.imageUrl
//       }));
      
//       return { success: true, data: mappedRooms };
//     }
    
//     // If already wrapped, return as-is
//     return response;
//   },

//   // Get single room by ID (with full guest details)
//   getRoomById: async (roomId: number): Promise<{ success: boolean; data: RoomResponse }> => {
//     return apiCall(`/api/rooms/${roomId}`);
//   },
//   getAvailableRooms: async (checkIn: string, checkOut: string, hotelId?: number) => {
//     const params = new URLSearchParams({
//       checkInDate: checkIn,
//       checkOutDate: checkOut,
//       ...(hotelId && { hotelId: hotelId.toString() })
//     });

//     return apiCall<{ success: boolean; data: AvailableRoom[] }>(
//       `/api/rooms/available?${params}`
//     );
//   },
//   // Update room status (e.g. set to Maintenance)
//   updateRoomStatus: async (roomId: number, status: "Available" | "Occupied" | "Maintenance") => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data: { roomId: number; status: string };
//     }>(`/api/rooms/${roomId}/status`, {
//       method: 'PUT',
//       body: JSON.stringify({ Status: status }),
//     });
//   },
// };

// // FIXED staffAPI — now works 100% with your backend
// export const staffAPI = {
//   getAllStaff: async (hotelId?: number, position?: string) => {
//     const params = new URLSearchParams();
//     if (hotelId) params.append('hotelId', hotelId.toString());
//     if (position) params.append('position', position);

//     const queryString = params.toString();
//     const endpoint = `/api/Staff${queryString ? `?${queryString}` : ''}`;

//     return apiCall<{
//       success: boolean;
//       data: Array<{
//         staffId: number;
//         hotelId: number;
//         hotelName: string;
//         fullName: string;
//         position: string;
//         contactNumber: string;
//         email: string;
//         gender: string;
//         hireDate: string;
//       }>;
//     }>(endpoint);
//   },

//   getStaffById: async (id: number) => {
//     return apiCall<any>(`/api/Staff/${id}`);
//   },

//   createStaff: async (data: {
//     hotelID: number;
//     fullName: string;
//     position: string;
//     contactNumber: string;
//     email: string;
//     gender: string;
//     hireDate?: string;
//   }) => {
//     return apiCall<any>('/api/Staff', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },

//   updateStaff: async (id: number, data: Partial<{
//     fullName: string;
//     position: string;
//     contactNumber: string;
//     email: string;
//     gender: string;
//   }>) => {
//     return apiCall<any>(`/api/Staff/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   },

//   deleteStaff: async (id: number) => {
//     return apiCall<any>(`/api/Staff/${id}`, { method: 'DELETE' });
//   },
// };

// // Users API
// export const usersAPI = {
//   getCurrentUser: async (userId: string) => {
//     const response = await apiCall<any>(`/api/users/${userId}`);
    
//     // Backend returns PascalCase, map to camelCase
//     if (response && !response.success) {
//       // Direct response from backend, wrap it
//       return {
//         success: true,
//         data: {
//           userId: response.UserID || response.userId || userId,
//           fullName: response.FullName || response.fullName || '',
//           email: response.Email || response.email || '',
//           role: response.Role || response.role || '',
//           hotelId: response.HotelID || response.hotelId || null,
//           hotel: response.Hotel || response.hotel || null,
//           gender: response.Gender || response.gender || '',
//           createdAt: response.CreatedAt || response.createdAt || new Date().toISOString()
//         }
//       };
//     }
    
//     // Already wrapped
//     return response;
//   },

//   // GET /api/users → Get all system users (with filters)
//   getAllUsers: async (filters?: {
//     role?: string;
//     hotelId?: number;
//     searchQuery?: string;
//   }) => {
//     const params = new URLSearchParams();
//     if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
//     if (filters?.hotelId) params.append('hotelId', filters.hotelId.toString());
//     if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);

//     const query = params.toString();
//     return apiCall<{
//       success: boolean;
//       data: Array<{
//         userId: string;
//         fullName: string;
//         email: string;
//         role: string;
//         hotelId: number | null;
//         hotelName: string | null;
//         gender: string;
//         createdAt: string;
//       }>;
//     }>(`/api/users${query ? `?${query}` : ''}`);
//   },


//   updateProfile: async (userId: string, data: {
//     FullName?: string;
//     Email?: string;
//     Role?: string;
//     HotelID?: number | null;
//   }) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//       data: {
//         userId: string;
//         fullName: string;
//         email: string;
//         role: string;
//         hotelId: number | null;
//       };
//     }>(`/api/users/${userId}`, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   },

//   changePassword: async (userId: string, payload: {
//     CurrentPassword: string;
//     NewPassword: string;
//   }) => {
//     return apiCall<{
//       success: boolean;
//       message: string;
//     }>(`/api/users/${userId}/change-password`, {
//       method: 'PUT',
//       body: JSON.stringify(payload),
//     });
//   },




// };

// export default { dashboardAPI, bookingsAPI, paymentsAPI, guestsAPI, roomsAPI, staffAPI, reviewsAPI, documentsAPI, usersAPI };