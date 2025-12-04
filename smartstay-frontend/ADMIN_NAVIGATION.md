# Admin Navigation Bar

## Overview
A complete admin navigation system with 5 main menu items for managing the SmartStay hotel booking system.

## Features

### Navigation Menu Items
1. **Manage User Accounts** (`/admin/manage-managers`)
   - View all manager accounts
   - Add or remove managers
   - Edit manager details and permissions
   - Assign hotels to managers
   - Track manager activity

2. **Add or Remove Hotels** (`/admin/hotels`)
   - View all registered hotels
   - Add new hotels to the system
   - Remove or deactivate hotels
   - Edit hotel details and information
   - Assign managers to hotels

3. **Configure Room Types & Pricing** (`/admin/room-types`)
   - Define room types (Standard, Deluxe, Suite, etc.)
   - Set base pricing for each room type
   - Configure seasonal pricing adjustments
   - Manage room amenities and features
   - Set capacity and availability rules

4. **View System Reports** (`/admin/reports`)
   - Booking statistics and trends
   - Revenue reports across all hotels
   - Occupancy rates and analytics
   - Customer satisfaction metrics
   - Performance comparisons by hotel
   - Export reports to PDF or Excel

5. **Monitor Overall System** (`/admin/monitor`)
   - Real-time system status
   - Active bookings and check-ins
   - User activity monitoring
   - System alerts and notifications
   - Performance metrics (response times, uptime)
   - Database health and usage statistics

## Routes

### Auth Routes
- `/` - Login page (default)
- `/login` - Login page
- `/register` - Registration page

### Admin Routes
- `/admin` - Admin dashboard (overview with cards)
- `/admin/dashboard` - Admin dashboard
- `/admin/manage-managers` - Manager management page
- `/admin/hotels` - Hotel management page
- `/admin/room-types` - Room types and pricing page
- `/admin/reports` - Reports and metrics page
- `/admin/monitor` - System monitoring page

## Components

### NavigationBar (`src/components/NavigationBar.tsx`)
- Responsive navigation component
- Active route highlighting
- Logout button
- Gradient purple theme
- Mobile-friendly design

### Admin Pages
All pages follow a consistent layout with:
- Navigation bar at the top
- Page header with title and description
- Content cards with gradient headers
- Feature lists for planned functionality
- Action buttons

## Styling

### NavigationBar.css
- Sticky navigation
- Gradient purple background (#667eea to #764ba2)
- Hover effects and active states
- Responsive breakpoints for mobile/tablet

### AdminPages.css
- Shared styles for all admin pages
- Card-based layout
- Gradient backgrounds
- Feature lists with checkmarks
- Button styles

### AdminDashboard.css
- Grid layout for dashboard cards
- Icon-based navigation cards
- Hover animations
- Color-coded sections

## Usage

After login, users are directed to the admin dashboard where they can:
1. Click on any dashboard card to navigate to that section
2. Use the top navigation bar to switch between sections
3. Each page includes placeholder content showing planned features

## Development

Start the development server:
```bash
cd smartstay-frontend
npm run dev
```

Access the application at: `http://localhost:5173`

To test the navigation:
1. Navigate to `/admin` or `/admin/dashboard` to see the dashboard
2. Click on any card or navigation menu item
3. Test responsiveness by resizing the browser window

## Next Steps

Future implementations should include:
- Authentication and authorization logic
- API integration for data fetching
- CRUD operations for each section
- Real-time monitoring with WebSockets
- Data visualization for reports
- Export functionality for reports
- User permission management
- Audit logging
