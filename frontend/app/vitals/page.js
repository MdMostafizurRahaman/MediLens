'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'

export default function VitalsPage() {
  const [vitals, setVitals] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    temperature: '',
    heartRate: '',
    oxygenSaturation: '',
    respiratoryRate: ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const { currentUser } = useAuth()

  const handleChange = (field, value) => {
    if (field === 'bloodPressure') {
      setVitals(prev => ({
        ...prev,
        bloodPressure: { ...prev.bloodPressure, ...value }
      }))
    } else {
      setVitals(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const analysis = analyzeVitals(vitals)
      setResult(analysis)
      setLoading(false)
    }, 1500)
  }

  const analyzeVitals = (vitals) => {
    let status = 'normal'
    let warnings = []
    let recommendations = []

    // Blood pressure analysis
    const systolic = parseInt(vitals.bloodPressure.systolic)
    const diastolic = parseInt(vitals.bloodPressure.diastolic)
    
    if (systolic > 140 || diastolic > 90) {
      status = 'high'
      warnings.push('উচ্চ রক্তচাপ')
      recommendations.push('লবণ কম খান, নিয়মিত ব্যায়াম করুন')
    } else if (systolic < 90 || diastolic < 60) {
      status = 'low'
      warnings.push('নিম্ন রক্তচাপ')
      recommendations.push('পর্যাপ্ত পানি পান করুন')
    }

    // Temperature analysis
    const temp = parseFloat(vitals.temperature)
    if (temp > 37.5) {
      status = 'fever'
      warnings.push('জ্বর')
      recommendations.push('প্যারাসিটামল খান, বিশ্রাম নিন')
    }

    // Heart rate analysis
    const hr = parseInt(vitals.heartRate)
    if (hr > 100) {
      warnings.push('দ্রুত হৃদস্পন্দন')
      recommendations.push('বিশ্রাম নিন, স্ট্রেস কমান')
    } else if (hr < 60) {
      warnings.push('ধীর হৃদস্পন্দন')
    }

    // Oxygen saturation analysis
    const spo2 = parseInt(vitals.oxygenSaturation)
    if (spo2 < 95) {
      status = 'critical'
      warnings.push('অক্সিজেনের মাত্রা কম')
      recommendations.push('তাৎক্ষণিক চিকিৎসকের পরামর্শ নিন')
    }

    return {
      status,
      warnings,
      recommendations,
      summary: warnings.length === 0 ? 'আপনার সকল চিহ্ন স্বাভাবিক রয়েছে' : `${warnings.length}টি বিষয়ে সতর্কতা প্রয়োজন`
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to check vital signs</h1>
          <a href="/auth/login" className="btn btn-primary">Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-primary mb-4">📊 Vital Signs</h1>
          <p className="text-lg text-base-content/70">
            Enter your vital signs to get health analysis in Bangla
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div 
            className="card bg-base-200 shadow-xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card-body">
              <h2 className="card-title text-primary">Enter Your Vital Signs</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Blood Pressure - Systolic</span>
                    </label>
                    <input
                      type="number"
                      placeholder="120"
                      className="input input-bordered"
                      value={vitals.bloodPressure.systolic}
                      onChange={(e) => handleChange('bloodPressure', { systolic: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Blood Pressure - Diastolic</span>
                    </label>
                    <input
                      type="number"
                      placeholder="80"
                      className="input input-bordered"
                      value={vitals.bloodPressure.diastolic}
                      onChange={(e) => handleChange('bloodPressure', { diastolic: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Body Temperature (°C)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="37.0"
                    className="input input-bordered"
                    value={vitals.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Heart Rate (BPM)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="72"
                    className="input input-bordered"
                    value={vitals.heartRate}
                    onChange={(e) => handleChange('heartRate', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Oxygen Saturation (SpO₂) %</span>
                  </label>
                  <input
                    type="number"
                    placeholder="98"
                    className="input input-bordered"
                    value={vitals.oxygenSaturation}
                    onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Respiratory Rate (per minute)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="16"
                    className="input input-bordered"
                    value={vitals.respiratoryRate}
                    onChange={(e) => handleChange('respiratoryRate', e.target.value)}
                  />
                </div>

                <div className="card-actions justify-end">
                  <button 
                    type="submit" 
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Vitals'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div 
            className="card bg-base-200 shadow-xl"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="card-body">
              <h2 className="card-title text-primary">Analysis Results</h2>
              
              {result ? (
                <div className="space-y-4">
                  <div className={`alert ${result.status === 'critical' ? 'alert-error' : result.status === 'high' || result.status === 'fever' ? 'alert-warning' : 'alert-success'}`}>
                    <div className="text-lg font-semibold">{result.summary}</div>
                  </div>

                  {result.warnings.length > 0 && (
                    <div className="card bg-base-100 shadow-sm">
                      <div className="card-body">
                        <h3 className="font-semibold text-warning">⚠️ Warnings:</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {result.warnings.map((warning, index) => (
                            <li key={index} className="text-sm">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {result.recommendations.length > 0 && (
                    <div className="card bg-base-100 shadow-sm">
                      <div className="card-body">
                        <h3 className="font-semibold text-info">💡 Recommendations:</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {result.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="card-actions justify-end">
                    <button className="btn btn-secondary">Save Report</button>
                    <button className="btn btn-accent">Share with Doctor</button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🩺</div>
                  <p className="text-base-content/70">
                    Enter your vital signs to see the analysis results here
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Reference Values */}
        <motion.div 
          className="mt-8 card bg-base-200 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="card-body">
            <h2 className="card-title text-primary">Normal Reference Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="stat bg-base-100 shadow-sm">
                <div className="stat-title">Blood Pressure</div>
                <div className="stat-value text-sm">120/80 mmHg</div>
                <div className="stat-desc">Normal range</div>
              </div>
              <div className="stat bg-base-100 shadow-sm">
                <div className="stat-title">Body Temperature</div>
                <div className="stat-value text-sm">36.5-37.5°C</div>
                <div className="stat-desc">Normal range</div>
              </div>
              <div className="stat bg-base-100 shadow-sm">
                <div className="stat-title">Heart Rate</div>
                <div className="stat-value text-sm">60-100 BPM</div>
                <div className="stat-desc">Resting rate</div>
              </div>
              <div className="stat bg-base-100 shadow-sm">
                <div className="stat-title">Oxygen Saturation</div>
                <div className="stat-value text-sm">95-100%</div>
                <div className="stat-desc">Normal range</div>
              </div>
              <div className="stat bg-base-100 shadow-sm">
                <div className="stat-title">Respiratory Rate</div>
                <div className="stat-value text-sm">12-20/min</div>
                <div className="stat-desc">Adult range</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
