'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function DoctorProfile() {
  const { currentUser, hasRole, getToken, logout } = useAuth()
  const [doctorData, setDoctorData] = useState(null)
  const [formData, setFormData] = useState({
    specialization: [''],
    degree: [''],
    phoneNumber: [''],
    chamberAddress: '',
    designation: '',
    institute: '',
    currentCity: '',
    availableTime: '',
    photoUrl: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    
    if (!hasRole('doctor')) {
      router.push('/')
      return
    }

    fetchDoctorData()
  }, [currentUser])

  const fetchDoctorData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/doctor/${currentUser?.email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDoctorData(data)
        
        // Populate form with existing data
        setFormData({
          specialization: data.specialization || [''],
          degree: data.degree || [''],
          phoneNumber: data.phoneNumber || [''],
          chamberAddress: data.chamberAddress || '',
          designation: data.designation || '',
          institute: data.institute || '',
          currentCity: data.currentCity || '',
          availableTime: data.availableTime || '',
          photoUrl: data.photoUrl || ''
        })
      } else if (response.status === 404) {
        // Doctor profile doesn't exist yet, use empty form
        setDoctorData(null)
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error)
      setError('Failed to load doctor profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const token = getToken()
      
      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        specialization: formData.specialization.filter(s => s.trim() !== ''),
        degree: formData.degree.filter(d => d.trim() !== ''),
        phoneNumber: formData.phoneNumber.filter(p => p.trim() !== '')
      }

      const isUpdate = doctorData !== null
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/doctor${isUpdate ? '' : '/add'}`
      const method = isUpdate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      })

      if (response.ok) {
        setSuccess(isUpdate ? 'Profile updated successfully! Changes will be reviewed by admin.' : 'Profile created successfully! Waiting for admin approval.')
        if (!isUpdate) {
          await fetchDoctorData() // Refresh data
        }
      } else {
        const errorText = await response.text()
        setError(errorText || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving doctor profile:', error)
      setError('An error occurred while saving your profile')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <div className="badge badge-success">✅ Approved</div>
      case 'PENDING':
        return <div className="badge badge-warning">⏳ Pending Review</div>
      case 'DISABLED':
        return <div className="badge badge-error">❌ Disabled</div>
      default:
        return <div className="badge badge-neutral">❓ Unknown</div>
    }
  }

  if (!currentUser || !hasRole('doctor')) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You need doctor privileges to access this page</p>
          <button onClick={() => router.push('/')} className="btn btn-primary">Go Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="navbar bg-secondary text-secondary-content">
        <div className="navbar-start">
          <h1 className="text-xl font-bold">👨‍⚕️ Doctor Profile</h1>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              Dr. {currentUser?.firstName} {currentUser?.lastName}
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 text-base-content rounded-box z-[1] w-52 p-2 shadow">
              <li><button onClick={() => router.push('/doctors')}>View All Doctors</button></li>
              <li><button onClick={() => router.push('/chat')}>Patient Chat</button></li>
              <li><button onClick={logout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        {loading ? (
          <div className="text-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4">Loading your profile...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Status Section */}
            {doctorData && (
              <div className="card bg-base-200 shadow-lg mb-6">
                <div className="card-body">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="card-title">Profile Status</h2>
                      <p className="text-base-content/70">Current approval status of your doctor profile</p>
                    </div>
                    {getStatusBadge(doctorData.status)}
                  </div>
                  
                  {doctorData.status === 'PENDING' && (
                    <div className="alert alert-warning mt-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.336 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                      <span>Your profile is under review by the admin team. You'll be notified once approved.</span>
                    </div>
                  )}
                  
                  {doctorData.status === 'ACTIVE' && (
                    <div className="alert alert-success mt-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span>Congratulations! Your profile is approved and visible to patients.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Form */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-6">
                  {doctorData ? '✏️ Edit Profile' : '📝 Complete Your Profile'}
                </h2>

                {error && (
                  <div className="alert alert-error mb-4">
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success mb-4">
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Specializations */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">🏥 Specializations</span>
                    </label>
                    {formData.specialization.map((spec, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="e.g., Cardiology, Neurology"
                          className="input input-bordered flex-1"
                          value={spec}
                          onChange={(e) => handleArrayInputChange('specialization', index, e.target.value)}
                          required={index === 0}
                        />
                        <button
                          type="button"
                          className="btn btn-error btn-sm"
                          onClick={() => removeArrayField('specialization', index)}
                          disabled={formData.specialization.length === 1}
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm mt-2"
                      onClick={() => addArrayField('specialization')}
                    >
                      ➕ Add Specialization
                    </button>
                  </div>

                  {/* Degrees */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">🎓 Medical Degrees</span>
                    </label>
                    {formData.degree.map((degree, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="e.g., MBBS, MD, MS"
                          className="input input-bordered flex-1"
                          value={degree}
                          onChange={(e) => handleArrayInputChange('degree', index, e.target.value)}
                          required={index === 0}
                        />
                        <button
                          type="button"
                          className="btn btn-error btn-sm"
                          onClick={() => removeArrayField('degree', index)}
                          disabled={formData.degree.length === 1}
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm mt-2"
                      onClick={() => addArrayField('degree')}
                    >
                      ➕ Add Degree
                    </button>
                  </div>

                  {/* Phone Numbers */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">📞 Phone Numbers</span>
                    </label>
                    {formData.phoneNumber.map((phone, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="tel"
                          placeholder="e.g., +880 1234567890"
                          className="input input-bordered flex-1"
                          value={phone}
                          onChange={(e) => handleArrayInputChange('phoneNumber', index, e.target.value)}
                          required={index === 0}
                        />
                        <button
                          type="button"
                          className="btn btn-error btn-sm"
                          onClick={() => removeArrayField('phoneNumber', index)}
                          disabled={formData.phoneNumber.length === 1}
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm mt-2"
                      onClick={() => addArrayField('phoneNumber')}
                    >
                      ➕ Add Phone Number
                    </button>
                  </div>

                  {/* Other Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">🏢 Designation</span>
                      </label>
                      <input
                        type="text"
                        name="designation"
                        placeholder="e.g., Consultant, Assistant Professor"
                        className="input input-bordered"
                        value={formData.designation}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">🏥 Institute/Hospital</span>
                      </label>
                      <input
                        type="text"
                        name="institute"
                        placeholder="e.g., Dhaka Medical College"
                        className="input input-bordered"
                        value={formData.institute}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">📍 Current City</span>
                      </label>
                      <input
                        type="text"
                        name="currentCity"
                        placeholder="e.g., Dhaka, Chittagong"
                        className="input input-bordered"
                        value={formData.currentCity}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">🕒 Available Time</span>
                      </label>
                      <input
                        type="text"
                        name="availableTime"
                        placeholder="e.g., 9 AM - 5 PM, Sat-Thu"
                        className="input input-bordered"
                        value={formData.availableTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">🏥 Chamber Address</span>
                    </label>
                    <textarea
                      name="chamberAddress"
                      placeholder="Full chamber/clinic address..."
                      className="textarea textarea-bordered"
                      rows="3"
                      value={formData.chamberAddress}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">📸 Photo URL (Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="photoUrl"
                      placeholder="https://example.com/your-photo.jpg"
                      className="input input-bordered"
                      value={formData.photoUrl}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="card-actions justify-end mt-8">
                    <button 
                      type="submit" 
                      className={`btn btn-primary ${submitting ? 'loading' : ''}`}
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : doctorData ? '💾 Update Profile' : '🚀 Create Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
