import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Car, Mail, Phone, Settings, Save, Plus, X, BatteryCharging, Plug, ChevronLeft } from 'lucide-react'
import { apiService } from '../../services/apiService'
import { authService } from '../../services/authService'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const navigate = useNavigate()
  
  const tokenUserId = authService.getUserId()
  const userId = !isNaN(Number(tokenUserId)) ? Number(tokenUserId) : 1

  const [activeTab, setActiveTab] = useState('personal') // 'personal' or 'vehicles'
  
  // Data States
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', email: '' })
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ make: '', model: '', batteryCapacity: '', connectorType: 'CCS' })
  const [addingVehicle, setAddingVehicle] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [profData, vehData] = await Promise.all([
          apiService.getProfile(userId),
          apiService.getUserVehicles(userId)
        ])
        setProfile(profData)
        setVehicles(vehData)
      } catch (err) {
        setError(err.message || 'Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [userId])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMsg('')
    try {
      await apiService.updateProfile(userId, profile)
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAddVehicle = async (e) => {
    e.preventDefault()
    setAddingVehicle(true)
    setError(null)
    try {
      const payload = {
         ...newVehicle,
         batteryCapacity: Number(newVehicle.batteryCapacity)
      }
      const savedVehicle = await apiService.addVehicle(userId, payload)
      setVehicles([...vehicles, savedVehicle])
      setIsModalOpen(false)
      setNewVehicle({ make: '', model: '', batteryCapacity: '', connectorType: 'CCS' })
      setSuccessMsg('Vehicle added successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to add vehicle')
    } finally {
      setAddingVehicle(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p>Loading your garage...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pt-16 md:pt-24 px-4 pb-12">
      
      {/* Top Nav */}
      <div className="max-w-4xl mx-auto w-full mb-8 flex justify-between items-center">
         <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ChevronLeft className="w-5 h-5" /> Back to Dashboard
         </button>
      </div>

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('personal')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'personal' 
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
            }`}
          >
            <User className="w-5 h-5" /> Personal Info
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'vehicles' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
            }`}
          >
            <Car className="w-5 h-5" /> My Garage
          </button>
          <button
            onClick={() => {
               authService.clearToken()
               navigate('/login')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all mt-8"
          >
            <Settings className="w-5 h-5" /> Log Out
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl min-h-[500px]">
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> {successMsg}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* PERSONAL INFO TAB */}
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                  <p className="text-sm text-slate-400 mt-1">Update your contact details and account information.</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">First Name</label>
                      <input 
                        type="text" 
                        required
                        value={profile?.firstName || ''} 
                        onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Name</label>
                      <input 
                        type="text" 
                        required
                        value={profile?.lastName || ''} 
                        onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/50" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="tel" 
                        value={profile?.phone || ''} 
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/50" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* MY VEHICLES TAB */}
            {activeTab === 'vehicles' && (
              <motion.div
                key="vehicles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white">My Garage</h2>
                    <p className="text-sm text-slate-400 mt-1">Manage your registered EV vehicles.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="p-3 sm:px-4 sm:py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Add Vehicle</span>
                  </button>
                </div>

                {vehicles.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-700/50 rounded-2xl bg-slate-950/50">
                    <Car className="w-12 h-12 text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-1">Your garage is empty</h3>
                    <p className="text-slate-400 text-sm max-w-xs">Add your first Electric Vehicle to quickly match with compatible charging stations.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vehicles.map(v => (
                      <div key={v.id} className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5 bg-white mix-blend-overlay rounded-bl-full w-24 h-24 pointer-events-none" />
                        <h3 className="text-lg font-bold text-white mb-1">{v.make} <span className="text-sky-400">{v.model}</span></h3>
                        
                        <div className="mt-4 space-y-2">
                           <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400 flex items-center gap-1.5"><BatteryCharging className="w-4 h-4" /> Capcity</span>
                              <span className="font-semibold">{v.batteryCapacity} kWh</span>
                           </div>
                           <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400 flex items-center gap-1.5"><Plug className="w-4 h-4" /> Port</span>
                              <span className="font-semibold bg-slate-800 px-2 py-0.5 rounded text-xs tracking-wider">{v.connectorType}</span>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ADD VEHICLE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Car className="w-6 h-6 text-emerald-400" /> Add EV to Garage
                </h3>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">MAKE</label>
                  <input required type="text" placeholder="e.g. Tesla" value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">MODEL</label>
                  <input required type="text" placeholder="e.g. Model 3 Long Range" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">BATTERY CAPACITY (kWh)</label>
                  <input required type="number" step="0.1" min="10" max="250" placeholder="e.g. 75" value={newVehicle.batteryCapacity} onChange={e => setNewVehicle({...newVehicle, batteryCapacity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">CONNECTOR TYPE</label>
                  <select required value={newVehicle.connectorType} onChange={e => setNewVehicle({...newVehicle, connectorType: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm font-medium tracking-wider">
                    <option value="TYPE_1">Type 1 (J1772)</option>
                    <option value="TYPE_2">Type 2 (Mennekes)</option>
                    <option value="CCS">CCS</option>
                    <option value="CHADEMO">CHAdeMO</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={addingVehicle} className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold tracking-wide transition-all shadow-lg flex justify-center items-center">
                    {addingVehicle ? 'Adding...' : 'Register Vehicle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
