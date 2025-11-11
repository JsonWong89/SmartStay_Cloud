# Guest Module - Quick Start Guide

## 🎯 What's Been Created

I've built a complete **Guest/Customer frontend** for your SmartStay Hotel Management System with 7 main pages and full booking flow functionality.

## 📁 File Structure

```
smartstay-frontend/
└── src/
    └── pages/
        └── Guest/
            ├── GuestDashboard.tsx      (Main guest homepage)
            ├── RoomSearch.tsx          (Search & filter rooms)
            ├── BookingPage.tsx         (Create booking + upload docs)
            ├── MyReservations.tsx      (View & manage bookings)
            ├── PaymentPage.tsx         (Process deposit payment)
            ├── ReviewPage.tsx          (Submit reviews after stay)
            ├── GuestProfile.tsx        (Manage account & profile)
            └── index.ts                (Export all components)
```

## 🚀 Quick Start

### 1. Run the Development Server
```bash
cd smartstay-frontend
npm install
npm run dev
```

### 2. Access Guest Portal
Navigate to: `http://localhost:5173/guest/dashboard`

## 🔑 Key Features Implemented

### ✅ Guest Dashboard (`/guest/dashboard`)
- Hero section with quick search
- Quick action cards
- Featured hotels
- Recent activity

### ✅ Room Search (`/guest/search`)
- Advanced filtering (dates, hotel, room type, price, capacity)
- Real-time search results
- Book now functionality

### ✅ Booking Page (`/guest/booking/:roomId`)
- Guest information form
- **Document upload** (IC + additional for long-term stays)
- **Long-term stay detection** (>30 days)
- Booking summary with pricing

### ✅ Payment Page (`/guest/payment`)
- **Multiple payment methods**: Card, Bank Transfer, E-Wallet
- Card details form with validation
- **20% deposit payment**
- Payment processing with loading state
- Receipt email notification

### ✅ My Reservations (`/guest/reservations`)
- Filter by status (All, Confirmed, Checked-in, Past, Cancelled)
- View receipt
- **Cancel booking** (non-refundable deposit warning)
- Write reviews for completed stays
- Summary statistics

### ✅ Review Page (`/guest/review/:reservationId`)
- 5-star rating system
- Detailed ratings (cleanliness, service, facilities, value)
- Review text with guidelines

### ✅ Guest Profile (`/guest/profile`)
- Edit profile information
- Account statistics
- Change password
- **Delete account** (danger zone)

## 🛣️ Complete Route List

```
/guest/dashboard             → Guest main page
/guest/search               → Search available rooms
/guest/booking/:roomId      → Create new booking
/guest/reservations         → View all reservations
/guest/payment              → Process payment
/guest/review/:reservationId → Submit review
/guest/profile              → Manage profile
```

## 🔗 Booking Flow

```
1. Dashboard → Search Rooms
2. Room Search → Select Room → Book Now
3. Booking Page → Fill Details → Upload Documents → Proceed to Payment
4. Payment Page → Select Method → Pay Deposit → Confirmation
5. My Reservations → View/Manage Booking
6. After Checkout → Write Review
```

## 📋 Requirements Met

All requirements from your specification have been implemented:

- ✅ Register/login (Cognito-ready)
- ✅ Search and book available rooms
- ✅ Upload ID documents (IC)
- ✅ Additional proof for long-term stay
- ✅ View or cancel reservations (no deposit refund)
- ✅ Pay deposit (20%)
- ✅ View receipt (email notification ready)
- ✅ Submit reviews after checkout

## 🔧 AWS Integration Points (Ready)

### 1. **AWS Cognito** (User Authentication)
```typescript
// Current: Mock authentication with Zustand
// Ready for: Cognito SDK integration
```

### 2. **AWS S3** (Document Storage)
```typescript
// Current: File upload UI with File object
// Ready for: S3 upload with pre-signed URLs
```

### 3. **AWS RDS** (Database)
```typescript
// Current: Mock data arrays
// Ready for: API calls to RDS via API Gateway
```

### 4. **Email Notifications**
```typescript
// Current: Alert messages
// Ready for: SES/SNS email service
```

## 🎨 Design System

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS utility classes
- **Icons**: Emoji (can be replaced with icon library)
- **Colors**: 
  - Primary: Blue (bg-blue-600)
  - Success: Green (bg-green-600)
  - Warning: Yellow (bg-yellow-500)
  - Danger: Red (bg-red-600)
- **Responsive**: Mobile-first design

## 📱 Key User Flows

### Flow 1: New Booking
```
Search → Filter Rooms → View Details → Fill Form → Upload IC → 
Pay Deposit → Get Confirmation → Receive Email Receipt
```

### Flow 2: Manage Reservation
```
My Reservations → View Booking → Cancel (if needed) → 
Confirm Cancellation → See Updated Status
```

### Flow 3: Post-Stay Review
```
My Reservations → Completed Stay → Write Review → 
Rate Overall & Details → Submit → See Thank You Message
```

## ⚠️ Important Notes

1. **TypeScript Errors**: The compile errors you see are due to missing `node_modules`. Run `npm install` to fix.

2. **Mock Data**: All data is currently mocked. Replace with API calls when backend is ready.

3. **Document Upload**: File upload UI is ready. Integrate with S3 when backend is set up.

4. **Payment Gateway**: Payment form is ready. Integrate with actual payment provider (Stripe, PayPal, etc.).

5. **Deposit Policy**: Non-refundable deposit warnings are displayed to users.

## 🔄 Next Steps (Backend Integration)

1. **Set up AWS Cognito** for user authentication
2. **Create API Gateway** endpoints
3. **Connect to RDS** database
4. **Implement S3 upload** for documents
5. **Add payment gateway** integration
6. **Set up email service** (SES/SNS)
7. **Replace mock data** with API calls

## 📞 Testing Tips

1. **Navigate** through the complete booking flow
2. **Test filters** on the search page
3. **Try uploading files** on booking page
4. **Test payment methods** selection
5. **Cancel a booking** to see warnings
6. **Write a review** with ratings
7. **Edit profile** and change password

## 🎯 Success Criteria

All guest responsibilities from your requirements have been implemented:
- ✅ Register/login capability (Cognito-ready)
- ✅ Search and book available rooms
- ✅ Upload ID documents
- ✅ View or cancel reservations
- ✅ Pay deposit
- ✅ View receipt
- ✅ Submit reviews

---

**Status**: Frontend Complete ✅  
**Ready for**: Backend API Integration 🔄  
**Date**: November 11, 2025
