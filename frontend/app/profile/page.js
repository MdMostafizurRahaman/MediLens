'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'

export default function ProfilePage() {
  const { currentUser, hasRole, getToken, logout } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    
    fetchProfileData()
  }, [currentUser])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
        
        // Populate form with existing data
        setFormData({
          firstName: data.firstName || currentUser?.firstName || '',
          lastName: data.lastName || currentUser?.lastName || '',
          email: data.email || currentUser?.email || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          bloodGroup: data.bloodGroup || '',
          emergencyContact: data.emergencyContact || '',
          medicalHistory: data.medicalHistory || '',
          allergies: data.allergies || '',
          currentMedications: data.currentMedications || ''
        })
      } else if (response.status === 404) {
        // Profile doesn't exist yet, use current user data
        setFormData({
          firstName: currentUser?.firstName || '',
          lastName: currentUser?.lastName || '',
          email: currentUser?.email || '',
          phoneNumber: '',
          address: '',
          dateOfBirth: '',
          gender: '',
          bloodGroup: '',
          emergencyContact: '',
          medicalHistory: '',
          allergies: '',
          currentMedications: ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      setError('Failed to load profile data')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const token = getToken()
      
      const isUpdate = profileData !== null
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/user/profile`
      const method = isUpdate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(isUpdate ? 'Profile updated successfully!' : 'Profile created successfully!')
        setIsEditing(false)
        await fetchProfileData() // Refresh data
      } else {
        const errorText = await response.text()
        setError(errorText || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setError('An error occurred while saving your profile')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your profile</h1>
          <a href="/auth/login" className="btn btn-primary">Login</a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navigation />
      
      <div className="container mx-auto p-4 max-w-4xl pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="avatar mb-4">
              <div className="w-24 rounded-full bg-primary flex items-center justify-center text-primary-content text-3xl font-bold">
                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              আপনার প্রোফাইল
            </h1>
            <p className="text-base-content/70">
              আপনার ব্যক্তিগত ও স্বাস্থ্য তথ্য পরিচালনা করুন
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="stat bg-primary text-primary-content rounded-lg">
              <div className="stat-figure">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div className="stat-title text-primary-content/80">অ্যাকাউন্ট স্ট্যাটাস</div>
              <div className="stat-value text-sm">
                {hasRole('doctor') ? '👨‍⚕️ ডাক্তার' : '👤 রোগী'}
              </div>
              <div className="stat-desc text-primary-content/60">
                {hasRole('doctor') ? 'ডাক্তার অ্যাকাউন্ট' : 'রোগী অ্যাকাউন্ট'}
              </div>
            </div>

            <div className="stat bg-secondary text-secondary-content rounded-lg">
              <div className="stat-figure">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path></svg>
              </div>
              <div className="stat-title text-secondary-content/80">শেষ আপডেট</div>
              <div className="stat-value text-sm">
                {profileData?.updatedAt ? new Date(profileData.updatedAt).toLocaleDateString('bn-BD') : 'নেই'}
              </div>
              <div className="stat-desc text-secondary-content/60">প্রোফাইল আপডেট</div>
            </div>

            <div className="stat bg-accent text-accent-content rounded-lg">
              <div className="stat-figure">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </div>
              <div className="stat-title text-accent-content/80">MediLens সদস্য</div>
              <div className="stat-value text-sm">২০২৫</div>
              <div className="stat-desc text-accent-content/60">যোগদানের সাল</div>
            </div>
          </div>

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

          {/* Profile Form */}
          <div className="card bg-gradient-to-br from-white to-blue-50 shadow-xl border border-blue-100">
            <div className="card-body">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  {isEditing ? '✏️ প্রোফাইল সম্পাদনা' : '📋 প্রোফাইল তথ্য'}
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary btn-sm"
                  >
                    ✏️ সম্পাদনা
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold text-lg flex items-center gap-2">
                        👤 <span>প্রথম নাম</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="আপনার প্রথম নাম"
                      className="input input-bordered focus:input-primary"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold text-lg flex items-center gap-2">
                        👤 <span>শেষ নাম</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="আপনার শেষ নাম"
                      className="input input-bordered focus:input-primary"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold text-lg flex items-center gap-2">
                        📧 <span>ইমেইল</span>
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="আপনার ইমেইল"
                      className="input input-bordered focus:input-primary"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold text-lg flex items-center gap-2">
                        📞 <span>ফোন নম্বর</span>
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="+880 1234567890"
                      className="input input-bordered focus:input-primary"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold text-lg flex items-center gap-2">
                        🎂 <span>জন্মতারিখ</span>
                      </span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="input input-bordered focus:input-primary"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold text-lg flex items-center gap-2">
                        ⚧️ <span>লিঙ্গ</span>
                      </span>
                    </label>
                    <select
                      name="gender"
                      className="select select-bordered focus:select-primary"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option value="male">পুরুষ</option>
                      <option value="female">মহিলা</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold text-lg flex items-center gap-2">
                        🩸 <span>রক্তের গ্রুপ</span>
                      </span>
                    </label>
                    <select
                      name="bloodGroup"
                      className="select select-bordered focus:select-primary"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold text-lg flex items-center gap-2">
                        🚨 <span>জরুরি যোগাযোগ</span>
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      placeholder="জরুরি পরিস্থিতিতে যোগাযোগের নম্বর"
                      className="input input-bordered focus:input-primary"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-lg flex items-center gap-2">
                      🏠 <span>ঠিকানা</span>
                    </span>
                  </label>
                  <textarea
                    name="address"
                    placeholder="আপনার সম্পূর্ণ ঠিকানা"
                    className="textarea textarea-bordered focus:textarea-primary h-24"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  ></textarea>
                </div>

                {/* Medical Information */}
                <div className="divider">
                  <span className="text-lg font-bold text-primary">🏥 স্বাস্থ্য তথ্য</span>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-lg flex items-center gap-2">
                      📋 <span>চিকিৎসা ইতিহাস</span>
                    </span>
                  </label>
                  <textarea
                    name="medicalHistory"
                    placeholder="আপনার পূর্ববর্তী রোগ, অপারেশন, বা গুরুত্বপূর্ণ চিকিৎসা ইতিহাস"
                    className="textarea textarea-bordered focus:textarea-primary h-32"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  ></textarea>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-lg flex items-center gap-2">
                      ⚠️ <span>এলার্জি</span>
                    </span>
                  </label>
                  <textarea
                    name="allergies"
                    placeholder="কোন খাবার, ওষুধ বা অন্য কিছুতে এলার্জি থাকলে উল্লেখ করুন"
                    className="textarea textarea-bordered focus:textarea-primary h-24"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  ></textarea>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-lg flex items-center gap-2">
                      💊 <span>বর্তমান ওষুধ</span>
                    </span>
                  </label>
                  <textarea
                    name="currentMedications"
                    placeholder="এখন যেসব ওষুধ সেবন করছেন সেগুলো উল্লেখ করুন"
                    className="textarea textarea-bordered focus:textarea-primary h-24"
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  ></textarea>
                </div>

                {isEditing && (
                  <div className="card-actions justify-center mt-8 space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        fetchProfileData() // Reset form
                      }}
                      className="btn btn-outline"
                    >
                      ❌ বাতিল
                    </button>
                    <button 
                      type="submit" 
                      className={`btn btn-primary ${submitting ? 'loading' : ''}`}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="loading loading-spinner"></span>
                          সেভ করা হচ্ছে...
                        </>
                      ) : (
                        <>
                          💾 সেভ করুন
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>

              {!isEditing && (
                <div className="card-actions justify-center mt-8 space-x-4">
                  {hasRole('doctor') && (
                    <button
                      onClick={() => router.push('/doctor-profile')}
                      className="btn btn-secondary"
                    >
                      👨‍⚕️ ডাক্তার প্রোফাইল
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="btn btn-error"
                  >
                    🚪 লগ আউট
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
