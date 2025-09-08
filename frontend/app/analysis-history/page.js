'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import AnalysisHistory from '@/components/AnalysisHistory'

export default function AnalysisHistoryPage() {
  const { currentUser, getToken } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [localAnalyses, setLocalAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Load local analyses first (for non-logged users)
    loadLocalAnalyses()
    
    // If user is logged in, also fetch from server
    if (currentUser) {
      fetchAnalyses()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const loadLocalAnalyses = () => {
    try {
      const stored = localStorage.getItem('medilens_analyses')
      if (stored) {
        const parsedAnalyses = JSON.parse(stored)
        setLocalAnalyses(parsedAnalyses)
      }
    } catch (error) {
      console.error('Error loading local analyses:', error)
    }
  }

  const fetchAnalyses = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/analysis/my-analyses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data)
      } else {
        setError('Failed to load analysis history from server')
      }
    } catch (error) {
      console.error('Error fetching analyses:', error)
      setError('Failed to load analysis history from server')
    } finally {
      setLoading(false)
    }
  }

  const sendToChat = async (analysisId) => {
    try {
      const token = getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/analysis/${analysisId}/send-to-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Refresh the analyses list
        fetchAnalyses()
        alert('✅ বিশ্লেষণ চ্যাটে পাঠানো হয়েছে!')
      } else {
        alert('❌ চ্যাটে পাঠাতে সমস্যা হয়েছে')
      }
    } catch (error) {
      console.error('Error sending to chat:', error)
      alert('❌ চ্যাটে পাঠাতে সমস্যা হয়েছে')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="pt-20">
        {/* Show localStorage analyses for all users */}
        {localAnalyses.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-2">
                💾 স্থানীয় সংরক্ষিত বিশ্লেষণ
              </h2>
              <p className="text-gray-600">
                আপনার ডিভাইসে সংরক্ষিত প্রেসক্রিপশন বিশ্লেষণসমূহ
              </p>
            </div>
            <AnalysisHistory />
          </div>
        )}

        {/* Show server analyses only for logged users */}
        {currentUser && (
          <div className="container mx-auto p-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-2">
                  ☁️ সার্ভার সংরক্ষিত বিশ্লেষণ
                </h1>
                <p className="text-gray-600">
                  আপনার অ্যাকাউন্টে সংরক্ষিত প্রেসক্রিপশন বিশ্লেষণসমূহ
                </p>
              </div>

              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">লোড হচ্ছে...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {!loading && analyses.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-700">কোনো সার্ভার বিশ্লেষণ পাওয়া যায়নি</h2>
                  <p className="text-gray-600 mb-4">আপনি এখনও কোনো প্রেসক্রিপশন বিশ্লেষণ করেননি।</p>
                  <a href="/google-lens-test" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    📸 প্রথম প্রেসক্রিপশন বিশ্লেষণ করুন
                  </a>
                </div>
              )}

              {!loading && analyses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyses.map((analysis) => (
                    <div key={analysis.id} className="bg-white rounded-lg shadow-lg border border-blue-100 p-6">
                      <h2 className="text-xl font-bold text-blue-800 mb-4">
                        📊 বিশ্লেষণ #{analysis.id}
                      </h2>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">📅 তারিখ:</span>
                          <span className="text-sm text-gray-600">{new Date(analysis.analysisDate).toLocaleDateString('bn-BD')}</span>
                        </div>
                        
                        {analysis.doctorName && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">👨‍⚕️ ডাক্তার:</span>
                            <span className="text-sm text-gray-600">{analysis.doctorName}</span>
                          </div>
                        )}
                        
                        {analysis.keyDiseases && analysis.keyDiseases.length > 0 && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700">🔍 মূল রোগসমূহ:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {analysis.keyDiseases.slice(0, 3).map((disease, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {disease}
                                </span>
                              ))}
                              {analysis.keyDiseases.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  +{analysis.keyDiseases.length - 3} আরও
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {analysis.medicines && analysis.medicines.length > 0 && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700">💊 ওষুধসমূহ:</span>
                            <div className="text-sm text-gray-600">
                              {analysis.medicines.length} টি ওষুধ পাওয়া গেছে
                            </div>
                          </div>
                        )}

                        {analysis.bengaliSummary && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="text-sm font-semibold text-blue-800">📋 সারসংক্ষেপ:</span>
                            <p className="text-sm text-blue-700 mt-1">{analysis.bengaliSummary}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between mt-6">
                        <button
                          onClick={() => router.push(`/analysis/${analysis.id}`)}
                          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          👁️ বিস্তারিত দেখুন
                        </button>
                        
                        {!analysis.sentToChat ? (
                          <button
                            onClick={() => sendToChat(analysis.id)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            💬 চ্যাটে পাঠান
                          </button>
                        ) : (
                          <span className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                            ✅ চ্যাটে পাঠানো হয়েছে
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Login prompt for non-logged users */}
        {!currentUser && localAnalyses.length === 0 && (
          <div className="container mx-auto p-4 max-w-4xl text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-blue-800 mb-4">
                📋 বিশ্লেষণ ইতিহাস
              </h1>
              <p className="text-gray-600 mb-6">
                আপনার প্রেসক্রিপশন বিশ্লেষণের ইতিহাস দেখতে এবং সংরক্ষণ করতে লগইন করুন।
              </p>
              <div className="space-y-4">
                <a 
                  href="/auth/login" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔐 লগইন করুন
                </a>
                <p className="text-sm text-gray-500">
                  অথবা <a href="/google-lens-test" className="text-blue-600 hover:underline">প্রথমে একটি প্রেসক্রিপশন বিশ্লেষণ করুন</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
