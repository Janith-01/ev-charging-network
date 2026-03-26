import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Play, Square, AlertCircle, ChevronLeft, MapPin, BatteryCharging, Clock, DollarSign, Activity } from 'lucide-react'
import { apiService } from '../../services/apiService'
import { authService } from '../../services/authService'
import { formatLKR } from '../../utils/currency'

export default function SessionPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Session State
  const [status, setStatus] = useState('READY') // 'READY' | 'CHARGING' | 'COMPLETED'
  const [timeElapsed, setTimeElapsed] = useState(0) // in seconds
  const [kwhConsumed, setKwhConsumed] = useState(0.0)
  
  // Ref for timer
  const timerRef = useRef(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const b = await apiService.getBookingById(bookingId)
        setBooking(b)
        
        const s = await apiService.getStationById(b.stationId)
        setStation(s)
      } catch (err) {
        setError(err.message || 'Failed to load session details.')
      } finally {
        setLoading(false)
      }
    }
    if (bookingId) loadData()
  }, [bookingId])

  // Simulation Timer
  useEffect(() => {
    if (status === 'CHARGING') {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
        // Simulate charging at 50kW (approx 0.0138 kWh per second)
        setKwhConsumed(prev => prev + 0.0138)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status])

  const handleStart = async () => {
    try {
      await apiService.startSession(bookingId)
      setStatus('CHARGING')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleStop = async () => {
    try {
      await apiService.endSession(bookingId, kwhConsumed.toFixed(2))
      setStatus('COMPLETED')
      // Redirect to checkout view with session data
      setTimeout(() => {
        navigate(`/checkout/${bookingId}`, { 
          state: { 
            kwhConsumed: Number(kwhConsumed.toFixed(2)),
            timeElapsed,
            station,
            booking
          } 
        })
      }, 1500)
    } catch (err) {
      alert(err.message)
    }
  }

  // Formatting helpers
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const estimatedCost = station ? (kwhConsumed * station.pricingPerKwh).toFixed(2) : 0.00

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p>Loading Session Data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
         <div className="max-w-md w-full p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-red-400">{error}</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg">Go Back</button>
         </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-1000 opacity-20 pointer-events-none
        ${status === 'CHARGING' ? 'bg-emerald-500' : status === 'COMPLETED' ? 'bg-sky-500' : 'bg-slate-700'}`} 
      />

      <div className="relative z-10 p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
         <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300">
            <ChevronLeft className="w-5 h-5" />
         </button>
         <h1 className="text-lg font-bold tracking-tight">Session Control</h1>
         <div className="w-9" /> {/* spacer */}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Header Info */}
          <div className="text-center space-y-1">
            <p className="text-slate-400 font-medium text-sm flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-400" /> Charger #{booking?.chargerId}
            </p>
            <h2 className="text-2xl font-bold">{station?.name}</h2>
            
            {/* Status Badge */}
            <div className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border
              ${status === 'READY' ? 'bg-slate-800/50 border-slate-700 text-slate-300' : ''}
              ${status === 'CHARGING' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''}
              ${status === 'COMPLETED' ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' : ''}
            `}>
              {status === 'READY' ? 'Ready to Charge' : status === 'CHARGING' ? 'Charging in Progress' : 'Session Completed'}
            </div>
          </div>

          {/* Central Ring Visual */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            {/* Outer animated rings during charging */}
            <AnimatePresence>
              {status === 'CHARGING' && (
                <>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-emerald-500/50"
                  />
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1 }}
                    className="absolute inset-0 rounded-full border border-emerald-500/30"
                  />
                </>
              )}
            </AnimatePresence>

            <div className={`w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center transition-colors duration-500 shadow-2xl bg-slate-900/80 backdrop-blur-md
              ${status === 'CHARGING' ? 'border-emerald-500 shadow-emerald-500/20' : status === 'COMPLETED' ? 'border-sky-500' : 'border-slate-800'}
            `}>
              {status === 'COMPLETED' ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center text-sky-400">
                  <CheckCircle2 className="w-12 h-12 mb-2" />
                  <span className="font-bold">Done</span>
                </motion.div>
              ) : (
                <>
                  <span className="text-sm font-medium text-slate-400 mb-1">Delivered</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-white">{kwhConsumed.toFixed(2)}</span>
                    <span className="text-sm font-bold text-slate-500">kWh</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center">
              <Clock className="w-5 h-5 text-slate-500 mb-2" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Duration</span>
              <span className={`text-xl font-bold font-mono ${status === 'CHARGING' ? 'text-white' : 'text-slate-300'}`}>
                {formatTime(timeElapsed)}
              </span>
            </div>
            <div className={`p-4 rounded-2xl flex flex-col justify-between ${status === 'CHARGING' ? 'bg-emerald-500/10' : 'bg-slate-800/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-4 h-4 ${status === 'CHARGING' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Cost</span>
              </div>
              <span className={`text-xl font-bold font-mono ${status === 'CHARGING' ? 'text-emerald-400' : 'text-slate-300'}`}>
                {formatLKR(estimatedCost)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            {status === 'READY' && (
              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                <Play className="w-6 h-6 fill-current" /> Initialize Charging
              </button>
            )}
            
            {status === 'CHARGING' && (
              <button
                onClick={handleStop}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-full bg-red-500/10 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-500 font-bold text-lg transition-all shadow-lg shadow-red-500/10"
              >
                <Square className="w-5 h-5 fill-current" /> Stop Session
              </button>
            )}

            {status === 'COMPLETED' && (
              <p className="text-center text-sm font-medium text-slate-400 animate-pulse">
                Redirecting to dashboard...
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
