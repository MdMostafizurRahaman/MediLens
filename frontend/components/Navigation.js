'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { currentUser, logout, hasRole } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getNavigationItems = () => {
    const baseItems = [
      { href: '/google-lens-test', label: '🔬 Google Lens Analysis', icon: '🔬' },
      { href: '/analysis-history', label: '📋 My Analyses', icon: '📋' },
      { href: '/chat', label: '💬 AI Assistant', icon: '💬' },
      { href: '/doctors', label: '👨‍⚕️ Find Doctors', icon: '👨‍⚕️' },
      { href: '/vitals', label: '🩺 Vital Signs', icon: '🩺' }
    ]

    if (hasRole('admin')) {
      return [
        { href: '/admin', label: '🛡️ Admin Panel', icon: '🛡️' },
        ...baseItems
      ]
    }

    if (hasRole('doctor')) {
      return [
        { href: '/doctor-profile', label: '👨‍⚕️ My Profile', icon: '👨‍⚕️' },
        ...baseItems
      ]
    }

    return baseItems
  }

  const getUserDisplayName = () => {
    if (currentUser?.firstName) {
      return `${currentUser.firstName} ${currentUser.lastName || ''}`
    }
    return currentUser?.email?.split('@')[0] || 'User'
  }

  const getUserInitials = () => {
    if (currentUser?.firstName) {
      return currentUser.firstName[0] + (currentUser.lastName?.[0] || '')
    }
    return currentUser?.email?.[0]?.toUpperCase() || 'U'
  }

  const getUserProfileImage = () => {
    return currentUser?.profileImage || currentUser?.photoURL || null
  }

  const getUserRoleBadge = () => {
    if (hasRole('admin')) return { icon: '🛡️', text: 'Admin', color: 'bg-purple-100 text-purple-800' }
    if (hasRole('doctor')) return { icon: '👨‍⚕️', text: 'Doctor', color: 'bg-blue-100 text-blue-800' }
    return { icon: '👤', text: 'Patient', color: 'bg-green-100 text-green-800' }
  }

  const navigationItems = getNavigationItems()
  const roleBadge = getUserRoleBadge()

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-primary-100' 
          : 'bg-white/90 backdrop-blur-md'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="navbar px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="navbar-start">
          <div className="dropdown">
            <motion.div 
              tabIndex={0} 
              role="button" 
              className="btn btn-ghost lg:hidden hover:bg-primary-50 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg 
                className="w-6 h-6 text-primary-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16"></path>
              </motion.svg>
            </motion.div>
            <AnimatePresence>
              <motion.ul 
                tabIndex={0} 
                className="menu menu-sm dropdown-content mt-3 z-[1] p-4 shadow-xl bg-white/95 backdrop-blur-xl rounded-2xl w-64 border border-primary-100"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {navigationItems.map((item, index) => (
                  <motion.li 
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link 
                      href={item.href} 
                      prefetch={true}
                      className="text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl p-3 transition-all duration-200 flex items-center gap-3"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label.replace(item.icon, '').trim()}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
          <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-200">
            <motion.div
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🏥
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gradient">MediLens</span>
              <span className="text-xs text-primary-500 font-medium -mt-1">Your Prescription. Made Clear.</span>
            </div>
          </Link>
        </div>
        
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2">
            {navigationItems.map((item, index) => (
              <motion.li 
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  href={item.href} 
                  prefetch={true}
                  className="text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl px-4 py-2 transition-all duration-200 font-medium flex items-center gap-2 group"
                >
                  <motion.span 
                    className="text-lg group-hover:scale-110 transition-transform duration-200"
                  >
                    {item.icon}
                  </motion.span>
                  <span>{item.label.replace(item.icon, '').trim()}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
        
        <div className="navbar-end">
          {currentUser ? (
            <div className="dropdown dropdown-end">
              <motion.div 
                tabIndex={0} 
                role="button" 
                className="btn btn-ghost flex items-center gap-3 hover:bg-primary-50 transition-all duration-200 px-4 py-2 rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* <div className="avatar placeholder">
                  {getUserProfileImage() ? (
                    <div className="w-10 h-10 rounded-full ring-2 ring-primary-300">
                      <img 
                        src={getUserProfileImage()} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full w-10 h-10 items-center justify-center font-bold hidden">
                        {getUserInitials()}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg ring-2 ring-primary-300">
                      {getUserInitials()}
                    </div>
                  )}
                </div> */}
                <div className="flex flex-col items-start">
                  <div className="text-sm font-semibold text-gray-800">{getUserDisplayName()}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${roleBadge.color} flex items-center gap-1`}>
                    <span>{roleBadge.icon}</span>
                    <span>{roleBadge.text}</span>
                  </div>
                </div>
              </motion.div>
              <motion.ul 
                tabIndex={0} 
                className="menu menu-sm dropdown-content mt-3 z-[1] p-4 shadow-xl bg-white/95 backdrop-blur-xl rounded-2xl w-80 border border-primary-100"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <li className="px-3 py-2 border-b border-gray-100 mb-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold text-gray-800">{getUserDisplayName()}</div>
                      <div className="text-sm text-gray-500">{currentUser?.email}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${roleBadge.color} flex items-center gap-1 mt-1 w-fit`}>
                        <span>{roleBadge.icon}</span>
                        <span>{roleBadge.text}</span>
                      </div>
                    </div>
                  </div>
                </li>
                
                <div className="space-y-1">
                  {hasRole('admin') && (
                    <li>
                      <Link href="/admin" className="text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl p-3 transition-all duration-200 flex items-center gap-3">
                        <span className="text-lg">🛡️</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    </li>
                  )}
                  {hasRole('doctor') && (
                    <li>
                      <Link href="/doctor-profile" className="text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl p-3 transition-all duration-200 flex items-center gap-3">
                        <span className="text-lg">👨‍⚕️</span>
                        <span>My Doctor Profile</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/profile" className="text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl p-3 transition-all duration-200 flex items-center gap-3">
                      <span className="text-lg">⚙️</span>
                      <span>Account Settings</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/google-lens-test" className="text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl p-3 transition-all duration-200 flex items-center gap-3">
                      <span className="text-lg">📋</span>
                      <span>Upload Prescription</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/chat" className="text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl p-3 transition-all duration-200 flex items-center gap-3">
                      <span className="text-lg">💬</span>
                      <span>AI Assistant</span>
                    </Link>
                  </li>
                  <div className="divider my-2"></div>
                  <li>
                    <motion.a 
                      onClick={handleLogout} 
                      className="text-red-600 hover:bg-red-50 rounded-xl p-3 transition-all duration-200 flex items-center gap-3 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-lg">🚪</span>
                      <span>Logout</span>
                    </motion.a>
                  </li>
                </div>
              </motion.ul>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="btn btn-ghost btn-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 rounded-xl px-4">
                Login
              </Link>
              <Link href="/auth/register" className="btn btn-enhanced btn-sm rounded-xl px-6">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
