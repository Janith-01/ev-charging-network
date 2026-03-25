import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  {
    value: 12480,
    suffix: '+',
    label: 'Active Chargers',
    icon: '⚡',
    color: 'text-sky-400',
  },
  {
    value: 3.2,
    suffix: 'M kWh',
    label: 'Energy Delivered',
    icon: '🔋',
    color: 'text-emerald-400',
    decimals: 1,
  },
  {
    value: 98.6,
    suffix: '%',
    label: 'Uptime Reliability',
    icon: '📡',
    color: 'text-violet-400',
    decimals: 1,
  },
  {
    value: 47500,
    suffix: '+',
    label: 'Happy EV Drivers',
    icon: '🚗',
    color: 'text-amber-400',
  },
  {
    value: 2840,
    suffix: 't',
    label: 'CO₂ Offset',
    icon: '🌱',
    color: 'text-green-400',
  },
]

function AnimatedCounter({ target, suffix, decimals = 0, duration = 2000, start }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return

    const startTime = performance.now()
    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = easedProgress * target

      setCount(parseFloat(current.toFixed(decimals)))

      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [start, target, decimals, duration])

  return (
    <span>
      {decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString()}
      {suffix}
    </span>
  )
}

export default function StatsBanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-emerald-500/5" />
        <div className="absolute inset-0 bg-slate-900/40" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top/bottom borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-3">
            Network At a Glance
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Built for scale.{' '}
            <span className="text-gradient">Proven by numbers.</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative group rounded-2xl bg-slate-900/60 card-border p-6 text-center backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-white/[0.03] to-transparent" />

              {/* Icon */}
              <div className="text-3xl mb-3">{stat.icon}</div>

              {/* Animated number */}
              <div className={`text-3xl sm:text-4xl font-black mb-1 ${stat.color}`}>
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  start={inView}
                />
              </div>

              {/* Label */}
              <div className="text-xs sm:text-sm text-slate-500 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
