# Swagger API Testing Guide (with Sample Data)

This guide is for testing the EV Charging microservices through Swagger.

## 1. Start the system

```powershell
docker compose up --build -d
```

Main Swagger URL (gateway aggregate):
- `http://localhost:8080/swagger-ui.html`
- If needed: `http://localhost:8080/swagger-ui/index.html`

Optional per-service Swagger:
- User: `http://localhost:8082/swagger-ui.html`
- Station: `http://localhost:8081/swagger-ui.html`
- Booking: `http://localhost:8083/swagger-ui.html`
- Payment: `http://localhost:8084/swagger-ui.html`
- Notification: `http://localhost:8085/swagger-ui.html`

## 2. JWT setup in Swagger (important)

1. Call `POST /api/users/register` (if user does not exist).
2. Call `POST /api/users/login` and copy the returned token.
3. Click **Authorize** in Swagger and paste the token.
   - Use raw token value (no `Bearer ` prefix).

---

## 3. User Service testing

Base path: `/api/users`

### 3.1 Register (Create)
`POST /api/users/register`

```json
{
  "email": "user2@test.com",
  "password": "pass123",
  "firstName": "Nimal",
  "lastName": "Perera",
  "phone": "0771234567"
}
```

### 3.2 Login
`POST /api/users/login`

```json
{
  "email": "user2@test.com",
  "password": "pass123"
}
```

### 3.3 Get all profiles (Read)
`GET /api/users`

### 3.4 Get profile by ID (Read)
`GET /api/users/{id}`
- Example: `/api/users/1`

### 3.5 Update profile (Update)
`PUT /api/users/{id}`

```json
{
  "firstName": "Nimal",
  "lastName": "Perera",
  "phone": "0779999999",
  "favoriteStationIds": [1, 2]
}
```

### 3.6 Add vehicle
`POST /api/users/{id}/vehicles`

```json
{
  "make": "BYD",
  "model": "Atto 3",
  "batteryCapacity": 60.5,
  "connectorType": "CCS"
}
```

### 3.7 List user vehicles
`GET /api/users/{id}/vehicles`

### 3.8 Delete user (Delete)
`DELETE /api/users/{id}`

---

## 4. Station Service testing

Base path: `/api/stations`

### 4.1 Create station (Create)
`POST /api/stations`

Note: requires `ROLE_ADMIN` token.

```json
{
  "name": "Colombo Fast Charge Hub",
  "totalChargers": 2,
  "pricingPerKwh": 62.5,
  "contactNumber": "0112223344",
  "address": "Galle Road, Colombo",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "chargers": [
    { "status": "AVAILABLE", "connectorType": "CCS" },
    { "status": "AVAILABLE", "connectorType": "CHADEMO" }
  ]
}
```

### 4.2 Get all stations (Read)
`GET /api/stations?page=0&size=10`

### 4.3 Get station by ID (Read)
`GET /api/stations/{id}`

### 4.4 Update station (Update)
`PUT /api/stations/{id}`

```json
{
  "name": "Colombo Fast Charge Hub - Updated",
  "totalChargers": 3,
  "pricingPerKwh": 65.0,
  "contactNumber": "0112223355",
  "address": "Marine Drive, Colombo",
  "latitude": 6.9100,
  "longitude": 79.8500,
  "chargers": [
    { "status": "AVAILABLE", "connectorType": "CCS" },
    { "status": "IN_USE", "connectorType": "TYPE_2" },
    { "status": "OFFLINE", "connectorType": "CHADEMO" }
  ]
}
```

### 4.5 Update availability
`PUT /api/stations/{id}/availability`

```json
{
  "availableSlots": 2
}
```

### 4.6 Nearby station search
`GET /api/stations/nearby?lat=6.9271&lng=79.8612&radius=10`

### 4.7 Delete station (Delete)
`DELETE /api/stations/{id}`

---

## 5. Booking Service testing

Base path: `/api/bookings`

### 5.1 Create booking (Create)
`POST /api/bookings`

```json
{
  "userId": 1,
  "stationId": 1,
  "chargerId": 1,
  "date": "2026-04-25"
}
```

### 5.2 Get all bookings (Read)
`GET /api/bookings`

### 5.3 Get booking by ID (Read)
`GET /api/bookings/{id}`

### 5.4 Get bookings by user
`GET /api/bookings/user/{userId}`

### 5.5 Update booking (Update)
`PUT /api/bookings/{id}`

```json
{
  "userId": 1,
  "stationId": 1,
  "chargerId": 1,
  "date": "2026-04-26"
}
```

### 5.6 Start session
`PUT /api/bookings/{id}/start`

### 5.7 End session (triggers billing flow)
`PUT /api/bookings/{id}/end?kwhConsumed=18.75`

### 5.8 Cancel booking
`PUT /api/bookings/{id}/cancel`

### 5.9 Delete booking (Delete)
`DELETE /api/bookings/{id}`

---

## 6. Payment Service testing

Base path: `/api/payments`

### 6.1 Create payment (Create)
`POST /api/payments`

```json
{
  "bookingId": 1,
  "userId": 1,
  "stationId": 1,
  "amount": 1171.88,
  "kwhConsumed": 18.75,
  "pricePerKwh": 62.5
}
```

### 6.2 Get all payments (Read)
`GET /api/payments`

### 6.3 Get payment by ID (Read)
`GET /api/payments/{id}`

### 6.4 Get payment by booking
`GET /api/payments/booking/{bookingId}`

### 6.5 Get payment history by user
`GET /api/payments/user/{userId}/history`

### 6.6 Update payment (Update)
`PUT /api/payments/{id}`

```json
{
  "userId": 1,
  "amount": 1200.0,
  "status": "COMPLETED"
}
```

### 6.7 Refund payment
`POST /api/payments/{id}/refund`

```json
{
  "refundAmount": 300.0,
  "reason": "Session ended early"
}
```

### 6.8 Delete payment (Delete)
`DELETE /api/payments/{id}`

---

## 7. Notification Service testing

Base path: `/api/notifications`

### 7.1 Create notification directly (Create)
`POST /api/notifications`

```json
{
  "userId": 1,
  "message": "Direct notification test",
  "type": "SYSTEM_ALERT",
  "isRead": false
}
```

### 7.2 Get all notifications (Read)
`GET /api/notifications`

### 7.3 Get notification by ID (Read)
`GET /api/notifications/{id}`

### 7.4 Get notifications by user
`GET /api/notifications/user/{userId}`

### 7.5 Update notification (Update)
`PUT /api/notifications/{id}`

```json
{
  "userId": 1,
  "message": "Updated notification message",
  "type": "BOOKING_CONFIRMED",
  "isRead": true
}
```

### 7.6 Mark as read
`PUT /api/notifications/{id}/read`

### 7.7 Publish RabbitMQ event test
`POST /api/notifications/test-send`

```json
{
  "userId": 1,
  "message": "Your booking #42 has been confirmed",
  "type": "BOOKING_CONFIRMED"
}
```

### 7.8 Delete notification (Delete)
`DELETE /api/notifications/{id}`

---

## 8. Useful notes during demo

- If register returns `400 Email already registered`, use a new email or login directly.
- If secured endpoints return `401`, re-login and re-Authorize token in Swagger.
- If station create returns `403`, use an admin JWT for that endpoint.
- For a clean database reset:

```powershell
docker compose down -v
docker compose up --build -d
```
