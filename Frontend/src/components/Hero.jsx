import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const floatingParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 10 + 8,
  delay: Math.random() * 5,
}))

export default function Hero() {
  const containerRef = useRef(null)
  const { scrollY } = useScroll()

  // Parallax transforms
  const bgY = useTransform(scrollY, [0, 600], [0, 180])
  const textY = useTransform(scrollY, [0, 600], [0, 60])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax background layer */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-0"
      >
        {/* Deep dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

        {/* Electric blue radial glow — top left */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-radial from-sky-500/20 via-sky-500/5 to-transparent blur-3xl" />

        {/* Emerald radial glow — bottom right */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-radial from-emerald-500/15 via-emerald-500/5 to-transparent blur-3xl" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {floatingParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-sky-400/30"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Hero content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          Now serving 50+ cities across the region
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6"
        >
          <span className="text-white">Power Your</span>
          <br />
          <span className="text-gradient">Electric Future</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed mb-10"
        >
          VoltGrid connects EV drivers to a seamless charging network — find
          available stations, book in seconds, and pay automatically. Zero range anxiety, guaranteed.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#features"
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-base shadow-2xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:from-sky-400 hover:to-blue-500 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Find a Charger Near You
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/5 font-medium text-base transition-all duration-300"
          >
            See How It Works
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </motion.div>

        {/* Floating charger illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="relative mt-20 mx-auto max-w-3xl"
        >
          {/* Glow platform */}
          <div className="absolute inset-x-[15%] bottom-0 h-12 bg-sky-500/20 blur-2xl rounded-full" />

          {/* Dashboard mockup card */}
          <div className="relative rounded-2xl overflow-hidden card-border bg-slate-900/80 backdrop-blur-sm shadow-2xl">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs text-slate-500 font-mono">voltgrid.io/dashboard</span>
            </div>

            {/* Mock dashboard UI */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Nearest Station', value: '0.4 km', color: 'sky', icon: '📍' },
                { label: 'Available Chargers', value: '12 / 16', color: 'emerald', icon: '⚡' },
                { label: 'Est. Charge Time', value: '42 min', color: 'blue', icon: '🕐' },
              ].map((card) => (
                <div key={card.label} className="rounded-xl bg-slate-800/50 p-4 card-border">
                  <div className="text-xl mb-2">{card.icon}</div>
                  <div className={`text-lg font-bold ${card.color === 'sky' ? 'text-sky-400' : card.color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {card.value}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2"
        >
          <div className="w-1 h-2.5 rounded-full bg-sky-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}
