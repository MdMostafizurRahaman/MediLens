'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Pill, TestTube, AlertTriangle, MessageCircle, Eye, Trash2 } from 'lucide-react'
import DetailedAnalysisReportGenerator from './DetailedAnalysisReportGenerator'

const AnalysisHistory = () => {
  const [analyses, setAnalyses] = useState([])
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = () => {
    try {
      const stored = localStorage.getItem('medilens_analyses')
      if (stored) {
        const parsedAnalyses = JSON.parse(stored)
        setAnalyses(parsedAnalyses)
      }
    } catch (error) {
      console.error('Error loading analyses:', error)
    }
  }

  const deleteAnalysis = (analysisId) => {
    try {
      const filtered = analyses.filter(analysis => analysis.id !== analysisId)
      setAnalyses(filtered)
      localStorage.setItem('medilens_analyses', JSON.stringify(filtered))
      
      // Update latest analysis if it was deleted
      const latest = localStorage.getItem('medilens_latest_analysis')
      if (latest) {
        const latestParsed = JSON.parse(latest)
        if (latestParsed.id === analysisId) {
          if (filtered.length > 0) {
            localStorage.setItem('medilens_latest_analysis', JSON.stringify(filtered[0]))
          } else {
            localStorage.removeItem('medilens_latest_analysis')
          }
        }
      }
    } catch (error) {
      console.error('Error deleting analysis:', error)
    }
  }

  const sendToChat = async (analysis) => {
    // Create a summary for chat
    const chatSummary = `
📊 বিশ্লেষণের সারসংক্ষেপ (${analysis.date}):

${analysis.summary.shortDescription}

🏥 রোগ নির্ণয়: ${analysis.summary.condition || 'নির্দিষ্ট নেই'}
💊 ওষুধ: ${analysis.summary.medicines} টি
🔬 টেস্ট: ${analysis.summary.tests} টি

চিকিৎসা ইতিহাস:
${analysis.medicalHistory?.join(', ') || 'নির্দিষ্ট নেই'}

বর্তমান ওষুধ:
${analysis.currentMedications?.map(med => `• ${med.name} - ${med.frequency}`).join('\n') || 'নির্দিষ্ট নেই'}

এই বিশ্লেষণ নিয়ে আপনার কোনো প্রশ্ন আছে?
    `
    
    // Store for chat context
    localStorage.setItem('medilens_chat_context', JSON.stringify({
      type: 'analysis_discussion',
      analysis: analysis,
      summary: chatSummary,
      timestamp: new Date().toISOString()
    }))
    
    // Redirect to chat
    window.location.href = '/chat'
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          📊 বিশ্লেষণ ইতিহাস
        </h1>
        <p className="text-gray-600">
          আপনার সংরক্ষিত প্রেসক্রিপশন বিশ্লেষণসমূহ
        </p>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">কোনো বিশ্লেষণ পাওয়া যায়নি</h3>
          <p className="text-gray-500">প্রথমে একটি প্রেসক্রিপশন বিশ্লেষণ করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    📊 বিশ্লেষণ #{analysis.id.toString().slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(analysis.timestamp)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedAnalysis(analysis)
                      setShowModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="বিস্তারিত দেখুন"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAnalysis(analysis.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-4">
                {analysis.summary.condition && (
                  <div className="flex items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div className="text-red-600 mr-3">🏥</div>
                    <div>
                      <div className="text-sm text-red-700 font-medium">রোগ নির্ণয়</div>
                      <div className="text-red-800">{analysis.summary.condition}</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {analysis.summary.medicines > 0 && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <Pill className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <div className="text-sm text-green-700">ওষুধ</div>
                        <div className="font-medium text-green-800">{analysis.summary.medicines} টি</div>
                      </div>
                    </div>
                  )}

                  {analysis.summary.tests > 0 && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <TestTube className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm text-blue-700">টেস্ট</div>
                        <div className="font-medium text-blue-800">{analysis.summary.tests} টি</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => sendToChat(analysis)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  চ্যাটে আলোচনা
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for detailed view */}
      {showModal && selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  📊 বিশ্লেষণ বিস্তারিত #{selectedAnalysis.id.toString().slice(-6)}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">সারসংক্ষেপ</h3>
                  <p>{selectedAnalysis.summary.shortDescription}</p>
                </div>

                {/* Image Analysis Quality */}
                {selectedAnalysis.imageAnalysis && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">🔍 ছবি বিশ্লেষণ গুণমান</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><span className="font-medium">টেক্সট গুণমান:</span> {selectedAnalysis.imageAnalysis.textQuality}</div>
                      <div><span className="font-medium">পঠনযোগ্যতা:</span> {selectedAnalysis.imageAnalysis.readabilityScore}</div>
                      <div><span className="font-medium">ডকুমেন্ট ধরন:</span> {selectedAnalysis.imageAnalysis.documentType}</div>
                      <div><span className="font-medium">ভাষা:</span> {selectedAnalysis.imageAnalysis.language}</div>
                    </div>
                  </div>
                )}

                {/* Patient Information */}
                {selectedAnalysis.patientInformation && Object.keys(selectedAnalysis.patientInformation).some(key => selectedAnalysis.patientInformation[key]) && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">👤 রোগীর তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {Object.entries(selectedAnalysis.patientInformation).map(([key, value]) => 
                        value && (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Doctor Information */}
                {selectedAnalysis.doctorInformation && Object.keys(selectedAnalysis.doctorInformation).some(key => selectedAnalysis.doctorInformation[key]) && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">👨‍⚕️ চিকিৎসকের তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {Object.entries(selectedAnalysis.doctorInformation).map(([key, value]) => 
                        value && (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Primary Diagnosis */}
                {selectedAnalysis.primaryDiagnosis && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">🏥 প্রাথমিক রোগ নির্ণয়</h3>
                    <div className="space-y-2">
                      {selectedAnalysis.primaryDiagnosis.condition && (
                        <div><span className="font-medium">রোগ:</span> {selectedAnalysis.primaryDiagnosis.condition}</div>
                      )}
                      {selectedAnalysis.primaryDiagnosis.bangla && (
                        <div><span className="font-medium">বাংলায়:</span> {selectedAnalysis.primaryDiagnosis.bangla}</div>
                      )}
                      {selectedAnalysis.primaryDiagnosis.severity && (
                        <div><span className="font-medium">তীব্রতা:</span> {selectedAnalysis.primaryDiagnosis.severity}</div>
                      )}
                      {selectedAnalysis.primaryDiagnosis.description && (
                        <div className="mt-2">
                          <span className="font-medium">বিস্তারিত:</span>
                          <p className="mt-1 text-sm text-gray-700">{selectedAnalysis.primaryDiagnosis.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medications */}
                {selectedAnalysis.medications && selectedAnalysis.medications.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">💊 ওষুধের তালিকা</h3>
                    <div className="space-y-3">
                      {selectedAnalysis.medications.map((med, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div><span className="font-medium">নাম:</span> {med.prescribedName || med.genericName || med.name}</div>
                            {med.bangla && <div><span className="font-medium">বাংলায়:</span> {med.bangla}</div>}
                            {med.strength && <div><span className="font-medium">শক্তি:</span> {med.strength}</div>}
                            {med.frequency && <div><span className="font-medium">সেবনবিধি:</span> {med.frequency}</div>}
                            {med.duration && <div><span className="font-medium">মেয়াদ:</span> {med.duration}</div>}
                            {med.purpose && <div><span className="font-medium">কাজ:</span> {med.purpose}</div>}
                          </div>
                          {med.instructions && (
                            <div className="mt-2 p-2 bg-blue-50 rounded">
                              <span className="font-medium">নির্দেশনা:</span> {med.instructions}
                            </div>
                          )}
                          {med.sideEffects && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded">
                              <span className="font-medium">পার্শ্বপ্রতিক্রিয়া:</span> {med.sideEffects}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Investigations */}
                {selectedAnalysis.investigations && selectedAnalysis.investigations.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">🧪 পরীক্ষা-নিরীক্ষা</h3>
                    <div className="space-y-3">
                      {selectedAnalysis.investigations.map((test, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">পরীক্ষা:</span> {test.test}</div>
                            {test.bangla && <div><span className="font-medium">বাংলায়:</span> {test.bangla}</div>}
                            {test.purpose && (
                              <div>
                                <span className="font-medium">উদ্দেশ্য:</span>
                                <p className="mt-1 text-gray-700">{test.purpose}</p>
                              </div>
                            )}
                            {test.urgency && <div><span className="font-medium">জরুরিত্ব:</span> {test.urgency}</div>}
                            {test.normalRange && <div><span className="font-medium">স্বাভাবিক মাত্রা:</span> {test.normalRange}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical Advice */}
                {selectedAnalysis.medicalAdvice && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">👨‍⚕️ চিকিৎসা পরামর্শ</h3>
                    <div className="space-y-3">
                      {selectedAnalysis.medicalAdvice.banglaReport && (
                        <div>
                          <h4 className="font-medium mb-2">সামগ্রিক পরামর্শ:</h4>
                          <div className="bg-white p-3 rounded border">
                            <pre className="whitespace-pre-wrap text-sm">{selectedAnalysis.medicalAdvice.banglaReport}</pre>
                          </div>
                        </div>
                      )}
                      
                      {selectedAnalysis.medicalAdvice.dietaryGuidance && (
                        <div>
                          <h4 className="font-medium mb-2">খাদ্যাভ্যাস:</h4>
                          <div className="bg-white p-3 rounded border text-sm">
                            {selectedAnalysis.medicalAdvice.dietaryGuidance}
                          </div>
                        </div>
                      )}

                      {selectedAnalysis.medicalAdvice.exerciseRecommendations && (
                        <div>
                          <h4 className="font-medium mb-2">ব্যায়াম:</h4>
                          <div className="bg-white p-3 rounded border text-sm">
                            {selectedAnalysis.medicalAdvice.exerciseRecommendations}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Safety Warnings */}
                {selectedAnalysis.safetyWarnings && selectedAnalysis.safetyWarnings.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-red-800">⚠️ গুরুত্বপূর্ণ সতর্কতা</h3>
                    <ul className="space-y-2">
                      {selectedAnalysis.safetyWarnings.map((warning, index) => (
                        <li key={index} className="flex items-start">
                          <AlertTriangle className="w-4 h-4 mr-2 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cost Analysis */}
                {selectedAnalysis.costAnalysis && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">💰 খরচ বিশ্লেষণ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {Object.entries(selectedAnalysis.costAnalysis).map(([key, value]) => 
                        value && (
                          <div key={key} className="bg-white p-2 rounded">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Quality Metrics */}
                {selectedAnalysis.qualityMetrics && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">📊 বিশ্লেষণের গুণমান</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {Object.entries(selectedAnalysis.qualityMetrics).map(([key, value]) => (
                        <div key={key} className="bg-white p-2 rounded">
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical History */}
                {selectedAnalysis.medicalHistory?.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">চিকিৎসা ইতিহাস</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedAnalysis.medicalHistory.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Current Medications */}
                {selectedAnalysis.currentMedications?.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">বর্তমান ওষুধ</h3>
                    <div className="space-y-2">
                      {selectedAnalysis.currentMedications.map((med, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-medium">{med.name}</div>
                          {med.bangla && <div className="text-sm text-gray-600">বাংলা: {med.bangla}</div>}
                          <div className="text-sm text-gray-600">
                            {med.strength} • {med.frequency} • {med.duration}
                          </div>
                          {med.purpose && <div className="text-sm text-blue-600">{med.purpose}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {selectedAnalysis.allergies?.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-yellow-800">⚠️ অ্যালার্জি</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedAnalysis.allergies.map((allergy, index) => (
                        <li key={index} className="text-yellow-700">{allergy}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center mt-6">
                  <DetailedAnalysisReportGenerator analysis={selectedAnalysis} />
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => sendToChat(selectedAnalysis)}
                      className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      চ্যাটে আলোচনা করুন
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisHistory
