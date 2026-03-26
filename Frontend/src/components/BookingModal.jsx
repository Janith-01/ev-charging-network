import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Zap, Plug, Navigation, CheckCircle2 } from 'lucide-react'
import { apiService } from '../services/apiService'
import { authService } from '../services/authService'
import { formatLKR } from '../utils/currency'

export default function BookingModal({ stationId, isOpen, onClose, onBookingSuccess }) {
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Form State
  const [selectedChargerId, setSelectedChargerId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen && stationId) {
      setLoading(true)
      setError(null)
      setSuccess(false)
      setSelectedChargerId('')
      setSelectedDate('')
      
      apiService.getStationById(stationId)
        .then(data => setStation(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [isOpen, stationId])

  const handleBook = async (e) => {
    e.preventDefault()
    if (!selectedChargerId || !selectedDate) return
    
    setBookingLoading(true)
    setError(null)
    
    try {
      // Provide a fallback userId of 1 since the backend doesn't embed ID in JWT currently
      const tokenUserId = authService.getUserId()
      const numericUserId = !isNaN(Number(tokenUserId)) ? Number(tokenUserId) : 1

      const payload = {
        userId: numericUserId,
        stationId: station.id,
        chargerId: parseInt(selectedChargerId),
        date: selectedDate, // expected format 'YYYY-MM-DD'
      }
      
      const data = await apiService.createBooking(payload)
      setSuccess(true)
      
      if (onBookingSuccess) {
         setTimeout(() => onBookingSuccess(data.id), 2000)
      }
    } catch (err) {
      setError(err.message || 'Failed to confirm booking. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-800/20 flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-sky-400" />
                Book Charging Session
              </h2>
              {station && (
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {station.name}
                </p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <p>Loading station details...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            ) : success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="py-10 flex flex-col items-center text-center gap-4"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Booking Confirmed!</h3>
                  <p className="text-slate-400 text-sm max-w-sm">
                    Your spot at {station?.name} has been secured for {selectedDate}.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                >
                  Return to Map
                </button>
              </motion.div>
            ) : (
              station && (
                <div className="space-y-6">
                  {/* Station Specs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-400">Rate Energy</span>
                      <p className="text-lg font-bold text-emerald-400">{formatLKR(station.pricingPerKwh)}<span className="text-sm font-medium text-slate-500"> / kWh</span></p>
                    </div>
                    </div>
                    <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Availability</p>
                      <p className="text-lg font-bold text-white">
                        <span className={station.availableSlots > 0 ? 'text-sky-400' : 'text-red-400'}>
                          {station.availableSlots}
                        </span>
                        <span className="text-sm font-medium text-slate-500"> / {station.totalChargers} slots</span>
                      </p>
                    </div>
                  </div>

                  {/* Booking Form */}
                  <form id="booking-form" onSubmit={handleBook} className="space-y-5">
                    
                    {/* Date Picker */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sky-400" /> Date of Arrival
                      </label>
                      <input 
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all custom-date-picker"
                      />
                    </div>

                    {/* Charger Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Plug className="w-4 h-4 text-sky-400" /> Select Charger
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {station.chargers?.map(charger => (
                          <label 
                            key={charger.id}
                            className={`relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                              ${charger.status === 'AVAILABLE' ? 'hover:border-sky-500/50 hover:bg-slate-800/50' : 'opacity-50 cursor-not-allowed'}
                              ${selectedChargerId === String(charger.id) ? 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500' : 'border-slate-700 bg-slate-900'}
                            `}
                          >
                            <input 
                              type="radio" 
                              name="charger" 
                              value={charger.id}
                              disabled={charger.status !== 'AVAILABLE'}
                              checked={selectedChargerId === String(charger.id)}
                              onChange={(e) => setSelectedChargerId(e.target.value)}
                              className="sr-only"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{charger.connectorType}</span>
                              <span className="text-xs text-slate-400">ID: #{charger.id}</span>
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                              ${charger.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}
                            `}>
                              {charger.status}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
              )
            )}
          </div>

          {/* Footer Actions */}
          {!loading && !success && (
            <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-900/50 flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="booking-form"
                disabled={bookingLoading || !selectedChargerId || !selectedDate}
                className="w-full flex-1 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
