'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  
  const { currentUser } = useAuth()

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
    'Gastroenterology'
  ]

  const locations = [
    'Dhaka',
    'Chittagong',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Rangpur',
    'Mymensingh'
  ]

  const doctors = [
    {
      id: 1,
      name: 'Dr. Mohammad Rahman',
      banglaName: 'ডাঃ মোহাম্মদ রহমান',
      specialty: 'Cardiology',
      specialtyBangla: 'হৃদরোগ বিশেষজ্ঞ',
      location: 'Dhaka',
      experience: '15 years',
      degree: 'MBBS, MD (Cardiology)',
      hospital: 'Dhaka Medical College Hospital',
      phone: '+880 1234567890',
      availability: 'Mon-Fri, 2-6 PM',
      rating: 4.8,
      image: '👨‍⚕️'
    },
    {
      id: 2,
      name: 'Dr. Fatima Khatun',
      banglaName: 'ডাঃ ফাতিমা খাতুন',
      specialty: 'Pediatrics',
      specialtyBangla: 'শিশুরোগ বিশেষজ্ঞ',
      location: 'Chittagong',
      experience: '12 years',
      degree: 'MBBS, MD (Pediatrics)',
      hospital: 'Chittagong Medical College Hospital',
      phone: '+880 1234567891',
      availability: 'Mon-Sat, 10 AM-2 PM',
      rating: 4.9,
      image: '👩‍⚕️'
    },
    {
      id: 3,
      name: 'Dr. Abdul Karim',
      banglaName: 'ডাঃ আব্দুল করিম',
      specialty: 'General Medicine',
      specialtyBangla: 'সাধারণ চিকিৎসক',
      location: 'Sylhet',
      experience: '20 years',
      degree: 'MBBS, FCPS (Medicine)',
      hospital: 'Sylhet MAG Osmani Medical College Hospital',
      phone: '+880 1234567892',
      availability: 'Daily, 5-9 PM',
      rating: 4.7,
      image: '👨‍⚕️'
    },
    {
      id: 4,
      name: 'Dr. Rashida Begum',
      banglaName: 'ডাঃ রশিদা বেগম',
      specialty: 'Gynecology',
      specialtyBangla: 'স্ত্রীরোগ বিশেষজ্ঞ',
      location: 'Dhaka',
      experience: '18 years',
      degree: 'MBBS, FCPS (Gynecology)',
      hospital: 'Dhaka Shishu Hospital',
      phone: '+880 1234567893',
      availability: 'Mon-Thu, 3-7 PM',
      rating: 4.6,
      image: '👩‍⚕️'
    },
    {
      id: 5,
      name: 'Dr. Aminul Islam',
      banglaName: 'ডাঃ আমিনুল ইসলাম',
      specialty: 'Orthopedics',
      specialtyBangla: 'অর্থোপেডিক্স বিশেষজ্ঞ',
      location: 'Rajshahi',
      experience: '14 years',
      degree: 'MBBS, MS (Orthopedics)',
      hospital: 'Rajshahi Medical College Hospital',
      phone: '+880 1234567894',
      availability: 'Tue-Sat, 4-8 PM',
      rating: 4.5,
      image: '👨‍⚕️'
    },
    {
      id: 6,
      name: 'Dr. Nasreen Akter',
      banglaName: 'ডাঃ নাসরিন আক্তার',
      specialty: 'Dermatology',
      specialtyBangla: 'চর্মরোগ বিশেষজ্ঞ',
      location: 'Khulna',
      experience: '10 years',
      degree: 'MBBS, MD (Dermatology)',
      hospital: 'Khulna Medical College Hospital',
      phone: '+880 1234567895',
      availability: 'Mon-Wed-Fri, 5-8 PM',
      rating: 4.4,
      image: '👩‍⚕️'
    }
  ]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.banglaName.includes(searchTerm)
    const matchesSpecialty = selectedSpecialty === '' || doctor.specialty === selectedSpecialty
    const matchesLocation = selectedLocation === '' || doctor.location === selectedLocation
    
    return matchesSearch && matchesSpecialty && matchesLocation
  })

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

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-primary mb-4">👨‍⚕️ Doctor Directory</h1>
          <p className="text-lg text-base-content/70">
            Find verified doctors in Bangladesh
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="card bg-base-200 shadow-xl mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Search Doctor</span>
                </label>
                <input
                  type="text"
                  placeholder="Search by name (English or Bangla)"
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
          </p>
        </motion.div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="card-body">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{doctor.image}</div>
                  <div>
                    <h3 className="card-title text-primary">{doctor.name}</h3>
                    <p className="text-accent font-medium">{doctor.banglaName}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Specialty:</span>
                    <span className="text-sm">{doctor.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">বিশেষত্ব:</span>
                    <span className="text-sm text-accent">{doctor.specialtyBangla}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Location:</span>
                    <span className="text-sm">{doctor.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Experience:</span>
                    <span className="text-sm">{doctor.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Degree:</span>
                    <span className="text-sm">{doctor.degree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Hospital:</span>
                    <span className="text-sm">{doctor.hospital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Available:</span>
                    <span className="text-sm">{doctor.availability}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Rating:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{doctor.rating}</span>
                      <div className="rating rating-sm">
                        {[...Array(5)].map((_, i) => (
                          <input
                            key={i}
                            type="radio"
                            className="mask mask-star-2 bg-orange-400"
                            checked={i < Math.floor(doctor.rating)}
                            readOnly
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="card-actions justify-between">
                  <a href={`tel:${doctor.phone}`} className="btn btn-primary btn-sm">
                    📞 Call
                  </a>
                  <button className="btn btn-secondary btn-sm">
                    📅 Book Appointment
                  </button>
                  <button className="btn btn-accent btn-sm">
                    ℹ️ More Info
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-xl text-base-content/70">
              No doctors found matching your criteria
            </p>
            <button 
              className="btn btn-primary mt-4"
              onClick={() => {
                setSearchTerm('')
                setSelectedSpecialty('')
                setSelectedLocation('')
              }}
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
