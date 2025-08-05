'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { currentUser, getToken } = useAuth()
  const router = useRouter()

  const specialties = [
    'General Medicine',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Gynecology',
    'Dermatology',
    'Psychiatry',
    'Endocrinology',
    'Gastroenterology',
    'Urology',
    'Nephrology',
    'Pulmonology',
    'Oncology'
  ]

  const locations = [
    'Dhaka',
    'Chittagong',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Rangpur',
    'Mymensingh',
    'Comilla',
    'Narayanganj'
  ]

  useEffect(() => {
    if (currentUser) {
      fetchDoctors()
    }
  }, [currentUser])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/doctor/all`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const doctorsData = await response.json()
        // Filter only active doctors
        const activeDoctors = doctorsData.filter(doctor => doctor.status === 'ACTIVE')
        setDoctors(activeDoctors)
      } else {
        setError('Failed to fetch doctors')
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setError('Error loading doctors')
    } finally {
      setLoading(false)
    }
  }

  const formatSpecializations = (specializations) => {
    if (!specializations || specializations.length === 0) return 'General Medicine'
    return specializations.join(', ')
  }

  const formatDegrees = (degrees) => {
    if (!degrees || degrees.length === 0) return 'MBBS'
    return degrees.join(', ')
  }

  const formatPhoneNumbers = (phoneNumbers) => {
    if (!phoneNumbers || phoneNumbers.length === 0) return 'Not available'
    return phoneNumbers[0] // Show first phone number
  }

  const getLocationFromAddress = (chamberAddress) => {
    if (!chamberAddress) return 'Bangladesh'
    
    // Extract city from address
    const cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh']
    for (const city of cities) {
      if (chamberAddress.toLowerCase().includes(city.toLowerCase())) {
        return city
      }
    }
    return 'Bangladesh'
  }

  const filteredDoctors = doctors.filter(doctor => {
    const doctorName = `${doctor.user?.firstName || ''} ${doctor.user?.lastName || ''}`.toLowerCase()
    const specializations = formatSpecializations(doctor.specialization).toLowerCase()
    const location = getLocationFromAddress(doctor.chamberAddress)
    
    const matchesSearch = searchTerm === '' || 
                         doctorName.includes(searchTerm.toLowerCase()) ||
                         specializations.includes(searchTerm.toLowerCase())
    
    const matchesSpecialty = selectedSpecialty === '' || 
                            (doctor.specialization && doctor.specialization.some(spec => 
                              spec.toLowerCase().includes(selectedSpecialty.toLowerCase())
                            ))
    
    const matchesLocation = selectedLocation === '' || 
                           location.toLowerCase().includes(selectedLocation.toLowerCase())
    
    return matchesSearch && matchesSpecialty && matchesLocation
  })

  const getDoctorRating = () => {
    // Random rating between 4.0 to 5.0 for demo purposes
    return (4.0 + Math.random()).toFixed(1)
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to find doctors</h1>
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
          <p className="mt-4">Loading doctors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.back()} 
              className="btn btn-ghost btn-circle"
            >
              ← Back
            </button>
            <div></div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">👨‍⚕️ Doctor Directory</h1>
          <p className="text-lg text-base-content/70">
            Find verified doctors in Bangladesh
          </p>
          <div className="badge badge-success mt-2">
            ✅ {doctors.length} Verified Doctors Available
          </div>
        </motion.div>

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
            <button onClick={fetchDoctors} className="btn btn-sm">
              Retry
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <motion.div 
          className="card bg-base-200 shadow-xl mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="card-body">
            <h2 className="card-title mb-4">🔍 Find Your Doctor</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Search Doctor</span>
                </label>
                <input
                  type="text"
                  placeholder="Search by name or specialization"
                  className="input input-bordered"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Specialty</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <option value="">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {(searchTerm || selectedSpecialty || selectedLocation) && (
              <div className="mt-4">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedSpecialty('')
                    setSelectedLocation('')
                  }}
                >
                  🗑️ Clear Filters
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-base-content/70">
            Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            {(searchTerm || selectedSpecialty || selectedLocation) && ' matching your criteria'}
          </p>
        </motion.div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="card-body">
                <div className="flex items-center gap-4 mb-4">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-content text-2xl">
                      {doctor.photoUrl ? (
                        <img 
                          src={doctor.photoUrl} 
                          alt={`Dr. ${doctor.user?.firstName}`}
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={doctor.photoUrl ? 'hidden' : 'flex'}>
                        👨‍⚕️
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="card-title text-primary text-lg">
                      Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                    </h3>
                    <p className="text-secondary text-sm">{doctor.designation || 'Medical Doctor'}</p>
                    <div className="badge badge-success badge-sm mt-1">✅ Verified</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-accent">🏥 Specialization:</span>
                    <span className="flex-1">{formatSpecializations(doctor.specialization)}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-accent">🎓 Degrees:</span>
                    <span className="flex-1">{formatDegrees(doctor.degree)}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-accent">🏢 Institute:</span>
                    <span className="flex-1">{doctor.institute || 'Private Practice'}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-accent">📍 Location:</span>
                    <span className="flex-1">{getLocationFromAddress(doctor.chamberAddress)}</span>
                  </div>
                  
                  {doctor.availableTime && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-accent">🕒 Available:</span>
                      <span className="flex-1">{doctor.availableTime}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-accent">⭐ Rating:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">{getDoctorRating()}</span>
                      <div className="rating rating-sm">
                        {[...Array(5)].map((_, i) => (
                          <input
                            key={i}
                            type="radio"
                            className="mask mask-star-2 bg-orange-400"
                            checked={i < 4}
                            readOnly
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {doctor.chamberAddress && (
                  <div className="mt-3 p-2 bg-base-100 rounded">
                    <p className="text-xs text-base-content/70">
                      <span className="font-medium">Chamber:</span> {doctor.chamberAddress}
                    </p>
                  </div>
                )}

                <div className="divider my-4"></div>

                <div className="card-actions justify-between">
                  {formatPhoneNumbers(doctor.phoneNumber) !== 'Not available' && (
                    <a 
                      href={`tel:${formatPhoneNumbers(doctor.phoneNumber)}`} 
                      className="btn btn-primary btn-sm flex-1"
                    >
                      📞 Call
                    </a>
                  )}
                  
                  <button 
                    className="btn btn-secondary btn-sm flex-1"
                    onClick={() => alert('Appointment booking feature coming soon!')}
                  >
                    📅 Book
                  </button>
                  
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                      ⋮
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                      <li>
                        <button onClick={() => alert('Profile details feature coming soon!')}>
                          👁️ View Details
                        </button>
                      </li>
                      <li>
                        <button onClick={() => alert('Review feature coming soon!')}>
                          ⭐ Write Review
                        </button>
                      </li>
                      <li>
                        <a href="/chat">💬 Ask AI About This Doctor</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDoctors.length === 0 && !loading && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No doctors found</h3>
            <p className="text-base-content/70 mb-4">
              {searchTerm || selectedSpecialty || selectedLocation 
                ? 'Try adjusting your search criteria'
                : 'No doctors are currently available in our directory'
              }
            </p>
            {(searchTerm || selectedSpecialty || selectedLocation) && (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedSpecialty('')
                  setSelectedLocation('')
                }}
              >
                🗑️ Clear All Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div 
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <a href="/upload" className="card bg-primary text-primary-content shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body text-center">
              <h3 className="card-title justify-center">📋 Upload Prescription</h3>
              <p>Get your prescription analyzed</p>
            </div>
          </a>
          <a href="/chat" className="card bg-secondary text-secondary-content shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body text-center">
              <h3 className="card-title justify-center">💬 AI Health Assistant</h3>
              <p>Ask health questions in Bangla</p>
            </div>
          </a>
          <a href="/vitals" className="card bg-accent text-accent-content shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body text-center">
              <h3 className="card-title justify-center">🩺 Check Vitals</h3>
              <p>Monitor your health parameters</p>
            </div>
          </a>
        </motion.div>
      </div>
    </div>
  )
}
