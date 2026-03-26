import { authService } from './authService'

const API_BASE = 'http://localhost:8080'

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authService.getToken()}`,
  }
}

export const apiService = {
  async getStationsNearby(lat = 6.9271, lng = 79.8612, radius = 10) {
    const res = await fetch(
      `${API_BASE}/api/stations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
      { headers: authHeaders() }
    )
    if (!res.ok) throw new Error('Failed to load stations')
    return res.json()
  },

  async getUserBookings(userId) {
    const res = await fetch(`${API_BASE}/api/bookings/user/${userId}`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to load bookings')
    return res.json()
  },

  async getPaymentHistory(userId) {
    const res = await fetch(`${API_BASE}/api/payments/user/${userId}/history`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to load payments')
    return res.json()
  },

  async getUserNotifications(userId) {
    const res = await fetch(`${API_BASE}/api/notifications/user/${userId}`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to load notifications')
    return res.json()
  },

  async markNotificationRead(notifId) {
    const res = await fetch(`${API_BASE}/api/notifications/${notifId}/read`, {
      method: 'PUT',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to mark notification')
    return res.json()
  },

  async getStationById(stationId) {
    const res = await fetch(`${API_BASE}/api/stations/${stationId}`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to load station details')
    return res.json()
  },

  async getBookingById(bookingId) {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to load booking details')
    return res.json()
  },

  async createBooking(bookingData) {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(bookingData),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Failed to create booking')
    }
    return res.json()
  },

  async startSession(bookingId) {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/start`, {
      method: 'PUT',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to start session')
    return res.json()
  },

  async endSession(bookingId, kwhConsumed) {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/end?kwhConsumed=${kwhConsumed}`, {
      method: 'PUT',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to end session')
    return res.json()
  },

  async createPayment(paymentData) {
    const res = await fetch(`${API_BASE}/api/payments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(paymentData),
    })
    if (!res.ok) throw new Error('Failed to process payment')
    return res.json()
  },

  async getProfile(userId) {
    const res = await fetch(`${API_BASE}/api/users/${userId}`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to load profile')
    return res.json()
  },

  async updateProfile(userId, data) {
    const res = await fetch(`${API_BASE}/api/users/${userId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update profile')
    return res.text()
  },

  async getUserVehicles(userId) {
    const res = await fetch(`${API_BASE}/api/users/${userId}/vehicles`, {
      headers: authHeaders(),
    })
    if (!res.ok) return []
    return res.json()
  },

  async addVehicle(userId, vehicleData) {
    const res = await fetch(`${API_BASE}/api/users/${userId}/vehicles`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(vehicleData),
    })
    if (!res.ok) throw new Error('Failed to add vehicle')
    return res.json()
  },
}
