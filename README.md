# ⚡ EV Charging Network — Full Stack Microservices Application

A comprehensive electric vehicle charging network platform built with **Spring Boot 3** microservices and a **React 18** frontend. Features user authentication, station management, real-time booking, payment processing, and an event-driven notification system powered by **RabbitMQ**.

---

## 🚀 Features

### 🔐 User Service (Port 8082)
- Secure login & registration with **JWT**
- Role-based access control (User, Admin)
- Profile management with avatar uploads
- Favorite stations for quick access

### 🔌 Station Service (Port 8081)
- Full CRUD for EV charging stations
- Real-time charger availability status
- Pricing information per kWh
- **OpenChargeMap API** integration — auto-syncs station data on startup

### 📅 Booking Service (Port 8083)
- Schedule charging sessions at specific stations
- Availability checks before booking
- Booking history tracking
- Inter-service communication via **OpenFeign**

### 💰 Payment Service (Port 8084)
- Payment processing with **PayHere** integration
- Transaction history
- Refund support for cancelled bookings

### 🔔 Notification Service (Port 8085)
- **Event-driven architecture** with RabbitMQ
- RabbitMQ consumer (`@RabbitListener`) persists notifications to PostgreSQL
- REST API for frontend notification bell
- Notification types: `BOOKING_CONFIRMED`, `PAYMENT_SUCCESS`, `SYSTEM_ALERT`
- Mark-as-read support

### 🌐 API Gateway (Port 8080)
- **Spring Cloud Gateway** routes all requests to the correct microservice
- Centralized **Swagger UI** aggregation
- Global CORS configuration

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17 | Language |
| Spring Boot 3.2 | Framework |
| Spring Cloud Gateway | API Gateway & routing |
| Spring Data JPA | ORM / database access |
| Spring Security + JWT | Authentication & authorization |
| Spring AMQP | RabbitMQ messaging |
| OpenFeign | Inter-service REST calls |
| PostgreSQL | Relational database |
| RabbitMQ | Message broker (event-driven notifications) |
| SpringDoc OpenAPI | Swagger UI documentation |
| Lombok | Boilerplate reduction |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| Lucide React | Icon library |
| React Leaflet | Interactive maps |
| Axios / Fetch | HTTP client |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker & Docker Compose | Containerization & orchestration |
| Nginx | Frontend static file serving (production) |
| MailHog | Development email testing |
| Redis | Caching (optional) |

---

## 📂 Project Structure

```
ev-charging-network/
├── docker-compose.yml          # One-command deployment
├── init.sql                    # PostgreSQL database initialization
├── Backend/
│   ├── api-gateway/            # Spring Cloud Gateway (port 8080)
│   ├── user-service/           # Auth & user management (port 8082)
│   ├── station-service/        # Station CRUD & OpenChargeMap (port 8081)
│   ├── booking-service/        # Booking system (port 8083)
│   ├── payment-service/        # Payment processing (port 8084)
│   └── notification-service/   # Event-driven notifications (port 8085)
│       ├── config/             # RabbitMQ topology (queue, exchange, binding)
│       ├── listener/           # @RabbitListener consumer
│       ├── controller/         # REST endpoints for frontend
│       ├── dto/                # NotificationEvent (RabbitMQ payload)
│       ├── model/              # Notification entity & enums
│       └── repository/         # Spring Data JPA
└── Frontend/
    ├── Dockerfile              # Multi-stage build (Node → Nginx)
    └── src/
        ├── components/         # Navbar, NotificationBell, BookingModal, etc.
        ├── pages/              # Dashboard, Profile, History, Auth, etc.
        ├── services/           # apiService.js, authService.js
        └── App.jsx             # Main router
```

---

## 🚀 Getting Started

### Option 1: Docker (Recommended) — Single Command

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running.

```bash
git clone <repository-url>
cd ev-charging-network
docker compose up --build
```

That's it! All services, databases, and infrastructure start automatically.

#### 🔌 Port Map

