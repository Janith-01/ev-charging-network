# EV Charging Network - Full Stack Application

A comprehensive electric vehicle charging network platform built with Spring Boot and React, featuring user authentication, station management, booking system, and payment integration.

## 🚀 Features

### 🔐 User Service
- **Authentication**: Secure login and registration with JWT (JSON Web Tokens).
- **Authorization**: Role-based access control (User, Admin).
- **Profile Management**: Users can view and update their profile information.
- **Favorites**: Users can mark stations as favorites for quick access.

### 🔌 Station Service
- **Station Management**: CRUD operations for EV charging stations.
- **Real-time Status**: View current availability status of chargers.
- **Pricing**: Display pricing information per kWh.
- **OpenChargeMap Integration**: Automatically syncs stations from OpenChargeMap API on startup.

### 📅 Booking Service
- **Booking System**: Schedule charging sessions at specific stations.
- **Availability Check**: Ensures chargers are available before booking.
- **History**: Track past and upcoming bookings.

### 💰 Payment Service
- **Payment Processing**: Secure payment gateway integration.
- **Transaction History**: Track all payment transactions.
- **Refunds**: Process refunds for cancelled bookings.

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Database**: PostgreSQL
- **Security**: Spring Security, JWT (jjwt)
- **API Documentation**: SpringDoc (Swagger UI)
- **External APIs**:
  - OpenChargeMap API (for station data)
  - PayHere API (for payments)

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📂 Project Structure

```
ev-charging-network/
├── Backend/                  # Spring Boot Services
│   ├── user-service/       # User authentication and profiles
│   ├── station-service/    # Station management and OpenChargeMap integration
│   ├── booking-service/    # Booking system
│   └── payment-service/    # Payment processing
└── frontend/               # React Application
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Page components (Dashboard, Profile, etc.)
    │   ├── services/       # API service layer
    │   └── App.jsx         # Main application component
    └── public/
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- PostgreSQL 14 or higher

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ev-charging-network/Backend
   ```

2. **Configure Database**:
   - Ensure PostgreSQL is running.
   - Update `application.yml` in each service with your database credentials:
     ```yaml
     spring:
       datasource:
         url: jdbc:postgresql://localhost:5432/your_db_name
         username: your_username
         password: your_password
     ```

3. **Run Services**:
   - Start each service independently:
     ```bash
     # User Service
     cd user-service
     ./mvnw spring-boot:run

     # Station Service
     cd ../station-service
     ./mvnw spring-boot:run

     # Booking Service
     cd ../booking-service
     ./mvnw spring-boot:run

     # Payment Service
     cd ../payment-service
     ./mvnw spring-boot:run
     ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd ev-charging-network/frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure API URLs**:
   - Update `src/services/apiService.js` with your backend service URLs:
     ```javascript
     const BASE_URL = 'http://localhost:8080'; // Main gateway or specific service
     ```
   - Ensure the URLs match your running backend services.

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🔌 API Endpoints

### User Service (`http://localhost:8080`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile
- `GET /api/users/{id}/favorites` - Get user's favorite stations
- `POST /api/users/{id}/favorites/{stationId}` - Add favorite station

### Station Service (`http://localhost:8081`)
- `GET /api/stations` - Get all stations (with optional filters)
- `GET /api/stations/{id}` - Get station details
- `POST /api/stations` - Create a new station (Admin)
- `PUT /api/stations/{id}` - Update station (Admin)
- `DELETE /api/stations/{id}` - Delete station (Admin)

### Booking Service (`http://localhost:8083`)
- `POST /api/bookings` - Create a booking
- `GET /api/bookings/user/{userId}` - Get user's bookings
- `GET /api/bookings/{id}` - Get booking details
- `PUT /api/bookings/{id}/cancel` - Cancel a booking

### Payment Service (`http://localhost:8084`)
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/{id}` - Get payment details
- `GET /api/payments/user/{userId}` - Get user's payment history

## 🔑 Default Credentials

After running the OpenChargeMap sync, you can use these credentials to test:

**Admin User**:
- Email: `[EMAIL_ADDRESS]`
- Password: `admin123`

**Regular User**:
- Email: `[EMAIL_ADDRESS]`
- Password: `user123`

## 🌐 Usage

1. **Login** to the frontend application.
2. **Browse Stations** on the dashboard map.
3. **Book a Charger** for a specific time slot.
4. **Make Payment** using the PayHere integration.
5. **Manage Profile** and view booking history.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.