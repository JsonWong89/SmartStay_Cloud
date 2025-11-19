# SmartStay API Endpoints Reference

Base URL: `http://localhost:5163/api`

---

## 🔐 Authentication

### POST /api/auth/login
Login to the system

**Request:**
```json
{
  "email": "admin@smartstay.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "guid",
    "email": "admin@smartstay.com",
    "fullName": "System Administrator",
    "role": "Admin",
    "status": "Active"
  },
  "message": "Login successful"
}
```

### POST /api/auth/register
Register new admin/manager account

**Request:**
```json
{
  "email": "manager@hotel.com",
  "password": "SecurePass123!",
  "fullName": "John Manager",
  "role": "Manager"
}
```

---

## 👥 User Management

### GET /api/users
Get all managers and admins

**Response:**
```json
[
  {
    "id": "guid",
    "email": "manager@hotel.com",
    "fullName": "John Manager",
    "role": "Manager",
    "status": "Active",
    "lastLoginAt": "2025-11-18T10:30:00Z",
    "createdAt": "2025-11-01T08:00:00Z"
  }
]
```

### GET /api/users/{id}
Get single user by ID

### POST /api/users
Create new user

**Request:**
```json
{
  "email": "newmanager@hotel.com",
  "password": "SecurePass123!",
  "fullName": "Jane Manager",
  "role": "Manager"
}
```

### PUT /api/users/{id}
Update user

**Request:**
```json
{
  "fullName": "Jane Smith",
  "role": "Admin",
  "status": "Suspended"
}
```

### DELETE /api/users/{id}
Delete user

---

## 🏨 Hotel Management

### GET /api/hotels
Get all hotels

**Response:**
```json
[
  {
    "id": "guid",
    "code": "HTL001",
    "name": "Grand Plaza Hotel",
    "status": "Active",
    "email": "info@grandplaza.com",
    "phone": "+1-555-0100",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "timezone": "America/New_York",
    "currency": "USD",
    "checkInTime": "15:00:00",
    "checkOutTime": "11:00:00",
    "createdAt": "2025-11-01T08:00:00Z"
  }
]
```

### GET /api/hotels/{id}
Get single hotel

### POST /api/hotels
Create new hotel

**Request:**
```json
{
  "code": "HTL002",
  "name": "Seaside Resort",
  "email": "info@seaside.com",
  "phone": "+1-555-0200",
  "address": "456 Beach Road",
  "city": "Miami",
  "state": "FL",
  "country": "USA",
  "postalCode": "33101",
  "timezone": "America/New_York",
  "currency": "USD"
}
```

### PUT /api/hotels/{id}
Update hotel

**Request:**
```json
{
  "name": "Grand Plaza Hotel & Spa",
  "status": "Active",
  "phone": "+1-555-0101"
}
```

### DELETE /api/hotels/{id}
Delete/deactivate hotel

---

## 🛏️ Room Types

### GET /api/hotels/{hotelId}/room-types
Get all room types for a hotel

**Response:**
```json
[
  {
    "id": "guid",
    "hotelId": "hotel-guid",
    "code": "STD",
    "name": "Standard Room",
    "description": "Comfortable standard room with city view",
    "capacityAdults": 2,
    "capacityChildren": 1,
    "bedType": "Queen Bed",
    "sizeSquareMeters": 25.5,
    "status": "Active",
    "createdAt": "2025-11-01T08:00:00Z"
  }
]
```

### POST /api/room-types
Create new room type

**Request:**
```json
{
  "hotelId": "hotel-guid",
  "code": "DLX",
  "name": "Deluxe Room",
  "description": "Spacious room with ocean view",
  "capacityAdults": 2,
  "capacityChildren": 2,
  "bedType": "King Bed",
  "sizeSquareMeters": 35.0
}
```

### PUT /api/room-types/{id}
Update room type

### DELETE /api/room-types/{id}
Delete room type

---

## 💰 Rate Plans (Pricing)

### GET /api/hotels/{hotelId}/rate-plans
Get all rate plans for a hotel

**Response:**
```json
[
  {
    "id": "guid",
    "hotelId": "hotel-guid",
    "roomTypeId": "roomtype-guid",
    "code": "BAR",
    "name": "Best Available Rate",
    "description": "Standard flexible rate",
    "basePrice": 150.00,
    "currency": "USD",
    "startDate": "2025-11-01",
    "endDate": null,
    "minStay": 1,
    "maxStay": null,
    "status": "Active",
    "roomTypeName": "Standard Room"
  }
]
```

### POST /api/rate-plans
Create rate plan

**Request:**
```json
{
  "hotelId": "hotel-guid",
  "roomTypeId": "roomtype-guid",
  "code": "PROMO",
  "name": "Holiday Promotion",
  "description": "Special holiday pricing",
  "basePrice": 120.00,
  "currency": "USD",
  "startDate": "2025-12-15",
  "endDate": "2026-01-05",
  "minStay": 2
}
```

