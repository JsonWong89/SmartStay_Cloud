# Guest Module - SmartStay Hotel Management System

## Overview
This document describes the Guest (Customer) module of the SmartStay Hotel Management System. The guest functionality allows registered users to search, book, and review hotel rooms online.

## Features Implemented

### 1. **Guest Dashboard** (`/guest/dashboard`)
- Welcome screen with personalized greeting
- Quick search form for room availability (check-in/out dates, number of guests)
- Quick action cards for:
  - Search Rooms
  - My Reservations
  - My Profile
  - Reviews
- Featured hotels display
- Recent activity section

### 2. **Room Search** (`/guest/search`)
- Comprehensive search and filtering system:
  - Date range selection (check-in/check-out)
  - Number of guests
  - Hotel name filter
  - Room type filter
  - Price range slider ($50-$500)
- Real-time filtering of available rooms
- Room cards displaying:
  - Hotel name
  - Room type
  - Price per night
  - Capacity
  - Amenities
  - Availability status
- Direct booking from search results

### 3. **Booking Page** (`/guest/booking/:roomId`)
- Two-column layout:
  - **Left**: Booking form
  - **Right**: Booking summary (sticky)
  
- **Guest Information Collection**:
  - Full name (auto-populated from profile)
  - Email (auto-populated from profile)
  - Phone number
  - Address
  - Special requests (optional)

- **Document Upload** (AWS S3 Integration Ready):
  - ID Document (IC) - **Required**
  - Additional proof document for long-term stays (>30 days) - **Required for stays over 30 days**
  - File upload with validation
  - Visual feedback for uploaded files

- **Long-term Stay Detection**:
  - Automatic detection of stays over 30 days
  - Warning message for additional documentation requirement
  - Conditional validation based on stay duration

- **Booking Summary**:
  - Hotel and room details
  - Check-in/check-out dates
  - Duration calculation
  - Total price calculation
  - 20% deposit amount
  - Cancellation policy notice

