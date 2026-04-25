import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Inbox } from 'lucide-react'
import { authService } from '../services/authService'

const API_BASE = 'http://localhost:8080'

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authService.getToken()}`,
  }
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef()

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    try {
      const tokenUserId = authService.getUserId()
      const userId = !isNaN(Number(tokenUserId)) ? Number(tokenUserId) : 1
      const res = await fetch(`${API_BASE}/api/notifications/user/${userId}`, {
        headers: authHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  async function markAsRead(id) {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: authHeaders(),
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
        )
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    } finally {
      setLoading(false)
    }
  }

  function getTypeIcon(type) {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return '📅'
      case 'PAYMENT_SUCCESS':
        return '💳'
      case 'SYSTEM_ALERT':
        return '⚡'
      default:
        return '🔔'
    }
  }

  function getTypeBadgeColor(type) {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return 'bg-sky-500/20 text-sky-400'
      case 'PAYMENT_SUCCESS':
        return 'bg-emerald-500/20 text-emerald-400'
      case 'SYSTEM_ALERT':
        return 'bg-amber-500/20 text-amber-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const isUnread = (n) => !n.isRead && !n.read

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-slate-950 px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-[2000]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-800/30 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto overscroll-contain custom-scrollbar">
              {notifications.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                    <Inbox className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">You're all caught up!</p>
                  <p className="text-xs text-slate-500 mt-1">No notifications at the moment.</p>
                </div>
              ) : (
                notifications.map((notif, index) => {
                  const unread = isUnread(notif)
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => unread && !loading && markAsRead(notif.id)}
                      className={`flex items-start gap-3 px-5 py-3.5 border-b border-slate-800/50 transition-all duration-200 ${
                        unread
                          ? 'bg-slate-800/50 hover:bg-slate-800/80 cursor-pointer'
                          : 'bg-transparent hover:bg-slate-800/20'
                      }`}
                    >
                      {/* Blue dot indicator for unread */}
                      <div className="flex-shrink-0 mt-1.5">
                        {unread ? (
                          <span className="block w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0 text-lg mt-0.5">{getTypeIcon(notif.type)}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-snug ${
                            unread ? 'text-slate-200 font-medium' : 'text-slate-400'
                          }`}
                        >
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[11px] text-slate-500">
                            {timeAgo(notif.createdAt)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getTypeBadgeColor(
                              notif.type
                            )}`}
                          >
                            {notif.type?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
