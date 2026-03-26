import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, BatteryCharging, Navigation, Search, Filter, X, Zap, Plug } from 'lucide-react'
import { apiService } from '../../services/apiService'
import BookingModal from '../../components/BookingModal'
import Navbar from '../../components/Navbar'

// Custom DivIcons for our map markers
function createMapIcon(type) {
  let colorClass = 'bg-sky-500'   // Default
  let ringClass = 'ring-sky-500/30'
  
  if (type === 'FAST') {
    colorClass = 'bg-emerald-500'
    ringClass = 'ring-emerald-500/30'
  } else if (type === 'OFFLINE') {
    colorClass = 'bg-slate-500'
    ringClass = 'ring-slate-500/30'
  }

  const html = `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute inset-0 rounded-full ${colorClass} opacity-20 animate-ping"></div>
      <div class="absolute w-5 h-5 rounded-full ${colorClass} ring-4 ${ringClass} shadow-lg border-2 border-white flex items-center justify-center">
      </div>
    </div>
  `
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

// Ensure map updates when center changes
function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}

const ALL_CONNECTORS = ['TYPE_1', 'TYPE_2', 'CCS', 'CHADEMO']

export default function DashboardMap() {
  const navigate = useNavigate()
  
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [userLocation, setUserLocation] = useState([6.9271, 79.8612]) // Default: Colombo
  
  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [selectedConnectors, setSelectedConnectors] = useState([...ALL_CONNECTORS])
  const [bookingStationId, setBookingStationId] = useState(null)
  
  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setUserLocation([latitude, longitude])
          fetchStations(latitude, longitude)
        },
        (err) => {
          console.warn('Geolocation failed, using default', err)
          fetchStations(6.9271, 79.8612)
        }
      )
    } else {
      fetchStations(6.9271, 79.8612)
    }
  }, [])

  const fetchStations = async (lat, lng) => {
    setLoading(true)
    try {
      // Nearby endpoint defaults to 10km radius
      const data = await apiService.getStationsNearby(lat, lng, 50)
      setStations(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleConnector = (conn) => {
    setSelectedConnectors(prev => 
      prev.includes(conn) ? prev.filter(c => c !== conn) : [...prev, conn]
    )
  }

  // Filtered stations base on toggles
  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      // 1. Available check
      if (availableOnly && (!s.availableSlots || s.availableSlots <= 0)) return false
      
      // 2. Connector check - match ANY selected
      if (selectedConnectors.length === 0) return false
      if (s.chargers && s.chargers.length > 0) {
        const hasMatchingConnector = s.chargers.some(c => 
          selectedConnectors.includes(c.connectorType)
        )
        if (!hasMatchingConnector) return false
      }
      
      return true
    })
  }, [stations, availableOnly, selectedConnectors])

  return (
    <div className="relative w-full h-screen bg-slate-950 pt-16 md:pt-20 overflow-hidden flex flex-col lg:flex-row">
      <Navbar />
      
      {/* ── Desktop Sidebar / Mobile overlay ── */}
      <AnimatePresence>
        {(showFilters || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute lg:relative z-[1000] lg:z-10 bottom-0 left-0 w-full lg:w-96 lg:h-full
              bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 shadow-2xl
              flex flex-col rounded-t-3xl lg:rounded-none max-h-[85vh] lg:max-h-full"
          >
            {/* Grab handle for mobile */}
            <div className="w-full flex justify-center py-3 lg:hidden" onClick={() => setShowFilters(false)}>
              <div className="w-12 h-1.5 rounded-full bg-slate-700" />
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Zap className="w-6 h-6 text-emerald-400" />
                    Find Chargers
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {filteredStations.length} stations nearby
                  </p>
                </div>
                <button className="lg:hidden p-2 rounded-xl bg-slate-800" onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Filters */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Availability</h3>
                  <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <div className="relative flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={availableOnly}
                        onChange={(e) => setAvailableOnly(e.target.checked)}
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${availableOnly ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${availableOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                    <span className="text-slate-200 text-sm font-medium">Show Available Only</span>
                  </label>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Connectors</h3>
                  <div className="grid gap-2">
                    {ALL_CONNECTORS.map(conn => {
                      const active = selectedConnectors.includes(conn)
                      return (
                        <button
                          key={conn}
                          onClick={() => toggleConnector(conn)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all
                            ${active 
                              ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' 
                              : 'bg-slate-800/30 border-slate-700 hover:border-slate-600 text-slate-400'
                            }`}
                        >
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <Plug className="w-4 h-4" />
                            {conn.replace('_', ' ')}
                          </span>
                          {active && (
                            <div className="w-2 h-2 rounded-full bg-sky-500" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {loading && (
                  <div className="pt-8 flex flex-col items-center justify-center text-slate-500 gap-3">
                     <svg className="w-6 h-6 animate-spin text-sky-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm">Scanning nearby area...</span>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map Area ── */}
      <div className="flex-1 relative h-full">
        {/* Mobile top bar */}
        <div className="absolute top-4 left-4 right-4 z-[400] lg:hidden flex justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center px-4 py-3 flex-1 border border-white/5">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <span className="text-sm text-slate-300 font-medium truncate">Search nearby stations...</span>
          </div>
          <button 
            onClick={() => setShowFilters(true)}
            className="pointer-events-auto bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-white/5 hover:bg-slate-800 transition-colors"
          >
            <Filter className="w-5 h-5 text-sky-400" />
          </button>
        </div>

        <MapContainer 
          center={userLocation} 
          zoom={13} 
          zoomControl={false}
          className="w-full h-full bg-slate-900 z-0"
        >
          {/* Dark map tiles (CartoDB Dark Matter) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          <MapController center={userLocation} />

          {/* User Location Marker */}
          <Marker position={userLocation} icon={createMapIcon('USER')}>
             <Popup className="custom-popup">
                <p className="font-semibold">You are here</p>
             </Popup>
          </Marker>

          {/* Station Markers */}
          {filteredStations.map(station => {
            const isFast = station.chargers?.some(c => c.connectorType === 'CCS');
            const isOffline = station.availableSlots === 0;
            const markerType = isOffline ? 'OFFLINE' : (isFast ? 'FAST' : 'STANDARD');

            return (
              <Marker 
                key={station.id} 
                position={[station.latitude, station.longitude]}
                icon={createMapIcon(markerType)}
              >
                <Popup className="rounded-2xl border-0 overflow-hidden shadow-2xl !p-0">
                  <div className="bg-slate-900 text-white w-64 border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800/80 bg-slate-800/30">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-base leading-tight pr-2">{station.name}</h3>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${station.availableSlots > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {station.availableSlots > 0 ? `${station.availableSlots} AVAIL` : 'FULL'}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {station.address || 'Colombo, Sri Lanka'}
                      </p>
                    </div>
                    
                    <div className="p-4 space-y-3 bg-slate-900">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Pricing</span>
                        <span className="font-semibold text-emerald-400">${station.pricingPerKwh}/kWh</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Total Chargers</span>
                        <span className="font-medium">{station.totalChargers}</span>
                      </div>

                      <div className="flex gap-1 flex-wrap mt-2">
                        {station.chargers?.map((c, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-800 rounded text-[10px] font-medium text-slate-300 border border-slate-700">
                            {c.connectorType}
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={() => setBookingStationId(station.id)}
                        className="w-full mt-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        View Details & Book
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
        
        {/* Map UI overlays on desktop */}
        <div className="absolute bottom-6 right-6 z-[400] hidden lg:flex flex-col gap-3">
          <button 
             onClick={() => {
                navigator.geolocation.getCurrentPosition(pos => {
                   setUserLocation([pos.coords.latitude, pos.coords.longitude])
                })
             }}
             className="w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 transition-colors shadow-lg"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={!!bookingStationId}
        stationId={bookingStationId}
        onClose={() => setBookingStationId(null)}
        onBookingSuccess={(bookingId) => {
           setBookingStationId(null)
           navigate(`/session/${bookingId}`)
        }}
      />
    </div>
  )
}
