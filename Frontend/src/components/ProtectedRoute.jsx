import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

/**
 * Wraps a page that requires authentication.
 * Redirects to /login if no JWT token is present in localStorage.
 */
export default function ProtectedRoute({ children }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  if (!authService.isAuthenticated()) return null
  return children
}
