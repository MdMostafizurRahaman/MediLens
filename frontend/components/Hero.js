'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function Hero() {
  const { currentUser } = useAuth()

  return (
    <div className="hero min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="hero-content text-center text-primary-content">
        <motion.div 
          className="max-w-4xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            🏥 MediLens
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your Prescription. Made Clear.
          </motion.p>
          
          <motion.p 
            className="text-lg mb-8 opacity-90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            A Solution Tailored for Bangladesh
          </motion.p>
          
          <motion.div 
            className="max-w-3xl mx-auto text-lg mb-12 opacity-80"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="mb-4">
              In Bangladesh, many patients struggle to read or comprehend the handwritten prescriptions 
              they receive from doctors. This often leads to confusion, misuse of medication, or unnecessary stress.
            </p>
            <p>
              MediLens is a smart, cross-platform web application designed to close that gap. With the help 
              of modern AI and full support in Bangla language, MediLens helps users decode their 
              prescriptions, understand their health conditions, and access relevant medical guidance—all 
              exclusively in Bangla.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {currentUser ? (
              <>
                <Link href="/google-lens-test" className="btn btn-primary btn-lg">
                  🔬 Try  AI Prescription Analysis
                </Link>
                <Link href="/chat" className="btn btn-outline btn-lg">
                  Chat with Bot
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register" className="btn btn-accent btn-lg">
                  Get Started
                </Link>
                <Link href="/google-lens-test" className="btn btn-primary btn-lg">
                  🔬 Try Google Lens AI
                </Link>
                <Link href="/auth/login" className="btn btn-outline btn-lg">
                  Login
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