### PUT /api/rate-plans/{id}
Update rate plan

### DELETE /api/rate-plans/{id}
Delete rate plan

---

## 📊 Reports

### GET /api/reports/daily-metrics
Get daily metrics

**Query Parameters:**
- `hotelId` (optional) - Filter by hotel
- `startDate` (required) - Start date (YYYY-MM-DD)
- `endDate` (required) - End date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "hotelId": "hotel-guid",
    "hotelName": "Grand Plaza Hotel",
    "date": "2025-11-18",
    "roomsAvailable": 100,
    "roomsSold": 75,
    "occupancyPercent": 75.00,
    "averageDailyRate": 150.00,
    "revenueTotalRooms": 11250.00,
    "bookingsCount": 75,
    "cancellationsCount": 5
  }
]
```

### GET /api/reports/revenue
Get revenue report

**Query Parameters:**
- `startDate` (required)
- `endDate` (required)
- `hotelId` (optional)

**Response:**
```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "totalRevenue": 450000.00,
  "totalBookings": 3000,
  "averageBookingValue": 150.00,
  "hotelBreakdown": [
    {
      "hotelId": "guid",
      "hotelName": "Grand Plaza",
      "revenue": 225000.00,
      "bookingsCount": 1500
    }
  ]
}
```

### GET /api/reports/bookings
Get booking statistics

**Query Parameters:**
- `hotelId` (optional)
- `startDate` (required)
- `endDate` (required)
- `status` (optional) - Filter by status

**Response:**
```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "totalBookings": 3000,
  "confirmedBookings": 2700,
  "canceledBookings": 300,
  "cancellationRate": 10.00,
  "recentBookings": [
    {
      "bookingNumber": "BK202511180001",
      "hotelName": "Grand Plaza",
      "guestName": "John Doe",
      "checkInDate": "2025-11-20",
      "checkOutDate": "2025-11-25",
      "status": "Confirmed",
      "total": 750.00
    }
  ]
}
```

---

## 📈 System Monitoring

### GET /api/monitor/health
Get system health status

**Response:**
```json
{
  "status": "Healthy",
  "checkedAt": "2025-11-18T15:30:00Z",
  "database": {
    "isConnected": true,
    "responseTimeMs": 15,
    "activeConnections": 5
  },
  "stats": {
    "activeBookings": 1500,
    "todayCheckIns": 120,
    "todayCheckOuts": 95,
    "activeUsers": 45,
    "totalHotels": 10
  },
  "recentEvents": [
    {
      "id": "guid",
      "level": "Info",
      "source": "API",
      "message": "System health check completed",
      "createdAt": "2025-11-18T15:30:00Z"
    }
  ]
}
```

### GET /api/monitor/events
Get system events

**Query Parameters:**
- `level` (optional) - Info, Warning, Error
- `source` (optional) - API, Worker, Database
- `limit` (optional, default: 100)

**Response:**
```json
[
  {
    "id": "guid",
    "level": "Error",
    "source": "API",
    "message": "Database connection timeout",
    "createdAt": "2025-11-18T14:30:00Z"
  }
]
```

### GET /api/monitor/audit-logs
Get audit logs

**Query Parameters:**
- `userId` (optional)
- `entityType` (optional) - User, Hotel, RoomType, etc.
- `startDate` (optional)
- `endDate` (optional)
- `limit` (optional, default: 100)

**Response:**
```json
[
  {
    "id": "guid",
    "userEmail": "admin@smartstay.com",
    "action": "Update",
    "entityType": "Hotel",
    "entityId": "hotel-guid",
    "changes": "{\"name\":\"Old Name -> New Name\"}",
    "ipAddress": "192.168.1.1",
    "createdAt": "2025-11-18T14:00:00Z"
  }
]
```

---

## 🔗 Hotel-Manager Assignment

### POST /api/hotels/{hotelId}/managers
Assign manager to hotel

**Request:**
```json
{
  "userId": "user-guid"
}
```

### DELETE /api/hotels/{hotelId}/managers/{userId}
Remove manager from hotel

### GET /api/hotels/{hotelId}/managers
Get all managers for a hotel

---

## ⚠️ Error Responses

All endpoints return standard error format:

```json
{
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content (successful delete/update)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing with PowerShell

```powershell
# Test login
Invoke-RestMethod -Uri "http://localhost:5163/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@smartstay.com","password":"Admin123!"}'

# Get all hotels
Invoke-RestMethod -Uri "http://localhost:5163/api/hotels" -Method GET

# Create hotel
$body = @{
  code = "HTL003"
  name = "Downtown Inn"
  city = "Boston"
  country = "USA"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5163/api/hotels" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

## 📝 Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)
- All GUIDs should be valid UUID v4 format
- Decimal values use 2 decimal places for currency
- Times use 24-hour format (HH:mm:ss)
- Authentication token (if implemented) should be in `Authorization: Bearer {token}` header
