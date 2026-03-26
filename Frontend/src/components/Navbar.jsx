import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '../services/authService'
import { apiService } from '../services/apiService'
import { Bell, User, LogOut, Menu, X, Car, Map as MapIcon, FileText } from 'lucide-react'

// Hook for clicking outside dropdown
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
      handler(event)
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}

const publicLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Contact', href: '/#contact' }
]

const privateLinks = [
  { label: 'Station Map', href: '/dashboard', icon: MapIcon },
  { label: 'My Garage', href: '/profile', icon: Car },
  { label: 'History', href: '/history', icon: FileText }
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [hasNotifications, setHasNotifications] = useState(true)

  const profileRef = useRef()
  useOnClickOutside(profileRef, () => setProfileOpen(false))

  const isAuthenticated = authService.isAuthenticated()

  const [profile, setProfile] = useState(null)
  
  useEffect(() => {
    if (isAuthenticated) {
      const tokenUserId = authService.getUserId()
      const uid = !isNaN(Number(tokenUserId)) ? Number(tokenUserId) : 1
      apiService.getProfile(uid)
        .then(data => setProfile(data))
        .catch(err => console.error("Could not load navbar profile", err))
    }
  }, [isAuthenticated])

  // Track scroll for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''

  const handleLogout = () => {
    authService.clearToken()
    window.location.href = '/login'
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        scrolled || isAuthenticated ? 'bg-slate-950/70 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-sky-900/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <a href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:shadow-sky-500/60 transition-shadow duration-300">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Charge<span className="text-emerald-400">Net</span>
            </span>
          </a>

          {/* Desktop Central Links */}
          <nav className="hidden md:flex items-center gap-8">
            {(isAuthenticated ? privateLinks : publicLinks).map((link) => {
              const isActive = isAuthenticated && currentPath === link.href
              const Icon = link.icon
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 flex items-center gap-2 relative group
                    ${isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}
                  `}
                >
                  {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'opacity-70 group-hover:opacity-100'}`} />}
                  {link.label}
                  {isActive && (
                    <motion.div layoutId="nav-underline" className="absolute -bottom-[28px] left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  )}
                  {!isActive && isAuthenticated && (
                    <span className="absolute -bottom-[28px] left-0 w-0 h-0.5 bg-emerald-400/50 group-hover:w-full transition-all duration-300" />
                  )}
                </a>
              )
            })}
          </nav>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center gap-5">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  {hasNotifications && (
                    <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-950" />
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                        <span className="text-sm font-semibold text-slate-300 ml-1">My Account</span>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden">
                      {profile?.profileImageUrl ? (
                        <img src={profile.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden focus:outline-none"
                      >
                        <div className="px-5 py-4 flex flex-col items-center text-center bg-slate-800/20">
                           <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden mb-3">
                              {profile?.profileImageUrl ? (
                                 <img src={profile.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                 <User className="w-8 h-8 text-slate-400" />
                              )}
                           </div>
                           <p className="text-sm font-bold text-white truncate w-full">{profile && (profile.firstName || profile.lastName) ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Guest User'}</p>
                           <p className="text-xs text-slate-400 truncate w-full mt-0.5">{authService.getUserPayload()?.sub || 'user@example.com'}</p>
                        </div>
                        <hr className="border-slate-800" />
                        <div className="py-2">
                          <a href="/profile" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                            <User className="w-4 h-4 text-slate-400" /> Edit Profile
                          </a>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              // Public Auth Buttons
              <>
                <a href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log in</a>
                <a href="/register" className="px-5 py-2.5 text-sm font-bold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors">Sign up</a>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            {isAuthenticated && (
              <button className="relative p-1 text-slate-400">
                 <Bell className="w-5 h-5" />
                 {hasNotifications && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-950" />}
              </button>
            )}
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-slate-300 p-1"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-slate-950 border-b border-slate-800"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
               {(isAuthenticated ? privateLinks : publicLinks).map((link) => {
                  const Icon = link.icon
                  const isActive = currentPath === link.href
                  return (
                     <a 
                        key={link.label} 
                        href={link.href}
                        className={`text-base font-bold flex items-center gap-3 py-2 ${isActive ? 'text-emerald-400' : 'text-slate-300'}`}
                     >
                        {Icon && <Icon className="w-5 h-5" />}
                        {link.label}
                     </a>
                  )
               })}

               <hr className="border-slate-800 my-2" />

               {isAuthenticated ? (
                  <button onClick={handleLogout} className="text-base font-bold text-red-400 py-2 text-left flex items-center gap-3">
                     <LogOut className="w-5 h-5" /> Logout
                  </button>
               ) : (
                  <div className="flex flex-col gap-3 mt-2">
                     <a href="/login" className="w-full py-3 text-center rounded-lg bg-slate-900 text-white font-bold border border-slate-800">Log in</a>
                     <a href="/register" className="w-full py-3 text-center rounded-lg bg-emerald-500 text-slate-950 font-bold">Sign up</a>
                  </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.header>
  )
}
