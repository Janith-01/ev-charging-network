import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const floatingOrbs = [
  { top: '10%', left: '15%', size: 280, color: 'from-sky-500/20 to-transparent', delay: 0 },
  { top: '55%', left: '60%', size: 200, color: 'from-emerald-500/15 to-transparent', delay: 2 },
  { top: '75%', left: '10%', size: 150, color: 'from-blue-600/15 to-transparent', delay: 4 },
]

/**
 * Shared split-screen layout for Login and Register pages.
 * Left: Decorative EV branding panel (hidden on mobile)
 * Right: Auth form in a glass card
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── Left decorative panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Floating orbs */}
        {floatingOrbs.map((orb, i) => (
          <motion.div
            key={i}
            style={{ top: orb.top, left: orb.left, width: orb.size, height: orb.size }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 8, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute rounded-full bg-gradient-radial ${orb.color} blur-3xl pointer-events-none`}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-md text-left">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-14 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-sky-500/30">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">
              Volt<span className="text-gradient">Grid</span>
            </span>
          </Link>

          {/* Big headline */}
          <h1 className="text-5xl font-black text-white leading-tight mb-5">
            Charge smarter,<br />
            <span className="text-gradient">drive further.</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            Join thousands of EV drivers already using VoltGrid to find, book, and
            pay for charging — all in one place.
          </p>

          {/* Feature list */}
          {[
            { icon: '📍', text: 'Real-time station availability' },
            { icon: '⚡', text: 'Instant booking & confirmation' },
            { icon: '💳', text: 'Automatic billing on session end' },
            { icon: '🌱', text: 'Track your carbon savings' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 mb-4">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-slate-400">{item.text}</span>
            </div>
          ))}

          {/* Decorative charger icon */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-16 flex justify-center"
          >
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-16 h-16 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">
            Volt<span className="text-gradient">Grid</span>
          </span>
        </Link>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">{title}</h2>
            <p className="text-slate-400 text-sm">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  )
}
