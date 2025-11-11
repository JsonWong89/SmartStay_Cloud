# 🏨 SmartStay Guest Module - Visual Overview

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GUEST PORTAL FRONTEND                     │
│                  (React + TypeScript + Vite)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      7 MAIN PAGES                            │
├─────────────────────────────────────────────────────────────┤
│  1. 🏠 Guest Dashboard      - Main entry point               │
│  2. 🔍 Room Search          - Find available rooms           │
│  3. 📝 Booking Page         - Create new booking             │
│  4. 📋 My Reservations      - Manage bookings                │
│  5. 💳 Payment Page         - Process deposit                │
│  6. ⭐ Review Page          - Submit reviews                 │
│  7. 👤 Guest Profile        - Account management             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND INTEGRATION                       │
│                    (Ready for Connection)                    │
├─────────────────────────────────────────────────────────────┤
│  • AWS Cognito     - User authentication                     │
│  • AWS S3          - Document storage                        │
│  • AWS RDS         - Database (PostgreSQL/MySQL)            │
│  • AWS SES/SNS     - Email notifications                     │
│  • API Gateway     - REST API endpoints                      │
│  • Payment Gateway - Stripe/PayPal integration              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Complete User Journey

```
START: Guest visits website
   │
   ├─→ 🏠 DASHBOARD (/)
   │   • View featured hotels
   │   • Quick search form
   │   • Access quick actions
   │
   ├─→ 🔍 SEARCH ROOMS (/guest/search)
   │   • Filter by dates, price, hotel, room type
   │   • View available rooms with details
   │   • Click "Book Now" on desired room
   │       │
   │       ├─→ 📝 BOOKING PAGE (/guest/booking/:roomId)
   │       │   • Fill guest information
   │       │   • Upload IC document (required)
   │       │   • Upload additional docs (if stay > 30 days)
   │       │   • Review booking summary
   │       │   • Click "Proceed to Payment"
   │       │       │
   │       │       ├─→ 💳 PAYMENT PAGE (/guest/payment)
   │       │       │   • Select payment method (Card/Bank/E-wallet)
   │       │       │   • Enter payment details
   │       │       │   • Pay 20% deposit
   │       │       │   • Get confirmation + email receipt
   │       │       │   • Redirect to reservations
   │       │       │
   │       │       └─→ 📋 MY RESERVATIONS (/guest/reservations)
   │       │           • View all bookings (confirmed/active/past/cancelled)
   │       │           • Filter by status
   │       │           • Actions available:
   │       │               - View receipt
   │       │               - Cancel booking (deposit non-refundable)
   │       │               - Write review (if checked out)
   │       │           │
   │       │           └─→ ⭐ REVIEW PAGE (/guest/review/:reservationId)
   │       │               • Rate overall experience (1-5 stars)
   │       │               • Rate details (cleanliness, service, etc.)
   │       │               • Write review text
   │       │               • Submit review
   │
   └─→ 👤 PROFILE (/guest/profile)
       • Edit personal information
       • View account statistics
       • Change password
       • Delete account (danger zone)

END: Guest completes their journey
```

## 📱 Page Layouts

### 1. 🏠 Guest Dashboard
```
┌────────────────────────────────────────────────┐
│  Header: Logo | Welcome, [Name] | Logout       │
├────────────────────────────────────────────────┤
│                                                 │
│  🏨 Find Your Perfect Stay                     │
│  ┌──────────────────────────────────────────┐  │
│  │ [Check-in] [Check-out] [Guests] [Search]│  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Quick Actions:                                 │
│  [🔍 Search] [📋 Reservations]                 │
│  [👤 Profile] [⭐ Reviews]                     │
│                                                 │
│  Featured Hotels:                               │
│  [Hotel 1]  [Hotel 2]  [Hotel 3]               │
│                                                 │
│  Recent Activity                                │
│  • No recent bookings                          │
└────────────────────────────────────────────────┘
```

