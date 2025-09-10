'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import BackButton from '@/components/BackButton'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export default function AnalysisDetailPage({ params }) {
  const { currentUser, getToken } = useAuth()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const analysisId = use(params).id

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    
    if (analysisId) {
      fetchAnalysisDetail()
    }
  }, [currentUser, analysisId])

  const fetchAnalysisDetail = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalysis(data)
      } else {
        setError('Failed to load analysis details')
      }
    } catch (error) {
      console.error('Error fetching analysis:', error)
      setError('Failed to load analysis details')
    } finally {
      setLoading(false)
    }
  }

  const sendToChat = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}/send-to-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        fetchAnalysisDetail() // Refresh data
        alert('Analysis sent to chat successfully!')
      } else {
        alert('Failed to send analysis to chat')
      }
    } catch (error) {
      console.error('Error sending to chat:', error)
      alert('Failed to send analysis to chat')
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view analysis</h1>
          <a href="/auth/login" className="btn btn-primary">Login</a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4">Loading analysis details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navigation />
        <div className="container mx-auto p-4 max-w-4xl pt-20">
          <BackButton />
          <div className="alert alert-error">
            <span>{error || 'Analysis not found'}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navigation />
      
      <div className="container mx-auto p-4 max-w-4xl pt-20">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              📊 Analysis Details #{analysis.id}
            </h1>
            <p className="text-base-content/70">
              Detailed view of your prescription analysis
            </p>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="card bg-white shadow-xl border border-blue-100">
              <div className="card-body">
                <h2 className="card-title text-primary">📋 Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">📅 Analysis Date:</label>
                    <p>{new Date(analysis.analysisDate).toLocaleString('en-US')}</p>
                  </div>
                  {analysis.doctorName && (
                    <div>
                      <label className="font-semibold">👨‍⚕️ Doctor:</label>
                      <p>{analysis.doctorName}</p>
                    </div>
                  )}
                  {analysis.patientName && (
                    <div>
                      <label className="font-semibold">👤 Patient:</label>
                      <p>{analysis.patientName}</p>
                    </div>
                  )}
                  <div>
                    <label className="font-semibold">💬 Chat Status:</label>
                    <p>
                      {analysis.sentToChat ? (
                        <span className="badge badge-success">✅ Sent to Chat</span>
                      ) : (
                        <span className="badge badge-warning">⏳ Not Sent</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Diseases */}
            {analysis.keyDiseases && analysis.keyDiseases.length > 0 && (
              <div className="card bg-white shadow-xl border border-blue-100">
                <div className="card-body">
                  <h2 className="card-title text-primary">🔍 Key Diseases Identified</h2>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyDiseases.map((disease, index) => (
                      <span key={index} className="badge badge-primary badge-lg">
                        {disease}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medicines */}
            {analysis.medicines && analysis.medicines.length > 0 && (
              <div className="card bg-white shadow-xl border border-blue-100">
                <div className="card-body">
                  <h2 className="card-title text-primary">💊 Medicines</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysis.medicines.map((medicine, index) => (
                      <div key={index} className="p-3 bg-base-100 rounded-lg border">
                        <span className="font-medium">{medicine}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dosage Instructions */}
            {analysis.dosageInstructions && analysis.dosageInstructions.length > 0 && (
              <div className="card bg-white shadow-xl border border-blue-100">
                <div className="card-body">
                  <h2 className="card-title text-primary">📝 Dosage Instructions</h2>
                  <div className="space-y-2">
                    {analysis.dosageInstructions.map((instruction, index) => (
                      <div key={index} className="p-3 bg-base-100 rounded-lg border">
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Summary */}
            {analysis.analysisSummary && (
              <div className="card bg-white shadow-xl border border-blue-100">
                <div className="card-body">
                  <h2 className="card-title text-primary">📄 Analysis Summary</h2>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{analysis.analysisSummary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Prescription Text */}
            {analysis.fullPrescriptionText && (
              <div className="card bg-white shadow-xl border border-blue-100">
                <div className="card-body">
                  <h2 className="card-title text-primary">📋 Full Prescription Text</h2>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-base-100 p-4 rounded-lg">
                      {analysis.fullPrescriptionText}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="card bg-white shadow-xl border border-blue-100">
              <div className="card-body">
                <h2 className="card-title text-primary">⚡ Actions</h2>
                <div className="card-actions justify-center space-x-4">
                  {!analysis.sentToChat ? (
                    <button
                      onClick={sendToChat}
                      className="btn btn-primary"
                    >
                      💬 Send to Chat for Discussion
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push('/chat')}
                      className="btn btn-success"
                    >
                      💬 Go to Chat
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/analysis-history')}
                    className="btn btn-outline"
                  >
                    📋 View All Analyses
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
