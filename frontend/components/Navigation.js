'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentUser, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="navbar bg-primary text-primary-content">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16"></path>
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
            <li><Link href="/upload">Upload Prescription</Link></li>
            <li><Link href="/chat">Chat with Bot</Link></li>
            <li><Link href="/doctors">Find Doctors</Link></li>
            <li><Link href="/vitals">Vital Signs</Link></li>
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl">
          🏥 MediLens
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link href="/upload">Upload Prescription</Link></li>
          <li><Link href="/chat">Chat with Bot</Link></li>
          <li><Link href="/doctors">Find Doctors</Link></li>
          <li><Link href="/vitals">Vital Signs</Link></li>
        </ul>
      </div>
      
      <div className="navbar-end">
        {currentUser ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-content">
                  {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                </div>
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
              <li><a>Profile</a></li>
              <li><a>Settings</a></li>
              <li><a onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        ) : (
          <div className="space-x-2">
            <Link href="/auth/login" className="btn btn-ghost">Login</Link>
            <Link href="/auth/register" className="btn btn-secondary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