### 4. **Payment Page** (`/guest/payment`)
- **Multiple Payment Methods**:
  - Credit/Debit Card
  - Bank Transfer
  - E-Wallet (GrabPay, Touch 'n Go, Boost, PayPal)

- **Card Payment Form**:
  - Card number with auto-formatting (XXXX XXXX XXXX XXXX)
  - Cardholder name
  - Expiry date (MM/YY format)
  - CVV (3 digits)
  - Real-time validation

- **Bank Transfer Information**:
  - Bank account details
  - Reference number generation
  - Payment instructions

- **E-Wallet Integration** (Ready for implementation):
  - Multiple e-wallet providers
  - Redirect-based payment flow

- **Payment Summary**:
  - Complete booking details
  - Deposit amount (20% of total)
  - Remaining balance notice
  - Cancellation policy reminder

- **Payment Processing**:
  - Loading state during processing
  - Success confirmation
  - Email receipt notification
  - Automatic redirect to reservations

### 5. **My Reservations** (`/guest/reservations`)
- **Filter Tabs**:
  - All Reservations
  - Confirmed
  - Checked In
  - Past Stays (Checked Out)
  - Cancelled

- **Reservation Cards** with:
  - Hotel and room information
  - Booking ID
  - Status badge with color coding
  - Check-in/check-out dates
  - Number of guests
  - Total price and deposit paid
  - Action buttons based on status

- **Available Actions**:
  - View Receipt (email notification)
  - Cancel Booking (with non-refundable deposit warning)
  - Write Review (for checked-out stays)
  - Modify Booking (for confirmed bookings)

- **Summary Dashboard**:
  - Total upcoming reservations
  - Total completed stays
  - Total cancelled bookings
  - Total reservations

- **Cancellation Policy**:
  - Non-refundable deposit warning
  - Double confirmation required
  - Clear cancellation notice

### 6. **Review Page** (`/guest/review/:reservationId`)
- **Overall Rating** (1-5 stars):
  - Large interactive star display
  - Hover effect
  - Rating labels (Poor, Fair, Good, Very Good, Excellent)

- **Detailed Ratings** (1-5 stars each):
  - Cleanliness
  - Service
  - Facilities
  - Value for Money

- **Review Form**:
  - Review title (optional)
  - Review text (required, minimum 50 characters)
  - Character counter

- **Review Guidelines**:
  - Be honest and constructive
  - Focus on personal experience
  - Avoid inappropriate language
  - Don't include personal information

- **Reservation Context**:
  - Hotel name
  - Room type
  - Stay dates

### 7. **Guest Profile** (`/guest/profile`)
- **Profile Information Management**:
  - Edit mode toggle
  - Profile picture placeholder
  - Full name
  - Email
  - Phone number
  - Date of birth
  - Nationality
  - Address

- **Account Statistics**:
  - Total bookings
  - Active bookings
  - Reviews written
  - Total spent

- **Security Settings**:
  - Password change functionality
  - Current password verification
  - New password with confirmation
  - Password strength requirements (minimum 8 characters)

- **Danger Zone**:
  - Account deletion
  - Double confirmation required
  - Clear warning about permanent deletion

## Routes

```
/guest/dashboard          - Guest main dashboard
/guest/search             - Search and filter available rooms
/guest/booking/:roomId    - Create new booking with room ID
/guest/reservations       - View and manage all reservations
/guest/payment            - Process deposit payment
/guest/review/:reservationId - Submit review for completed stay
/guest/profile            - Manage profile and account settings
```

## AWS Services Integration (Ready)

### 1. **AWS Cognito** (Authentication)
- User registration and login
- Email verification
- Password recovery
- Token management
- **Status**: Ready for integration with Cognito API

### 2. **AWS S3** (Document Storage)
- ID document (IC) upload
- Additional proof documents for long-term stays
- Secure file storage
- Pre-signed URL generation
- **Status**: File upload UI ready, needs S3 SDK integration

### 3. **AWS RDS** (Database)
- User profile data
- Booking information
- Reservation history
- Review storage
- **Status**: Mock data in place, ready for API integration

### 4. **Email Notifications** (via AWS SES or SNS)
- Booking confirmation
- Receipt delivery
- Booking reminders
- Cancellation notifications
- **Status**: Alert placeholders ready for email service

## Key Features Highlights

### ✅ Implemented
- Complete guest booking flow
- Multiple payment method support
- Document upload for verification
- Long-term stay special handling
- Reservation management
- Review system with detailed ratings
- Profile management
- Responsive design with Tailwind CSS
- Non-refundable deposit policy
- 20% deposit payment system

### 🔄 Ready for Backend Integration
- AWS Cognito authentication
- AWS S3 document storage
- AWS RDS database queries
- Payment gateway integration
- Email notification service
- Real-time availability checking
- Receipt generation and delivery

## Technical Stack
- **Frontend**: React 18.3+ with TypeScript
- **Routing**: React Router DOM v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS (utility classes)
- **Build Tool**: Vite
- **Form Handling**: Native React forms with validation

## Installation and Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Run development server**:
```bash
npm run dev
```

3. **Build for production**:
```bash
npm run build
```

## Design Patterns

### 1. **Responsive Design**
- Mobile-first approach
- Grid layouts for desktop
- Stack layouts for mobile
- Sticky elements for better UX

### 2. **User Experience**
- Clear visual feedback
- Loading states
- Confirmation dialogs for destructive actions
- Helpful error messages
- Progress indicators

### 3. **Data Flow**
- URL parameters for booking flow
- Location state for payment data
- Local state for forms
- Global state (Zustand) for user authentication

## Security Considerations

1. **Password Requirements**:
   - Minimum 8 characters
   - Should include mix of characters (to be enforced)

2. **Payment Security**:
   - SSL encryption notice
   - Secure payment processing
   - Card validation

3. **Document Upload**:
   - File type validation
   - Size limits (to be implemented)
   - Secure storage with S3

## Future Enhancements

1. **Advanced Search**:
   - Map view
   - Nearby attractions
   - Hotel ratings and reviews display
   - Photo galleries

2. **Booking Features**:
   - Room comparison
   - Wishlist/favorites
   - Booking modification
   - Early check-in/late check-out requests

3. **Payment Features**:
   - Multiple payment methods
   - Saved payment methods
   - Installment plans
   - Loyalty points

4. **Social Features**:
   - Share reviews
   - Recommend hotels
   - Social login (Google, Facebook)

5. **Notifications**:
   - Push notifications
   - SMS notifications
   - In-app notifications
   - Booking reminders

## Notes for Backend Integration

### API Endpoints Needed:

```
Authentication:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/verify

Rooms:
GET  /api/rooms/search?checkIn={date}&checkOut={date}&guests={number}
GET  /api/rooms/:id

Bookings:
POST /api/bookings
GET  /api/bookings/user/:userId
GET  /api/bookings/:id
PUT  /api/bookings/:id/cancel
PUT  /api/bookings/:id/modify

Payments:
POST /api/payments/process
GET  /api/payments/receipt/:bookingId

Reviews:
POST /api/reviews
GET  /api/reviews/hotel/:hotelId
GET  /api/reviews/user/:userId

Profile:
GET  /api/users/:id
PUT  /api/users/:id
PUT  /api/users/:id/password
DELETE /api/users/:id

Documents:
POST /api/documents/upload (returns S3 URL)
```

## Contact & Support
For questions about the Guest module implementation, please contact the development team.

---
**Last Updated**: November 11, 2025
**Module Status**: Frontend Complete ✅ | Backend Integration Pending 🔄
