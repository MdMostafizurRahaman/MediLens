'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setError('')
      setLoading(true)
      const userData = await login(email, password)
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        router.push('/admin')
      } else if (userData.role === 'doctor') {
        router.push('/doctor-profile')
      } else {
        router.push('/google-lens-test')
      }
    } catch (error) {
      setError('Failed to log in: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-primary-200/30 to-secondary-200/30 rounded-full blur-2xl"
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-36 h-36 bg-gradient-to-l from-accent-200/30 to-success-200/30 rounded-full blur-2xl"
          animate={{
            x: [0, -60, 0],
            y: [0, 30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-r from-primary-300 to-secondary-300 rounded-full opacity-30 blur-md"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div 
        className="card w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 relative z-10"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      >
        <div className="card-body p-8">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="text-6xl mb-4 inline-block"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                repeatDelay: 2 
              }}
            >
              🏥
            </motion.div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-2">PrescribeCorrect</h1>
            <p className="text-gray-800 text-lg font-medium">Welcome back! Please sign in to your account</p>
            <motion.div
              className="h-1 w-20 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mt-3"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </motion.div>

          {error && (
            <motion.div 
              className="alert bg-gradient-to-r from-error-100 to-error-50 border border-error-200 text-error-700 mb-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.svg 
                className="stroke-current shrink-0 h-6 w-6"
                fill="none" 
                viewBox="0 0 24 24"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </motion.svg>
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div 
              className="form-group-professional"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="form-label-professional text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></span>
                Email Address
              </label>
              <motion.input
                type="email"
                placeholder="Enter your email address"
                className="form-input-professional border-2 border-primary-200 focus:border-primary-500 focus:ring-primary-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", bounce: 0.3 }}
              />
            </motion.div>

            <motion.div 
              className="form-group-professional"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label className="form-label-professional text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full"></span>
                Password
              </label>
              <motion.input
                type="password"
                placeholder="Enter your password"
                className="form-input-professional border-2 border-secondary-200 focus:border-secondary-500 focus:ring-secondary-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", bounce: 0.3 }}
              />
              <motion.div 
                className="mt-2 text-right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <a href="#" className="text-sm text-accent-600 hover:text-accent-700 font-medium hover:underline transition-colors duration-200">
                  Forgot password?
                </a>
              </motion.div>
            </motion.div>

            <motion.button 
              type="submit" 
              className={`btn-professional w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <motion.span
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      🚀
                    </motion.span>
                    <span>Sign In to Continue</span>
                  </>
                )}
              </div>
            </motion.button>
          </motion.form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-base-content/70">
              Don't have an account?{' '}
              <Link href="/auth/register" className="link link-primary no-underline">
                Sign up here
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
