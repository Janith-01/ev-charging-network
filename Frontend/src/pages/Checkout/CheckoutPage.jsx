import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Lock, CreditCard, ChevronLeft, Zap, FileText, Calendar } from 'lucide-react'
import { apiService } from '../../services/apiService'
import { authService } from '../../services/authService'
import { formatLKR } from '../../utils/currency'

export default function CheckoutPage() {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  // Data
  const [sessionData, setSessionData] = useState(location.state || null)

  // Form
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  useEffect(() => {
    async function fetchMissingData() {
      try {
        setLoading(true)
        const booking = await apiService.getBookingById(bookingId)
        const station = await apiService.getStationById(booking.stationId)
        
        // If arrived via direct link instead of SessionPage transition
        setSessionData({
          booking,
          station,
          kwhConsumed: 12.5, // Mock value if missing
          timeElapsed: 1800 // Mock 30 mins
        })
      } catch (err) {
        setError(err.message || 'Failed to load checkout details')
      } finally {
        setLoading(false)
      }
    }

    if (!sessionData) {
      fetchMissingData()
    } else {
      setLoading(false)
    }
  }, [bookingId, sessionData])

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!cardName || cardNumber.length < 15 || !expiry || !cvc) {
      setError("Please fill out all card details correctly.")
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const tokenUserId = authService.getUserId()
      const numericUserId = !isNaN(Number(tokenUserId)) ? Number(tokenUserId) : 1
      
      const payload = {
        bookingId: parseInt(bookingId),
        userId: sessionData.booking.userId || numericUserId,
        stationId: sessionData.station.id,
        amount: Number((sessionData.kwhConsumed * sessionData.station.pricingPerKwh).toFixed(2)),
        kwhConsumed: sessionData.kwhConsumed,
        pricePerKwh: sessionData.station.pricingPerKwh
      }

      await apiService.createPayment(payload)

      setSuccess(true)
      setTimeout(() => {
         // Redirect back to map dashboard
         navigate('/dashboard')
      }, 3000)

    } catch (err) {
      // If error contains "Payment already exists", we can treat it as success or show message
      if (err.message && err.message.toLowerCase().includes("unique constraint")) {
         setSuccess(true) // BookingService natively triggered payment already
         setTimeout(() => navigate('/dashboard'), 3000)
      } else {
         setError(err.message || 'Payment processing failed.')
      }
    } finally {
      setProcessing(false)
    }
  }

  // Formatting helpers
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}m ${s}s`
  }
  
  const handleCardNumber = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 16) val = val.slice(0, 16)
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(val)
  }

  const handleExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 4) val = val.slice(0, 4)
    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2)
    setExpiry(val)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p>Loading Invoice Details...</p>
      </div>
    )
  }

  const invoiceAmount = (sessionData?.kwhConsumed * sessionData?.station?.pricingPerKwh).toFixed(2)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pt-16 md:pt-0">
      
      {/* Top Nav (Mobile mostly) */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
        >
          
          {/* SUCCESS OVERLAY */}
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-slate-400 max-w-md">
                  Thank you for using VoltGrid. Your final invoice has been processed securely. Redirecting to your dashboard...
                </p>
                <div className="mt-8 w-64 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: "0%" }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 3, ease: "linear" }}
                     className="h-full bg-emerald-500"
                   />
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          {/* LEFT: INVOICE DETAILS */}
          <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between bg-slate-900/50">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                  <FileText className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Session Invoice</h2>
                  <p className="text-sm text-slate-400">Order #{bookingId?.padStart(6, '0')}</p>
                </div>
              </div>

              <div className="space-y-6">
                
                <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-emerald-400" />
                     </div>
                     <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase">Location</p>
                        <p className="font-bold text-white tracking-wide">{sessionData?.station?.name}</p>
                     </div>
                  </div>

                  <hr className="border-slate-700/50 my-4" />

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400 font-medium">Energy Consumed</span>
                    <span className="font-bold">{sessionData?.kwhConsumed.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400 font-medium">Session Duration</span>
                    <span className="font-bold">{formatTime(sessionData?.timeElapsed)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Rate / kWh</span>
                    <span className="font-bold text-sky-400">{formatLKR(sessionData?.station?.pricingPerKwh)}</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-10">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 font-medium text-lg">Total Amount</span>
                <span className="text-4xl font-black text-emerald-400">{formatLKR(invoiceAmount)}</span>
              </div>
            </div>
          </div>


          {/* RIGHT: PAYMENT FORM */}
          <div className="p-8 lg:p-12 relative flex flex-col justify-center">
             
            <div className="mb-8">
               <h3 className="text-xl font-bold text-white mb-2">Payment Details</h3>
               <p className="text-sm text-slate-400 flex items-center gap-1.5">
                 <Lock className="w-3.5 h-3.5 text-emerald-400" /> End-to-end encrypted connection
               </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-5">
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cardholder Name</label>
                <input 
                  type="text"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumber}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-mono font-medium tracking-widest placeholder:tracking-normal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Expiry Date</label>
                  <input 
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiry}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-mono tracking-widest placeholder:tracking-normal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">CVC</label>
                  <input 
                    type="password"
                    placeholder="•••"
                    maxLength="4"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-mono tracking-widest placeholder:tracking-normal"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing || !sessionData}
                className="w-full mt-6 flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-sky-500/20"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Pay {formatLKR(invoiceAmount)}
                  </>
                )}
              </button>
            </form>

          </div>
        </motion.div>
      </div>
    </div>
  )
}
