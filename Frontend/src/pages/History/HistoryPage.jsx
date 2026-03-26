import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, CreditCard, Filter, CheckCircle2, XCircle, Clock, ChevronLeft } from 'lucide-react'
import { apiService } from '../../services/apiService'
import { authService } from '../../services/authService'
import { useNavigate } from 'react-router-dom'
import { formatLKR } from '../../utils/currency'

export default function HistoryPage() {
  const navigate = useNavigate()
  
  const tokenUserId = authService.getUserId()
  const userId = !isNaN(Number(tokenUserId)) ? Number(tokenUserId) : 1

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Data
  const [payments, setPayments] = useState([])
  const [bookings, setBookings] = useState([])
  const [stationsCache, setStationsCache] = useState({}) // id -> name mapping

  // Interactions
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('date') // 'date' | 'cost'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' | 'desc'

  useEffect(() => {
    async function fetchLedger() {
      try {
        setLoading(true)
        
        // Parallel fetch for ledger and bookings
        let [paymentsRes, bookingsRes] = await Promise.all([
          apiService.getPaymentHistory(userId).catch(() => []),
          apiService.getUserBookings(userId).catch(() => [])
        ])

        setPayments(paymentsRes)
        setBookings(bookingsRes)

        // Find unique stations required
        const uniqueStationIds = [...new Set(bookingsRes.map(b => b.stationId).filter(Boolean))]
        
        // Fetch station names in parallel
        const stationFetchPromises = uniqueStationIds.map(async (id) => {
           try {
              const st = await apiService.getStationById(id)
              return { id, name: st.name }
           } catch {
              return { id, name: `Station #${id}` }
           }
        })
        
        const resolvedStations = await Promise.all(stationFetchPromises)
        const nameMap = {}
        resolvedStations.forEach(s => { nameMap[s.id] = s.name })
        setStationsCache(nameMap)

      } catch (err) {
        setError(err.message || 'Failed to initialize ledger data')
      } finally {
        setLoading(false)
      }
    }
    fetchLedger()
  }, [userId])

  // Merge Data
  const rows = useMemo(() => {
    return payments.map(payment => {
      const relatedBooking = bookings.find(b => b.id === payment.bookingId)
      const stationName = relatedBooking && stationsCache[relatedBooking.stationId] 
                          ? stationsCache[relatedBooking.stationId] 
                          : 'Unknown Station'
      return {
         ...payment,
         dateValue: payment.issueDate ? new Date(payment.issueDate).getTime() : 0,
         stationName
      }
    })
  }, [payments, bookings, stationsCache])

  // Process Sort & Filter
  const filteredAndSortedRows = useMemo(() => {
    // Search
    let result = rows.filter(r => 
       r.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (r.gatewayReference && r.gatewayReference.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    
    // Sort
    result.sort((a, b) => {
      let valA, valB;
      if (sortField === 'cost') {
         valA = a.amount || 0
         valB = b.amount || 0
      } else { // date
         valA = a.dateValue
         valB = b.dateValue
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB
    })

    return result
  }, [rows, searchQuery, sortField, sortOrder])

  const toggleSort = (field) => {
     if (sortField === field) {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
     } else {
        setSortField(field)
        setSortOrder('desc')
     }
  }

  // Badges
  const renderStatus = (status) => {
     if (status === 'COMPLETED') return <span className="inline-flex flex-shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap"><CheckCircle2 className="w-3 h-3" /> Paid</span>
     if (status === 'PENDING') return <span className="inline-flex flex-shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30 whitespace-nowrap"><Clock className="w-3 h-3" /> Pending</span>
     return <span className="inline-flex flex-shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/30 whitespace-nowrap"><XCircle className="w-3 h-3" /> Failed</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p>Loading History & Ledger...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pt-16 md:pt-24 px-4 pb-12">
      
      {/* Top Controls */}
      <div className="max-w-6xl mx-auto w-full mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
         <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-3">
               <ChevronLeft className="w-5 h-5" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
               <FileText className="w-8 h-8 text-sky-400" /> Session Ledger
            </h1>
            <p className="text-slate-400 text-sm mt-1">Review your charging history, energy consumption, and billing.</p>
         </div>

         <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
               type="text"
               placeholder="Search stations or TXN ID..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-white placeholder:text-slate-500"
            />
         </div>
      </div>

      <div className="max-w-6xl mx-auto w-full overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col min-h-[500px]">
         
         <div className="overflow-x-auto custom-scrollbar flex-1 relative">
            <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                     <th 
                        className="px-6 py-5 cursor-pointer hover:bg-slate-800/50 transition-colors select-none w-40"
                        onClick={() => toggleSort('date')}
                     >
                        <div className="flex items-center gap-2">
                           Issue Date
                           {sortField === 'date' && <span className="text-sky-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                        </div>
                     </th>
                     <th className="px-6 py-5 w-auto">Station & Location</th>
                     <th className="px-6 py-5 w-32 border-l border-slate-800/50 text-right">Energy (kWh)</th>
                     <th 
                        className="px-6 py-5 cursor-pointer hover:bg-slate-800/50 transition-colors border-l border-slate-800/50 select-none text-right w-32"
                        onClick={() => toggleSort('cost')}
                     >
                        <div className="flex items-center justify-end gap-2">
                           Total Cost
                           {sortField === 'cost' && <span className="text-sky-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                        </div>
                     </th>
                     <th className="px-6 py-5 border-l border-slate-800/50 text-center w-36">Status</th>
                  </tr>
               </thead>
               
               <tbody className="divide-y divide-slate-800">
                  {filteredAndSortedRows.length === 0 ? (
                     <tr>
                        <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                           <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                           No payment history found.
                        </td>
                     </tr>
                  ) : (
                     filteredAndSortedRows.map((row) => (
                        <motion.tr 
                           key={row.id} 
                           initial={{ opacity: 0 }} 
                           animate={{ opacity: 1 }}
                           className="hover:bg-slate-800/40 transition-colors group"
                        >
                           <td className="px-6 py-4 text-slate-300">
                              {row.issueDate || 'Unknown Date'}
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{row.gatewayReference}</div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="font-semibold text-white tracking-wide">{row.stationName}</div>
                              <div className="text-xs text-sky-400 mt-1 flex items-center gap-1 opacity-75">
                                 <CreditCard className="w-3 h-3" /> Booking #{row.bookingId}
                              </div>
                           </td>
                           <td className="px-6 py-4 border-l border-slate-800/50 font-mono text-emerald-400 font-medium text-right bg-slate-800/10">
                              {(row.totalKwh || row.kwhConsumed || 0).toFixed(2)}
                           </td>
                           <td className="px-6 py-4 border-l border-slate-800/50 font-bold text-white text-right bg-slate-800/10">
                              {formatLKR(row.amount || 0)}
                           </td>
                           <td className="px-6 py-4 border-l border-slate-800/50 text-center">
                              {renderStatus(row.status)}
                           </td>
                        </motion.tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}