### 2. 🔍 Room Search
```
┌────────────────────────────────────────────────┐
│  Header: Back to Dashboard                     │
├──────────┬─────────────────────────────────────┤
│ FILTERS  │  SEARCH RESULTS (12 rooms)          │
│          │                                      │
│ Check-in │  ┌──────────────────────────────┐   │
│ [Date]   │  │ 🛏️ Deluxe Double            │   │
│          │  │ Grand Plaza Hotel            │   │
│ Check-out│  │ $180/night | 2 guests        │   │
│ [Date]   │  │ [WiFi][AC][TV][Mini Bar]     │   │
│          │  │ [Book Now] [View Details]    │   │
│ Guests   │  └──────────────────────────────┘   │
│ [1-10]   │                                      │
│          │  ┌──────────────────────────────┐   │
│ Hotel    │  │ 🛏️ Ocean View Suite         │   │
│ [Search] │  │ Seaside Resort               │   │
│          │  │ $250/night | 2 guests        │   │
│ Room Type│  │ [WiFi][AC][Balcony][View]    │   │
│ [Filter] │  │ [Book Now] [View Details]    │   │
│          │  └──────────────────────────────┘   │
│ Max Price│                                      │
│ [$500]   │  ... more rooms ...                 │
│          │                                      │
│ [Apply]  │                                      │
└──────────┴─────────────────────────────────────┘
```

### 3. 📝 Booking Page
```
┌────────────────────────────────────────────────┐
│  🏨 Complete Your Booking | [Back]             │
├──────────────────────────────┬─────────────────┤
│  BOOKING FORM                │ BOOKING SUMMARY │
│                              │                 │
│  Guest Information           │ Hotel: Grand... │
│  ┌────────────────────────┐  │ Room: Deluxe... │
│  │ Full Name    [........]│  │ ─────────────── │
│  │ Email        [........]│  │ Check-in: ...   │
│  │ Phone        [........]│  │ Check-out: ...  │
│  │ Address      [........]│  │ Duration: 5 ni..│
│  │ Special Req. [........]│  │ Guests: 2       │
│  └────────────────────────┘  │ ─────────────── │
│                              │ Price/night: $..│
│  Document Upload             │ Total: $900     │
│  ┌────────────────────────┐  │ Deposit (20%):  │
│  │ IC Document * [Upload]│  │ $180.00         │
│  │ ✓ document.pdf        │  │ ─────────────── │
│  └────────────────────────┘  │ Note: Deposit   │
│                              │ non-refundable  │
│  ⚠️ Long-term stay (>30d)    │                 │
│  Additional doc required     │                 │
│                              │                 │
│  [Proceed to Payment →]      │                 │
└──────────────────────────────┴─────────────────┘
```

### 4. 💳 Payment Page
```
┌────────────────────────────────────────────────┐
│  💳 Payment | [Back]                           │
├──────────────────────────────┬─────────────────┤
│  PAYMENT METHOD              │ PAYMENT SUMMARY │
│                              │                 │
│  [💳 Card] [🏦 Bank] [📱 E-wallet]            │
│                              │ Hotel: Grand... │
│  Card Details                │ Room: Deluxe... │
│  ┌────────────────────────┐  │ ─────────────── │
│  │ Card Number            │  │ Check-in: ...   │
│  │ [1234 5678 9012 3456] │  │ Check-out: ...  │
│  │                        │  │ Guests: 2       │
│  │ Name on Card           │  │ ─────────────── │
│  │ [JOHN DOE]            │  │ Guest: John...  │
│  │                        │  │ Email: john@... │
│  │ Expiry    CVV          │  │ ─────────────── │
│  │ [MM/YY]   [123]       │  │ Total: $900     │
│  └────────────────────────┘  │                 │
│                              │ Deposit (20%):  │
│  [Pay $180.00 (Deposit) →]   │ $180.00         │
│  🔒 Secured with SSL         │ ─────────────── │
│                              │ ⚠️ Non-refund.. │
└──────────────────────────────┴─────────────────┘
```

### 5. 📋 My Reservations
```
┌────────────────────────────────────────────────┐
│  📋 My Reservations | [Back to Dashboard]      │
├────────────────────────────────────────────────┤
│  [All] [Confirmed] [Checked-in] [Past] [Cancel]│
├────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐  │
│  │ 🏨 Grand Plaza Hotel - Deluxe Double     │  │
│  │ [✓ CONFIRMED]  Booking ID: #1            │  │
│  │ Check-in: 2025-11-20 | Check-out: 11-25 │  │
│  │ Guests: 2 | Total: $900 | Deposit: $180 │  │
│  │ [📄 View Receipt] [✗ Cancel Booking]     │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 🏨 Seaside Resort - Ocean View Suite    │  │
│  │ [✓✓ CHECKED OUT]  Booking ID: #2        │  │
│  │ Check-in: 2025-11-15 | Check-out: 11-18 │  │
│  │ Guests: 2 | Total: $750 | Deposit: $150 │  │
│  │ [📄 View Receipt] [⭐ Write Review]      │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Summary: [3 Upcoming] [5 Completed] [12 Total]│
└────────────────────────────────────────────────┘
```

