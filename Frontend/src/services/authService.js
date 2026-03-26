const API_BASE = 'http://localhost:8080'
const TOKEN_KEY = 'voltgrid_token'

export const authService = {
  /**
   * POST /api/users/register (via API Gateway)
   */
  async register({ firstName, lastName, email, password }) {
    const res = await fetch(`${API_BASE}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password }),
    })

    const text = await res.text()
    if (!res.ok) {
      throw new Error(text || 'Registration failed. Please try again.')
    }
    return text
  },

  /**
   * POST /api/users/login (via API Gateway)
   * Expects response: { token: "eyJ..." }
   */
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Invalid email or password.')
    }

    return res.json() // { token: "..." }
  },

  /** Persist JWT to localStorage */
  saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY)
  },

  /** Decode JWT to extract user ID and role */
  getUserPayload() {
    const token = this.getToken()
    if (!token) return null
    try {
      const payload = token.split('.')[1]
      return JSON.parse(atob(payload))
    } catch (e) {
      return null
    }
  },

  getUserId() {
    const payload = this.getUserPayload()
    // Depending on Spring Security schema, ID might be 'userId', 'sub', or 'id'
    return payload ? (payload.userId || payload.sub || payload.id) : null
  }
}
