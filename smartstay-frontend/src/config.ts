// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SWWXH7mTJRSAVeOBEH0fVq9Mo85z2qgQe4jfPSOwGiv4ykR6JUGOTKBsvgntAfpyTI83oOoaioNjTgpCou2suwx005cGG7nF9';

// API Base URL
export const API_BASE_URL = (import.meta as any).env.VITE__API_URL || 'https://localhost:7168';

// Get your Stripe publishable key from: https://dashboard.stripe.com/test/apikeys
// Replace the placeholder above with your actual key


// // src/config/api.ts
// const API_CONFIG = {
//   // Change this to match your backend port
//   BASE_URL: 'https://localhost:7161',
  
//   // API Endpoints
//   AUTH: {
//     LOGIN_USER: '/api/Auth/login/user',
//     LOGIN_GUEST: '/api/Auth/login/guest',
//     REGISTER_USER: '/api/Auth/register/user',
//     REGISTER_GUEST: '/api/Auth/register/guest',
//   },
  
//   BOOKINGS: {
//     GET_ALL: '/api/Bookings',
//     GET_BY_ID: (id: number) => `/api/Bookings/${id}`,
//     CREATE: '/api/bookings',
//     UPDATE_STATUS: (id: number) => `/api/Bookings/${id}/status`,
//     FRONTDESK_TODAY: '/api/Bookings/frontdesk/today',
//   },
  
//   DASHBOARD: {
//     STATS: '/api/Dashboard/stats',
//     REVENUE_WEEKLY: '/api/Dashboard/revenue/weekly',
//     ROOMS_DISTRIBUTION: '/api/Dashboard/rooms/distribution',
//     BOOKINGS_SUMMARY: '/api/Dashboard/bookings/summary',
//   },

//   ROOMS: {
//     GET_ALL: '/api/Rooms',
//     GET_BY_ID: (id: number) => `/api/Rooms/${id}`,
//     AVAILABLE: '/api/Rooms/available',
//   },

//   GUESTS: {
//     GET_ALL: '/api/Guests',
//     GET_BY_ID: (id: string) => `/api/Guests/${id}`,
//   },

//   PAYMENTS: {
//     GET_BY_BOOKING: (bookingId: number) => `/api/Payments/booking/${bookingId}`,
//     PROCESS: '/api/ayments',
//   },
// };

// export default API_CONFIG;