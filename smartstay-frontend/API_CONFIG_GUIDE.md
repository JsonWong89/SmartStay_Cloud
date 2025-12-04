# API Configuration Guide

## 📁 Centralized API Management

All API endpoints are now managed in one file: **`src/config/api.ts`**

### ✅ Benefits
- **Single source of truth** - Change backend URL once, updates everywhere
- **Type-safe** - TypeScript autocomplete for all endpoints
- **Easy maintenance** - No need to search through multiple files
- **Helper functions** - Pre-built GET, POST, PUT, DELETE methods

---

## 🔧 How to Use

### 1. Import in Your Component

```typescript
import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '../config/api';
```

### 2. Use the Endpoints

#### GET Request
```typescript
// Get all users
const response = await apiGet(API_ENDPOINTS.USERS.BASE);
const users = await response.json();

// Get specific user
const response = await apiGet(API_ENDPOINTS.USERS.BY_ID('user-guid-here'));
const user = await response.json();
```

#### POST Request
```typescript
// Create new hotel
const response = await apiPost(API_ENDPOINTS.HOTELS.BASE, {
  code: "HTL001",
  name: "Grand Hotel",
  city: "New York"
});
const result = await response.json();
```

#### PUT Request
```typescript
// Update user
const response = await apiPut(API_ENDPOINTS.USERS.BY_ID(userId), {
  fullName: "Updated Name",
  status: "Active"
});
```

#### DELETE Request
```typescript
// Delete hotel
const response = await apiDelete(API_ENDPOINTS.HOTELS.BY_ID(hotelId));
```

---

## 📋 Available Endpoints

### Authentication
```typescript
API_ENDPOINTS.AUTH.LOGIN          // POST login
API_ENDPOINTS.AUTH.REGISTER       // POST register
API_ENDPOINTS.AUTH.LOGOUT         // POST logout
```

### Users
```typescript
API_ENDPOINTS.USERS.BASE          // GET all, POST new
API_ENDPOINTS.USERS.BY_ID(id)     // GET, PUT, DELETE by ID
```

### Hotels
```typescript
API_ENDPOINTS.HOTELS.BASE         // GET all, POST new
API_ENDPOINTS.HOTELS.BY_ID(id)    // GET, PUT, DELETE by ID
```

### Room Types
```typescript
API_ENDPOINTS.ROOM_TYPES.BASE           // GET all, POST new
API_ENDPOINTS.ROOM_TYPES.BY_ID(id)      // GET, PUT, DELETE by ID
API_ENDPOINTS.ROOM_TYPES.BY_HOTEL(hotelId)  // GET by hotel
```

### Rate Plans
```typescript
API_ENDPOINTS.RATE_PLANS.BASE           // GET all, POST new
API_ENDPOINTS.RATE_PLANS.BY_ID(id)      // GET, PUT, DELETE by ID
API_ENDPOINTS.RATE_PLANS.BY_HOTEL(hotelId)  // GET by hotel
```

### Bookings
```typescript
API_ENDPOINTS.BOOKINGS.BASE       // GET all, POST new
API_ENDPOINTS.BOOKINGS.BY_ID(id)  // GET, PUT, DELETE by ID
```

### Reports
```typescript
API_ENDPOINTS.REPORTS.DAILY_METRICS  // GET daily metrics
API_ENDPOINTS.REPORTS.REVENUE        // GET revenue report
API_ENDPOINTS.REPORTS.BOOKINGS       // GET booking stats
```

### Monitoring
```typescript
API_ENDPOINTS.MONITOR.HEALTH      // GET system health
API_ENDPOINTS.MONITOR.EVENTS      // GET system events
API_ENDPOINTS.MONITOR.AUDIT_LOGS  // GET audit logs
```

### System
```typescript
API_ENDPOINTS.SYSTEM.HEALTH       // GET /api/health
```

---

## 🎯 Real Examples

### Example 1: Login Page
```typescript
import { API_ENDPOINTS, apiGet } from '../config/api';

const handleLogin = async (email: string, password: string) => {
  const response = await apiGet(API_ENDPOINTS.USERS.BASE);
  const users = await response.json();
  
  const user = users.find((u: any) => u.email === email);
  // ... rest of login logic
};
```

### Example 2: Register Page
```typescript
import { API_ENDPOINTS, apiPost } from '../config/api';

const handleRegister = async (userData: any) => {
  const response = await apiPost(API_ENDPOINTS.USERS.BASE, {
    fullName: userData.fullName,
    email: userData.email,
    passwordHash: userData.password,
    role: userData.role,
    status: "Active"
  });
  
  const result = await response.json();
  return result;
};
```

### Example 3: Hotels Page
```typescript
import { API_ENDPOINTS, apiGet, apiPost, apiDelete } from '../config/api';

// Get all hotels
const fetchHotels = async () => {
  const response = await apiGet(API_ENDPOINTS.HOTELS.BASE);
  const hotels = await response.json();
  return hotels;
};

// Create new hotel
const createHotel = async (hotelData: any) => {
  const response = await apiPost(API_ENDPOINTS.HOTELS.BASE, hotelData);
  return await response.json();
};

// Delete hotel
const deleteHotel = async (hotelId: string) => {
  await apiDelete(API_ENDPOINTS.HOTELS.BY_ID(hotelId));
};
```

---

## 🔄 Changing Backend URL

To change the backend URL (e.g., when deploying to production), edit **ONE line**:

**File:** `src/config/api.ts`

```typescript
// Change this line:
const API_BASE_URL = "http://localhost:5163";

// To production URL:
const API_BASE_URL = "https://api.smartstay.com";
```

That's it! All endpoints automatically update across the entire app.

---

## 🔐 Adding Authentication

When you implement JWT tokens, update the `getHeaders()` function:

```typescript
export const getHeaders = () => {
  const token = localStorage.getItem('authToken'); // or from your auth store
  
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };
};
```

Now all API calls automatically include the auth token!

---

## ✅ Files Already Updated

- ✅ `LoginPage.tsx` - Uses centralized config
- ✅ `Register_page.tsx` - Uses centralized config

### Next: Update Admin Pages

When implementing CRUD operations in admin pages, import and use the config:

```typescript
// ManageUsersPage.tsx
import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '../../config/api';

// HotelsPage.tsx
import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '../../config/api';

// etc...
```

---

## 🎉 Summary

**Before:** API URLs scattered across 10+ files
**After:** One config file (`api.ts`) manages everything

**Benefits:**
- ✅ Change URL once, updates everywhere
- ✅ TypeScript autocomplete
- ✅ Helper functions for common operations
- ✅ Easy to maintain and scale
- ✅ Cleaner, more readable code

Now you can focus on building features instead of managing URLs! 🚀
