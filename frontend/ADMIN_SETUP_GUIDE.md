# Car Rental Admin Setup Guide

## Test User Credentials

All test users have the password: **`password`**

### Manager Accounts (Admin Access)
These accounts have access to all admin features:

1. **Marie Leclerc** (Manager)
   - Email: `manager@carrental.com`
   - Password: `password`
   - Role: Manager
   - Access: Dashboard, Users, Reservations, Fleet Management

2. **Thomas Bernard** (Manager)
   - Email: `thomas@carrental.com`
   - Password: `password`
   - Role: Manager
   - Access: Dashboard, Users, Reservations, Fleet Management

### Client Accounts (Regular Users - Can Make Reservations)

1. **Alex Martin** ⭐ STUDENT
   - Email: `alex@example.com`
   - Password: `password`
   - Is Student: Yes (gets 30% discount on student-friendly cars)

2. **Jean Dupont**
   - Email: `jean@example.com`
   - Password: `password`
   - Is Student: No

3. **Sarah Müller** ⭐ STUDENT
   - Email: `sarah@example.com`
   - Password: `password`
   - Is Student: Yes (gets 30% discount on student-friendly cars)

4. **Carlos Rodríguez**
   - Email: `carlos@example.com`
   - Password: `password`
   - Is Student: No

5. **Amira Benali** ⭐ STUDENT
   - Email: `amira@example.com`
   - Password: `password`
   - Is Student: Yes (gets 30% discount on student-friendly cars)

6. **Lucas Petit**
   - Email: `lucas@example.com`
   - Password: `password`
   - Is Student: No

---

## New Admin Pages Created

### 1. **Users Management** (`/users`)
- **Access**: Manager only
- **Features**:
  - View all users in table format
  - Add new users
  - Edit existing users
  - Delete users
  - Filter by student status
  - View user role and contact information

### 2. **Reservations Management** (`/reservations`)
- **Access**: Manager only
- **Features**:
  - View all bookings with complete details
  - Search reservations by user name, car, or booking ID
  - Filter by status (All, Active, Completed, Cancelled)
  - Create new reservations manually
  - Edit existing reservations
  - Delete reservations
  - See user info, vehicle details, dates, duration, and total price
  - Status badges with visual indicators

### 3. **Fleet Management (Cars CRUD)** (`/cars`)
- **Access**: Manager only
- **Features**:
  - View all vehicles in grid format
  - **Create** - Add new cars with full details:
    - Make, Model, Year
    - Category (Economy, SUV, Luxury)
    - Price per day
    - Seats, Transmission, Fuel Type
    - Image URL
    - Rating and number of reviews
    - Student-friendly flag (30% discount eligible)
    - Availability status
  - **Read** - Display car cards with:
    - Vehicle image
    - Key specifications (seats, transmission, fuel)
    - Price per day
    - Availability status
    - Rating
  - **Update** - Edit all car properties
  - **Delete** - Remove vehicles from fleet
  - Search by make, model, or year
  - Filter by category (Economy, SUV, Luxury)

---

## How It Works

### For Managers:
1. Log in with manager credentials (e.g., `manager@carrental.com`)
2. In the navbar, you'll see 4 admin icons (after Dashboard):
   - 📊 Dashboard - Overall statistics
   - 👥 Users - Manage users
   - 📄 Reservations - Manage bookings
   - 🚗 Fleet Management - Manage cars
3. Each page has full CRUD capabilities with intuitive interfaces

### For Customers:
1. Log in with any client account
2. Browse the fleet
3. Click "Book Now" on any available car
4. Provide pickup/return dates
5. See pricing with student discounts applied (if eligible)
6. Confirm reservation
7. View bookings in "My Bookings" page

---

## Key Features

✅ **Automatic Login Redirect** - Non-logged-in users clicking "Book Now" are redirected to login  
✅ **Student Discounts** - 30% discount for student-friendly cars  
✅ **Role-Based Access** - Admin pages only accessible to managers  
✅ **Full Search & Filter** - All management pages have search and filter capabilities  
✅ **Data Validation** - Required fields enforced in forms  
✅ **Dark Mode Support** - All new pages work in light and dark modes  
✅ **Error Handling** - User-friendly error messages with toast notifications  
✅ **Responsive Design** - Mobile-friendly admin interfaces  

---

## Testing the System

### Quick Test Flow:
1. Open app and click "Book Now" without logging in → Should redirect to login
2. Log in as `alex@example.com` → Browse fleet and make a reservation
3. Log in as `manager@carrental.com` → Access all admin pages
4. Try adding a new car, editing a reservation, managing users

---

## API Endpoints Used

- `GET /users` - Fetch all users
- `POST /users` - Create new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user
- `GET /bookings` - Fetch all bookings
- `POST /bookings` - Create booking
- `PUT /bookings/{id}` - Update booking
- `DELETE /bookings/{id}` - Delete booking
- `GET /cars` - Fetch all cars
- `POST /cars` - Create car
- `PUT /cars/{id}` - Update car
- `DELETE /cars/{id}` - Delete car
