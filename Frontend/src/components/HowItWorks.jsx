import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  {
    step: '01',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Locate',
    subtitle: 'Find Stations Instantly',
    description:
      'Browse a real-time map of thousands of charging stations. Filter by connector type, availability, and distance from your current location.',
    accent: 'from-sky-500 to-blue-600',
    glow: 'shadow-sky-500/20',
    badge: 'Real-time',
  },
  {
    step: '02',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Book & Charge',
    subtitle: 'Reserve in 3 Seconds',
    description:
      'Lock your charger ahead of time with a simple tap. Drive in, plug in, and the session starts automatically — no fumbling with apps at the station.',
    accent: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/20',
    badge: 'Smart Booking',
  },
  {
    step: '03',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Pay Seamlessly',
    subtitle: 'Automatic Billing',
    description:
      'Payment is triggered automatically when your session ends. Get an instant digital receipt with kWh consumed, cost breakdown, and carbon offset saved.',
    accent: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
    badge: 'Auto-Pay',
  },
]

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] bg-gradient-radial from-sky-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-sky-400 mb-4">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-5">
            Charging made{' '}
            <span className="text-gradient">ridiculously easy</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Three steps. No friction. Your EV powers up while you focus on the road ahead.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={step.step}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative rounded-2xl bg-slate-900/60 card-border p-8 backdrop-blur-sm hover:bg-slate-900/80 transition-colors duration-300"
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-xl ${step.glow}`} />

              {/* Top row: icon + step number */}
              <div className="flex items-start justify-between mb-6">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.accent} text-white flex items-center justify-center shadow-lg ${step.glow}`}>
                  {step.icon}
                </div>
                {/* Step number */}
                <span className="text-5xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">
                  {step.step}
                </span>
              </div>

              {/* Badge */}
              <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gradient-to-r ${step.accent} bg-clip-text text-transparent border border-current/20 mb-3`}
                style={{ borderColor: 'rgba(148, 163, 184, 0.12)' }}
              >
                {step.badge}
              </span>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
              <p className="text-sm font-medium text-slate-400 mb-3">{step.subtitle}</p>

              {/* Description */}
              <p className="text-slate-500 text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Connector line (between cards) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-[56px] -right-4 w-8 z-10">
                  <div className="flex items-center gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    ))}
                    <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
