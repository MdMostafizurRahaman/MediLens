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
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <motion.div 
        className="card w-full max-w-md bg-base-100 shadow-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="card-body">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary">🏥 MediLens</h1>
            <p className="text-base-content/70 mt-2">Create your account to get started</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
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

          <div className="form-control mt-4">
            <label className="label cursor-pointer">
              <span className="label-text text-sm">
                I agree to the <a href="#" className="link link-primary">Terms of Service</a> and <a href="#" className="link link-primary">Privacy Policy</a>
              </span>
              <input type="checkbox" className="checkbox checkbox-primary" required />
            </label>
          </div>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-base-content/70">
              Already have an account?{' '}
              <Link href="/auth/login" className="link link-primary">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="link link-neutral text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