### 6. ⭐ Review Page
```
┌────────────────────────────────────────────────┐
│  ⭐ Write a Review | [Back]                    │
├────────────────────────────────────────────────┤
│  Your Stay                                      │
│  Hotel: Grand Plaza | Room: Deluxe Double      │
│  Check-in: 2025-11-15 | Check-out: 2025-11-18 │
├────────────────────────────────────────────────┤
│  Overall Rating *                               │
│  [⭐⭐⭐⭐⭐] Excellent                          │
├────────────────────────────────────────────────┤
│  Detailed Ratings                               │
│  Cleanliness      [⭐⭐⭐⭐☆]                   │
│  Service          [⭐⭐⭐⭐⭐]                   │
│  Facilities       [⭐⭐⭐⭐☆]                   │
│  Value for Money  [⭐⭐⭐⭐⭐]                   │
├────────────────────────────────────────────────┤
│  Your Review                                    │
│  Review Title (optional)                        │
│  [Amazing stay at Grand Plaza!]                │
│                                                 │
│  Your Experience *                              │
│  ┌────────────────────────────────────────┐   │
│  │ Had a wonderful time. The room was     │   │
│  │ clean, spacious, and the staff were... │   │
│  └────────────────────────────────────────┘   │
│  (125/50 characters)                           │
├────────────────────────────────────────────────┤
│  Review Guidelines                              │
│  • Be honest and constructive                  │
│  • Focus on your personal experience           │
│  • Avoid inappropriate language                │
│                                                 │
│  [Submit Review] [Cancel]                      │
└────────────────────────────────────────────────┘
```

### 7. 👤 Guest Profile
```
┌────────────────────────────────────────────────┐
│  👤 My Profile | [Back to Dashboard]           │
├────────────────────────────────────────────────┤
│  Profile Information          [Edit Profile]    │
│                                                 │
│         👤 Profile Picture                      │
│              [📷]                               │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Full Name      [Justin Lee]              │  │
│  │ Email          [justin@example.com]      │  │
│  │ Phone          [+60123456789]            │  │
│  │ Date of Birth  [1990-01-01]              │  │
│  │ Nationality    [Malaysian]               │  │
│  │ Address        [123 Main St, KL]         │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [Save Changes]                                 │
├────────────────────────────────────────────────┤
│  Account Statistics                             │
│  [12 Bookings] [3 Active] [5 Reviews] [$2,450]│
├────────────────────────────────────────────────┤
│  Security Settings                              │
│  [Change Password]                              │
├────────────────────────────────────────────────┤
│  ⚠️ Danger Zone                                │
│  Once you delete your account, there is no     │
│  going back. Please be certain.                │
│  [Delete My Account]                           │
└────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

```
Primary Colors:
┌─────┬─────┬─────┬─────┬─────┐
│Blue │Green│Yellow│Red │Purple│
│#2563│#16a3│#eab3│#dc26│#9333│
│eb   │4a   │08   │26  │ea   │
└─────┴─────┴─────┴─────┴─────┘

Status Colors:
• Confirmed:   Blue
• Checked-in:  Green
• Checked-out: Gray
• Cancelled:   Red
• Warning:     Yellow

Background:
• Primary:   White (#ffffff)
• Secondary: Gray-100 (#f3f4f6)
• Hover:     Gray-200 (#e5e7eb)
```

## 📊 Data Flow Diagram

```
User Action → Component → State Update → UI Re-render
                 ↓
              API Call (Future)
                 ↓
         AWS Backend Services
                 ↓
         Database Update
                 ↓
         Response to Frontend
                 ↓
         Update UI + Notification
```

## 🔐 Security Features

```
✅ Password Requirements (8+ characters)
✅ Confirmation dialogs for destructive actions
✅ Non-refundable deposit warnings
✅ Double-confirmation for account deletion
✅ SSL encryption notice on payment
✅ Secure file upload validation
✅ Form validation on all inputs
```

## 📈 Metrics & Analytics (Ready to Track)

```
User Engagement:
• Page views per session
• Time spent on each page
• Bounce rate
• Conversion rate (search → booking)

Booking Metrics:
• Average booking value
• Cancellation rate
• Popular room types
• Preferred payment methods

Review Metrics:
• Average rating per hotel
• Review submission rate
• Response time

User Retention:
• Repeat booking rate
• Account lifespan
• Total lifetime value
```

---

**🎉 Frontend Complete!**
All guest features are built and ready for backend integration.