| Service | Port | URL |
|---|---|---|
| 🌐 Frontend (React + Nginx) | `3000` | [http://localhost:3000](http://localhost:3000) |
| 🔀 API Gateway | `8080` | [http://localhost:8080](http://localhost:8080) |
| 🔌 Station Service | `8081` | [http://localhost:8081](http://localhost:8081) |
| 🔐 User Service | `8082` | [http://localhost:8082](http://localhost:8082) |
| 📅 Booking Service | `8083` | [http://localhost:8083](http://localhost:8083) |
| 💰 Payment Service | `8084` | [http://localhost:8084](http://localhost:8084) |
| 🔔 Notification Service | `8085` | [http://localhost:8085](http://localhost:8085) |
| 🐘 PostgreSQL | `5432` | — |
| 🟥 Redis | `6379` | — |
| 🐇 RabbitMQ (AMQP) | `5672` | — |
| 🐇 RabbitMQ (Dashboard) | `15672` | [http://localhost:15672](http://localhost:15672) (guest / guest) |
| 📬 MailHog (SMTP) | `1025` | — |
| 📬 MailHog (Web UI) | `8025` | [http://localhost:8025](http://localhost:8025) |
| 📖 Swagger UI | — | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) |

> **Note:** The first build takes several minutes (Maven dependency downloads). Subsequent runs are fast due to Docker layer caching.

---

### Option 2: Manual Setup (Without Docker)

**Prerequisites:**
- Java 17+
- Node.js 18+
- PostgreSQL 14+
- RabbitMQ 3.x

#### 1. Database Setup
Create the following PostgreSQL databases:
```sql
CREATE DATABASE users_db;
CREATE DATABASE stations_db;
CREATE DATABASE bookings_db;
CREATE DATABASE payments_db;
CREATE DATABASE notif_db;
```

#### 2. Start Backend Services
Open separate terminals for each service:
```bash
# API Gateway (port 8080)
cd Backend/api-gateway
./mvnw spring-boot:run

# User Service (port 8082)
cd Backend/user-service
./mvnw spring-boot:run

# Station Service (port 8081)
cd Backend/station-service
./mvnw spring-boot:run

# Booking Service (port 8083)
cd Backend/booking-service
./mvnw spring-boot:run

# Payment Service (port 8084)
cd Backend/payment-service
./mvnw spring-boot:run

# Notification Service (port 8085)
cd Backend/notification-service
./mvnw spring-boot:run
```

#### 3. Start Frontend (port 5173 in dev / port 3000 in Docker)
```bash
cd Frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

All endpoints are accessible through the **API Gateway** at `http://localhost:8080`.

### User Service
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/users/register` | Register a new user |
| `POST` | `/api/users/login` | Login (returns JWT) |
| `GET` | `/api/users/{id}` | Get user profile |
| `PUT` | `/api/users/{id}` | Update user profile |
| `GET` | `/api/users/{id}/favorites` | Get favorite stations |
| `POST` | `/api/users/{id}/favorites/{stationId}` | Add favorite station |

### Station Service
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/stations` | List stations (with filters & pagination) |
| `GET` | `/api/stations/{id}` | Get station details |
| `POST` | `/api/stations` | Create station (Admin) |
| `PUT` | `/api/stations/{id}` | Update station (Admin) |
| `DELETE` | `/api/stations/{id}` | Delete station (Admin) |

### Booking Service
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/bookings` | Create a booking |
| `GET` | `/api/bookings/user/{userId}` | Get user's bookings |
| `GET` | `/api/bookings/{id}` | Get booking details |
| `PUT` | `/api/bookings/{id}/cancel` | Cancel a booking |

### Payment Service
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/payments/initiate` | Initiate payment |
| `GET` | `/api/payments/{id}` | Get payment details |
| `GET` | `/api/payments/user/{userId}` | Get payment history |

### Notification Service
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/notifications/user/{userId}` | Get user notifications (newest first) |
| `PUT` | `/api/notifications/{id}/read` | Mark notification as read |
| `POST` | `/api/notifications/test-send` | Publish test event to RabbitMQ |

---

## 🐇 RabbitMQ Event-Driven Architecture

```
Producer                     RabbitMQ                          Consumer
(booking/payment)  ──►  [ ev_exchange ]  ──►  [ notification_queue ]  ──►  NotificationListener
                        (TopicExchange)       (binding: notification.#)     → saves to PostgreSQL
```

**Test it via Swagger** — `POST /api/notifications/test-send`:
```json
{
  "userId": 1,
  "message": "Your booking #42 has been confirmed!",
  "type": "BOOKING_CONFIRMED"
}
```

---

## 🔑 Default Credentials

**Admin User:**
- Email: `admin@evcharging.com`
- Password: `admin123`

**Regular User:**
- Email: `user@evcharging.com`
- Password: `user123`

---

## 🌐 Usage

1. **Register / Login** on the frontend
2. **Browse Stations** on the interactive map dashboard
3. **Book a Charger** for a specific time slot
4. **Make Payment** via PayHere integration
5. **View Notifications** via the bell icon in the navbar
6. **Manage Profile** and view booking history

---

## 🐳 Docker Services Overview

| Container | Image | Port | Purpose |
|---|---|---|---|
| `ev-charging-postgres` | postgres:16-alpine | 5432 | Shared PostgreSQL database |
| `ev-charging-redis` | redis:7-alpine | 6379 | Caching layer |
| `ev-charging-rabbitmq` | rabbitmq:3.13-management | 5672, 15672 | Message broker + management UI |
| `ev-charging-mailhog` | mailhog/mailhog:v1.0.1 | 1025, 8025 | Dev email testing |
| `ev-charging-station` | Custom (Maven) | 8081 | Station Service |
| `ev-charging-user` | Custom (Maven) | 8082 | User Service |
| `ev-charging-booking` | Custom (Maven) | 8083 | Booking Service |
| `ev-charging-payment` | Custom (Maven) | 8084 | Payment Service |
| `ev-charging-notification` | Custom (Maven) | 8085 | Notification Service |
| `ev-charging-gateway` | Custom (Maven) | 8080 | API Gateway |
| `ev-charging-frontend` | Custom (Node → Nginx) | 3000 | React SPA |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request