'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user' // user, doctor, admin
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signup } = useAuth()
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match')
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    try {
      setError('')
      setLoading(true)
      await signup(formData.email, formData.password, formData.firstName, formData.lastName, formData.userType)
      
      // Show success message and redirect
      setError('')
      alert('Account created successfully! Please login to continue.')
      router.push('/auth/login')
    } catch (error) {
      setError('Failed to create account: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-success-200/30 to-warning-200/30 rounded-full blur-2xl"
          animate={{
            x: [0, -60, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-28 h-28 bg-gradient-to-r from-error-400 to-primary-400 rounded-full opacity-25 blur-xl"
          animate={{
            x: [0, 150, 0],
            y: [0, -100, 0],
            rotate: [0, 270, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-20 h-20 bg-gradient-to-r from-accent-300 to-success-300 rounded-full opacity-30 blur-lg"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-secondary-300 to-warning-300 rounded-full opacity-25 blur-md"
          animate={{
            y: [0, -60, 0],
            x: [0, 40, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div 
        className="card w-full max-w-lg bg-white/96 backdrop-blur-xl shadow-2xl border border-white/30 relative z-10"
        initial={{ opacity: 0, y: 60, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
      >
        <div className="card-body p-8">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="text-6xl mb-4 inline-block relative"
              animate={{ 
                rotate: [0, 8, -8, 0],
                scale: [1, 1.15, 1]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                repeatDelay: 3 
              }}
            >
              🏥
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-accent-400/30 to-primary-400/30 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            <h1 className="text-4xl font-bold text-gradient-accent mb-2">PrescribeCorrect</h1>
            <p className="text-gray-600 text-lg font-medium">Create your account to get started</p>
            <motion.div
              className="h-1 w-24 bg-gradient-to-r from-accent-500 to-primary-500 mx-auto rounded-full mt-4"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.div>

          {error && (
            <motion.div 
              className="alert bg-gradient-to-r from-error-100 to-error-50 border border-error-200 text-error-700 mb-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.svg 
                className="stroke-current shrink-0 h-6 w-6"
                fill="none" 
                viewBox="0 0 24 24"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.6 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </motion.svg>
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Account Type</span>
              </label>
              <select
                name="userType"
                className="select select-bordered w-full"
                value={formData.userType}
                onChange={handleChange}
                required
              >
                <option value="user">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Name</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  className="input input-bordered w-full"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Name</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  className="input input-bordered w-full"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label className="label">
                <span className="label-text-alt">Must be at least 6 characters</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                className="input input-bordered w-full"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-base-content/70">
              Already have an account?{' '}
              <Link href="/auth/login" className="link link-primary no-underline">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="link link-neutral text-sm no-underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
