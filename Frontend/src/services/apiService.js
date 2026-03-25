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
}
