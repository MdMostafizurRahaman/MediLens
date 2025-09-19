'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function Hero() {
  const { currentUser } = useAuth()

  const backgroundShapes = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 200 + 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 pt-20">
      {/* Enhanced Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundShapes.map((shape, index) => (
          <motion.div
            key={shape.id}
            className="absolute rounded-full"
            style={{
              width: shape.size,
              height: shape.size,
              background: index % 4 === 0 
                ? 'linear-gradient(135deg, #0ea5e9, #38bdf8)' 
                : index % 4 === 1
                ? 'linear-gradient(135deg, #d946ef, #e879f9)'
                : index % 4 === 2
                ? 'linear-gradient(135deg, #14b8a6, #2dd4bf)'
                : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              opacity: 0.15,
              filter: 'blur(1px)',
            }}
            animate={{
              x: [0, 150, -50, 0],
              y: [0, -120, 80, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              delay: shape.delay,
              ease: "easeInOut",
            }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
          />
        ))}
        
        {/* Additional Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 opacity-20 blur-sm"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-accent-400 to-success-400 opacity-20 blur-sm"
          animate={{
            y: [0, 40, 0],
            rotate: [360, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full bg-gradient-to-r from-warning-400 to-error-400 opacity-20 blur-sm"
          animate={{
            x: [0, 50, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Enhanced Gradient Overlay with Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-accent-500/10"></div>
      <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>

      <div className="relative z-10 hero-content text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="max-w-6xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Logo and Title Section */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="text-8xl md:text-9xl mb-6 inline-block relative"
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
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-display mb-6 text-gradient-primary font-bold tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              MediLens
            </motion.h1>
            <motion.div
              className="h-1 w-32 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ duration: 1, delay: 0.8 }}
            />
          </motion.div>

          {/* Enhanced Subtitle */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-700 mb-6 font-bold">
              Your <span className="text-gradient-secondary">Prescription</span>. Made <span className="text-gradient-accent">Clear</span>.
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl text-primary-600 font-semibold bg-gradient-to-r from-primary-100 to-accent-100 px-8 py-4 rounded-full inline-block shadow-lg">
              🇧🇩 A Solution Tailored for Bangladesh
            </p>
          </motion.div>

          {/* Enhanced Description Cards */}
          <motion.div 
            className="max-w-5xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <motion.div 
                className="card-professional bg-gradient-to-br from-error-50 to-warning-50 border-l-4 border-error-400 p-8 text-center md:text-left relative overflow-hidden"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-error-200/50 to-transparent rounded-bl-full"></div>
                <div className="text-5xl mb-6 text-center md:text-left animate-bounce-gentle">🔍</div>
                <h3 className="text-2xl font-bold text-error-700 mb-4">The Problem</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  In Bangladesh, many patients struggle to read or comprehend the handwritten prescriptions 
                  they receive from doctors. This often leads to confusion, misuse of medication, or unnecessary stress.
                </p>
                <div className="mt-6 flex items-center justify-center md:justify-start">
                  <div className="w-16 h-1 bg-gradient-to-r from-error-400 to-warning-400 rounded-full"></div>
                </div>
              </motion.div>

              <motion.div 
                className="card-professional bg-gradient-to-br from-success-50 to-accent-50 border-l-4 border-success-400 p-8 text-center md:text-left relative overflow-hidden"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-success-200/50 to-transparent rounded-bl-full"></div>
                <div className="text-5xl mb-6 text-center md:text-left animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>💡</div>
                <h3 className="text-2xl font-bold text-success-700 mb-4">Our Solution</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  MediLens is a smart, cross-platform web application that helps users decode their 
                  prescriptions, understand their health conditions, and access relevant medical guidance—all 
                  exclusively in Bangla.
                </p>
                <div className="mt-6 flex items-center justify-center md:justify-start">
                  <div className="w-16 h-1 bg-gradient-to-r from-success-400 to-accent-400 rounded-full"></div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Key Features Preview */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Why Choose MediLens?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto ">
              {[
                { icon: '🤖', label: 'AI Powered', color: 'from-primary-400 to-primary-600', desc: 'Advanced AI Analysis' },
                { icon: '🌐', label: 'Bangla Support', color: 'from-secondary-400 to-secondary-600', desc: 'Native Language' },
                { icon: '🔒', label: 'Secure & Private', color: 'from-accent-400 to-accent-600', desc: 'Your Data Safe' },
                { icon: '📱', label: 'Easy to Use', color: 'from-success-400 to-success-600', desc: 'Simple Interface' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className={`card-professional bg-gradient-to-br ${feature.color} p-6 rounded-2xl text-center text-black relative overflow-hidden group cursor-pointer`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1, type: "spring", bounce: 0.3 }}
                  whileHover={{ scale: 1.08, y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <motion.div 
                    className="text-4xl mb-3 relative z-10"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 3,
                      delay: index * 0.5,
                      repeat: Infinity,
                      repeatDelay: 4
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h4 className="text-lg font-bold mb-2 relative z-10">{feature.label}</h4>
                  <p className="text-sm opacity-90 relative z-10">{feature.desc}</p>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Enhanced CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            {currentUser ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/google-lens-test" className="btn-professional bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 px-10 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <motion.span 
                      className="text-2xl mr-3 inline-block"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      🔬
                    </motion.span>
                    Try AI Prescription Analysis
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                    />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/chat" className="btn-professional-secondary px-10 py-4 text-lg font-bold border-3 border-secondary-400 bg-gradient-to-r from-secondary-50 to-secondary-100 text-secondary-700 hover:from-secondary-500 hover:to-secondary-600 hover:text-white shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <motion.span 
                      className="text-2xl mr-3 inline-block"
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 1 }}
                    >
                      💬
                    </motion.span>
                    Chat with AI Assistant
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                    />
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/auth/register" className="btn-professional bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 px-10 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <motion.span 
                      className="text-2xl mr-3 inline-block"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      🚀
                    </motion.span>
                    Start Your Journey
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/google-lens-test" className="btn btn-enhanced btn-lg px-8 py-4 text-lg shadow-glow-primary">
                    <span className="text-2xl mr-2">🔬</span>
                    Try Prescription Analysis
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-16 pt-8 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <p className="text-sm text-gray-500 mb-4">Trusted by healthcare professionals and patients across Bangladesh</p>
            <div className="flex justify-center items-center gap-8 text-gray-400">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1, color: '#3b82f6' }}
              >
                {/* <span className="text-lg">🛡️</span>
                <span className="text-sm font-medium">HIPAA Compliant</span> */}
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1, color: '#10b981' }}
              >
                <span className="text-lg">🔒</span>
                <span className="text-sm font-medium">End-to-End Encrypted</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1, color: '#f59e0b' }}
              >
                <span className="text-lg">⚡</span>
                <span className="text-sm font-medium">AI Powered</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Link 
            href="/google-lens-test" 
            className="btn btn-circle btn-lg btn-enhanced shadow-glow-primary"
            title="Quick Upload"
          >
            <span className="text-2xl">📤</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
