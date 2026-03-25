import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AuthLayout from './AuthLayout'
import { useToast, ToastContainer } from '../../components/ui/Toast'
import { authService } from '../../services/authService'

function InputField({ label, id, type = 'text', value, onChange, error, placeholder, autoComplete }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 rounded-xl bg-slate-800/60 border text-slate-100 text-sm placeholder-slate-500
            focus:outline-none focus:ring-2 transition-all duration-200
            ${error
              ? 'border-red-500/60 focus:ring-red-500/30 focus:border-red-500'
              : 'border-slate-700/60 focus:ring-sky-500/30 focus:border-sky-500/60 hover:border-slate-600'
            }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-400 flex items-center gap-1"
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function PasswordStrength({ password }) {
  const getStrength = (p) => {
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }

  const strength = getStrength(password)
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500']
  const textColors = ['', 'text-red-400', 'text-amber-400', 'text-sky-400', 'text-emerald-400']

  if (!password) return null

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              strength >= level ? colors[strength] : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${textColors[strength]}`}>
        Password strength: {labels[strength]}
      </p>
    </div>
  )
}

function validate(fields) {
  const errors = {}
  if (!fields.firstName.trim()) errors.firstName = 'First name is required'
  if (!fields.lastName.trim()) errors.lastName = 'Last name is required'
  if (!fields.email) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = 'Enter a valid email address'
  if (!fields.password) errors.password = 'Password is required'
  else if (fields.password.length < 6) errors.password = 'Password must be at least 6 characters'
  if (!fields.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else if (fields.password !== fields.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [toasts, addToast] = useToast()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate(form)
    if (!agreed) validationErrors.terms = 'You must agree to the Terms of Service'
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      await authService.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      })
      addToast('Account created! Redirecting to login...', 'success')
      setTimeout(() => navigate('/login'), 1400)
    } catch (err) {
      addToast(err.message || 'Registration failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} />
      <AuthLayout
        title="Create your account"
        subtitle="Start charging smarter with VoltGrid — it's free."
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="First name"
              id="reg-first-name"
              value={form.firstName}
              onChange={set('firstName')}
              error={errors.firstName}
              placeholder="Jane"
              autoComplete="given-name"
            />
            <InputField
              label="Last name"
              id="reg-last-name"
              value={form.lastName}
              onChange={set('lastName')}
              error={errors.lastName}
              placeholder="Doe"
              autoComplete="family-name"
            />
          </div>

          <InputField
            label="Email address"
            id="reg-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <InputField
            label="Password"
            id="reg-password"
            type="password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />

          {/* Password strength indicator */}
          {form.password && <PasswordStrength password={form.password} />}

          <InputField
            label="Confirm password"
            id="reg-confirm-password"
            type="password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />

          {/* Terms checkbox */}
          <div className="space-y-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked)
                    if (errors.terms) setErrors((p) => ({ ...p, terms: '' }))
                  }}
                  className="sr-only"
                  id="terms-checkbox"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200
                  ${agreed
                    ? 'bg-sky-500 border-sky-500'
                    : errors.terms
                      ? 'border-red-500/60 bg-transparent'
                      : 'border-slate-600 bg-transparent group-hover:border-sky-500/60'
                  }`}
                >
                  {agreed && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-400 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-sky-400 hover:text-sky-300 transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-sky-400 hover:text-sky-300 transition-colors">Privacy Policy</a>
              </span>
            </label>
            <AnimatePresence>
              {errors.terms && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-red-400 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.terms}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500
              shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40
              disabled:opacity-70 disabled:cursor-not-allowed
              transition-all duration-300 overflow-hidden group"
          >
            {/* Shimmer */}
            <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none" />

            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
              Sign in →
            </Link>
          </p>
        </form>
      </AuthLayout>
    </>
  )
}
