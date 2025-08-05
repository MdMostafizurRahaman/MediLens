'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentUser, logout, hasRole } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getNavigationItems = () => {
    const baseItems = [
      { href: '/upload', label: '📋 Upload Prescription' },
      { href: '/chat', label: '💬 AI Assistant' },
      { href: '/doctors', label: '👨‍⚕️ Find Doctors' },
      { href: '/vitals', label: '🩺 Vital Signs' }
    ]

    if (hasRole('admin')) {
      return [
        { href: '/admin', label: '🛡️ Admin Panel' },
        ...baseItems
      ]
    }

    if (hasRole('doctor')) {
      return [
        { href: '/doctor-profile', label: '👨‍⚕️ My Profile' },
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

  const getUserRoleBadge = () => {
    if (hasRole('admin')) return '🛡️ Admin'
    if (hasRole('doctor')) return '👨‍⚕️ Doctor'
    return '👤 Patient'
  }

  const navigationItems = getNavigationItems()

  return (
    <nav className="navbar bg-primary text-primary-content shadow-lg">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16"></path>
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl font-bold">
          🏥 MediLens
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:bg-primary-focus">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="navbar-end">
        {currentUser ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost flex items-center gap-2">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-content font-bold text-sm">
                  {getUserInitials()}
                </div>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{getUserDisplayName()}</div>
                <div className="text-xs opacity-70">{getUserRoleBadge()}</div>
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-64 text-base-content">
              <li className="menu-title">
                <span>Account</span>
              </li>
              <li>
                <div className="flex items-center gap-2 p-2">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-sm">
                      {getUserInitials()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{getUserDisplayName()}</div>
                    <div className="text-xs opacity-70">{currentUser?.email}</div>
                    <div className="badge badge-sm mt-1">{getUserRoleBadge()}</div>
                  </div>
                </div>
              </li>
              
              <div className="divider my-1"></div>
              
              <li className="menu-title">
                <span>Quick Actions</span>
              </li>
              
              {hasRole('admin') && (
                <li><Link href="/admin">🛡️ Admin Dashboard</Link></li>
              )}
              
              {hasRole('doctor') && (
                <li><Link href="/doctor-profile">👨‍⚕️ My Doctor Profile</Link></li>
              )}
              
              <li><Link href="/profile">⚙️ Account Settings</Link></li>
              <li><Link href="/upload">📋 Upload Prescription</Link></li>
              <li><Link href="/chat">💬 AI Assistant</Link></li>
              
              <div className="divider my-1"></div>
              
              <li><a onClick={handleLogout} className="text-error">🚪 Logout</a></li>
            </ul>
          </div>
        ) : (
          <div className="space-x-2">
            <Link href="/auth/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link href="/auth/register" className="btn btn-secondary btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
