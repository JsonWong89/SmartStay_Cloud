// API Configuration - Centralized endpoint management
// Edit this file to change API URLs across the entire application

const API_BASE_URL = "http://localhost:5163";

export const API_ENDPOINTS = {
  // Base URL
  BASE: API_BASE_URL,
  
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  
  // Users Management
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,
  },
  
  // Hotels Management
  HOTELS: {
    BASE: `${API_BASE_URL}/api/hotels`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/hotels/${id}`,
  },
  
  // Rooms Management
  ROOMS: {
    BASE: `${API_BASE_URL}/api/rooms`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/rooms/${id}`,
    BY_HOTEL: (hotelId: string) => `${API_BASE_URL}/api/rooms?hotelId=${hotelId}`,
  },
  
  // Rate Plans (Pricing)
  RATE_PLANS: {
    BASE: `${API_BASE_URL}/api/rateplans`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/rateplans/${id}`,
    BY_HOTEL: (hotelId: string) => `${API_BASE_URL}/api/rateplans?hotelId=${hotelId}`,
  },
  
  // Bookings
  BOOKINGS: {
    BASE: `${API_BASE_URL}/api/bookings`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/bookings/${id}`,
  },
  
  // Hotel Managers
  HOTEL_MANAGERS: {
    BASE: `${API_BASE_URL}/api/hotelmanagers`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/hotelmanagers/${id}`,
  },
  
  // Daily Metrics
  DAILY_METRICS: {
    BASE: `${API_BASE_URL}/api/dailymetrics`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/dailymetrics/${id}`,
  },
  
  // Reports
  REPORTS: {
    DAILY_METRICS: `${API_BASE_URL}/api/reports/daily-metrics`,
    REVENUE: `${API_BASE_URL}/api/reports/revenue`,
    BOOKINGS: `${API_BASE_URL}/api/reports/bookings`,
  },
  
  // Monitoring
  MONITOR: {
    HEALTH: `${API_BASE_URL}/api/monitor/health`,
    EVENTS: `${API_BASE_URL}/api/systemevents`,
    AUDIT_LOGS: `${API_BASE_URL}/api/auditlogs`,
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
