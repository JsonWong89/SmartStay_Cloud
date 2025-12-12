// API Configuration - Centralized endpoint management
// Edit this file to change API URLs across the entire application

// Export API_BASE_URL for use in other files
export const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://smartstay-hotel.us-east-1.elasticbeanstalk.com';

export const API_ENDPOINTS = {
  // Base URL
  BASE: API_BASE_URL,
  
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/Auth/login`,
    REGISTER: `${API_BASE_URL}/api/Auth/register`,
    LOGOUT: `${API_BASE_URL}/api/Auth/logout`,
  },
  
  // Users Management (Full CRUD)
  USERS: {
    BASE: `${API_BASE_URL}/api/Users`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/Users/${id}`,
  },
  
  // Hotels Management (Full CRUD)
  HOTELS: {
    BASE: `${API_BASE_URL}/api/Hotels`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/Hotels/${id}`,
    MANAGERS: `${API_BASE_URL}/api/Hotels/managers`,
  },
  
  // Rooms Management (Full CRUD)
  ROOMS: {
    BASE: `${API_BASE_URL}/api/Rooms`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/Rooms/${id}`,
    DEBUG: `${API_BASE_URL}/api/Rooms/debug`,
    BY_HOTEL: (hotelId: string) => `${API_BASE_URL}/api/Rooms?hotelId=${hotelId}`,
  },
  
  // Bookings (Full CRUD)
  BOOKINGS: {
    BASE: `${API_BASE_URL}/api/Bookings`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/Bookings/${id}`,
    BY_GUEST: (guestId: string) => `${API_BASE_URL}/api/Bookings/guest/${guestId}`,
    CANCEL: (id: string) => `${API_BASE_URL}/api/Bookings/${id}/cancel`,
    SEND_CONFIRMATION: (id: string) => `${API_BASE_URL}/api/Bookings/${id}/send-confirmation`,
  },
  
  // Documents
  DOCUMENTS: {
    UPLOAD: `${API_BASE_URL}/api/Documents/upload`,
    BY_GUEST: (guestId: string) => `${API_BASE_URL}/api/Documents/guest/${guestId}`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/Documents/${id}`,
    UPDATE_STATUS: (id: string) => `${API_BASE_URL}/api/Documents/${id}/status`,
  },
  
  // Hotel Managers
  HOTEL_MANAGERS: {
    BASE: `${API_BASE_URL}/api/HotelManagers`,
    BY_USER_AND_HOTEL: (userId: string, hotelId: string) => `${API_BASE_URL}/api/HotelManagers/${userId}/${hotelId}`,
  },
  
  // Payments
  PAYMENTS: {
    CREATE_INTENT: `${API_BASE_URL}/api/Payments/create-payment-intent`,
    CONFIRM: `${API_BASE_URL}/api/Payments/confirm`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/Payments/${id}`,
    RECEIPT: (bookingId: string) => `${API_BASE_URL}/api/Payments/booking/${bookingId}/receipt`,
    BY_GUEST: (guestId: string) => `${API_BASE_URL}/api/Payments/guest/${guestId}`,
  },
  
  // Reviews
  REVIEWS: {
    BASE: `${API_BASE_URL}/api/Reviews`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/Reviews/${id}`,
    BY_BOOKING: (bookingId: string) => `${API_BASE_URL}/api/Reviews/booking/${bookingId}`,
    BY_GUEST: (guestId: string) => `${API_BASE_URL}/api/Reviews/guest/${guestId}`,
    BY_HOTEL: (hotelId: string) => `${API_BASE_URL}/api/Reviews/hotel/${hotelId}`,
  },
  
  // Legacy endpoints (kept for backward compatibility - may not exist)
  RATE_PLANS: {
    BASE: `${API_BASE_URL}/api/RatePlans`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/RatePlans/${id}`,
    BY_HOTEL: (hotelId: string) => `${API_BASE_URL}/api/RatePlans?hotelId=${hotelId}`,
  },
  
  DAILY_METRICS: {
    BASE: `${API_BASE_URL}/api/DailyMetrics`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/DailyMetrics/${id}`,
  },
  
  REPORTS: {
    DAILY_METRICS: `${API_BASE_URL}/api/Reports/daily-metrics`,
    REVENUE: `${API_BASE_URL}/api/Reports/revenue`,
    BOOKINGS: `${API_BASE_URL}/api/Reports/bookings`,
  },
  
  // System
  SYSTEM: {
    HEALTH: `${API_BASE_URL}/api/health`,
  },
};

// Helper function for common headers
export const getHeaders = () => ({
  "Content-Type": "application/json",
  // Add authorization header here when implementing JWT
  // "Authorization": `Bearer ${getToken()}`,
});

// Helper function for GET requests
export const apiGet = async (url: string) => {
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  return response;
};

// Helper function for POST requests
export const apiPost = async (url: string, data: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response;
};

// Helper function for PUT requests
export const apiPut = async (url: string, data: any) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response;
};

// Helper function for DELETE requests
export const apiDelete = async (url: string) => {
  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return response;
};

export default API_ENDPOINTS;
