'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const { currentUser, hasRole, getToken, logout } = useAuth()
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [activeDoctors, setActiveDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [activeTab, setActiveTab] = useState('pending')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    pendingApprovals: 0,
    totalChats: 0
  })
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    
    if (!hasRole('admin')) {
      router.push('/')
      return
    }

    fetchDashboardData()
  }, [currentUser])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      
      // Fetch all doctors
      const doctorsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/doctor/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (doctorsResponse.ok) {
        const doctors = await doctorsResponse.json()
        setPendingDoctors(doctors.filter(doc => doc.status === 'PENDING'))
        setActiveDoctors(doctors.filter(doc => doc.status === 'ACTIVE'))
        
        setStats(prev => ({
          ...prev,
          totalDoctors: doctors.filter(doc => doc.status === 'ACTIVE').length,
          pendingApprovals: doctors.filter(doc => doc.status === 'PENDING').length
        }))
      }

      // Fetch user statistics
      const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/user/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (usersResponse.ok) {
        const users = await usersResponse.json()
        setStats(prev => ({
          ...prev,
          totalUsers: users.length
        }))
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDoctorAction = async (doctorEmail, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [doctorEmail]: true }))
      const token = getToken()
      
      const status = action === 'approve' ? 'ACTIVE' : 'DISABLED'
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/doctor/status/${doctorEmail}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      })

      if (response.ok) {
        // Refresh the data
        await fetchDashboardData()
        alert(`Doctor ${action === 'approve' ? 'approved' : 'rejected'} successfully!`)
      } else {
        alert('Failed to update doctor status')
      }
    } catch (error) {
      console.error('Error updating doctor status:', error)
      alert('An error occurred while updating doctor status')
    } finally {
      setActionLoading(prev => ({ ...prev, [doctorEmail]: false }))
    }
  }

  const formatSpecializations = (specializations) => {
    if (!specializations || specializations.length === 0) return 'Not specified'
    return specializations.join(', ')
  }

  const formatDegrees = (degrees) => {
    if (!degrees || degrees.length === 0) return 'Not specified'
    return degrees.join(', ')
  }

  if (!currentUser || !hasRole('admin')) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You need admin privileges to access this page</p>
          <button onClick={() => router.push('/')} className="btn btn-primary">Go Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="navbar bg-primary text-primary-content">
        <div className="navbar-start">
          <h1 className="text-xl font-bold">🛡️ Admin Dashboard</h1>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              👨‍💼 {currentUser?.firstName} {currentUser?.lastName}
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 text-base-content rounded-box z-[1] w-52 p-2 shadow">
              <li><button onClick={() => router.push('/profile')}>Profile</button></li>
              <li><button onClick={logout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="stat bg-primary text-primary-content rounded-lg">
            <div className="stat-figure">
              <div className="text-3xl">👥</div>
            </div>
            <div className="stat-title">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          
          <div className="stat bg-success text-success-content rounded-lg">
            <div className="stat-figure">
              <div className="text-3xl">👨‍⚕️</div>
            </div>
            <div className="stat-title">Active Doctors</div>
            <div className="stat-value">{stats.totalDoctors}</div>
          </div>
          
          <div className="stat bg-warning text-warning-content rounded-lg">
            <div className="stat-figure">
              <div className="text-3xl">⏳</div>
            </div>
            <div className="stat-title">Pending Approvals</div>
            <div className="stat-value">{stats.pendingApprovals}</div>
          </div>
          
          <div className="stat bg-info text-info-content rounded-lg">
            <div className="stat-figure">
              <div className="text-3xl">💬</div>
            </div>
            <div className="stat-title">Total Chats</div>
            <div className="stat-value">{stats.totalChats}</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button 
            className={`tab ${activeTab === 'pending' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Pending Approvals ({pendingDoctors.length})
          </button>
          <button 
            className={`tab ${activeTab === 'active' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            ✅ Active Doctors ({activeDoctors.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4">Loading dashboard data...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Pending Doctors */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">🔍 Doctor Applications Pending Review</h2>
                {pendingDoctors.length === 0 ? (
                  <div className="text-center py-12 bg-base-200 rounded-lg">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="text-lg">No pending doctor applications!</p>
                    <p className="text-sm text-base-content/70">All applications have been reviewed.</p>
                  </div>
                ) : (
                  pendingDoctors.map((doctor) => (
                    <motion.div 
                      key={doctor.id}
                      className="card bg-base-200 shadow-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="card-body">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="card-title text-primary">
                              Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                            </h3>
                            <p className="text-sm text-base-content/70 mb-2">📧 {doctor.user?.email}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="font-semibold">🎓 Degrees:</p>
                                <p className="text-sm">{formatDegrees(doctor.degree)}</p>
                              </div>
                              <div>
                                <p className="font-semibold">🏥 Specialization:</p>
                                <p className="text-sm">{formatSpecializations(doctor.specialization)}</p>
                              </div>
                              <div>
                                <p className="font-semibold">🏢 Institute:</p>
                                <p className="text-sm">{doctor.institute || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="font-semibold">📍 Location:</p>
                                <p className="text-sm">{doctor.currentCity || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="font-semibold">🕒 Available Time:</p>
                                <p className="text-sm">{doctor.availableTime || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="font-semibold">📞 Phone:</p>
                                <p className="text-sm">{doctor.phoneNumber?.join(', ') || 'Not specified'}</p>
                              </div>
                            </div>
                            
                            {doctor.chamberAddress && (
                              <div className="mt-2">
                                <p className="font-semibold">🏥 Chamber Address:</p>
                                <p className="text-sm">{doctor.chamberAddress}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <button 
                              className={`btn btn-success btn-sm ${actionLoading[doctor.user?.email] ? 'loading' : ''}`}
                              onClick={() => handleDoctorAction(doctor.user?.email, 'approve')}
                              disabled={actionLoading[doctor.user?.email]}
                            >
                              ✅ Approve
                            </button>
                            <button 
                              className={`btn btn-error btn-sm ${actionLoading[doctor.user?.email] ? 'loading' : ''}`}
                              onClick={() => handleDoctorAction(doctor.user?.email, 'reject')}
                              disabled={actionLoading[doctor.user?.email]}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Active Doctors */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">👨‍⚕️ Active Doctors</h2>
                {activeDoctors.length === 0 ? (
                  <div className="text-center py-12 bg-base-200 rounded-lg">
                    <div className="text-4xl mb-4">🏥</div>
                    <p className="text-lg">No active doctors yet!</p>
                    <p className="text-sm text-base-content/70">Approved doctors will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activeDoctors.map((doctor) => (
                      <motion.div 
                        key={doctor.id}
                        className="card bg-base-200 shadow-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="card-body">
                          <h3 className="card-title text-success">
                            Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                          </h3>
                          <p className="text-sm text-base-content/70">📧 {doctor.user?.email}</p>
                          
                          <div className="mt-2 space-y-1">
                            <p className="text-sm"><strong>🎓:</strong> {formatDegrees(doctor.degree)}</p>
                            <p className="text-sm"><strong>🏥:</strong> {formatSpecializations(doctor.specialization)}</p>
                            <p className="text-sm"><strong>📍:</strong> {doctor.currentCity || 'Not specified'}</p>
                            <p className="text-sm"><strong>🕒:</strong> {doctor.availableTime || 'Not specified'}</p>
                          </div>

                          <div className="card-actions justify-end mt-4">
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => handleDoctorAction(doctor.user?.email, 'reject')}
                            >
                              🚫 Disable
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
