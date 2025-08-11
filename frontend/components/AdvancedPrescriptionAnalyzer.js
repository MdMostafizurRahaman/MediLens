'use client'

import React, { useState, useRef } from 'react'
import { Camera, Upload, FileText, Loader2, CheckCircle, AlertCircle, Download, Eye, Brain } from 'lucide-react'

const AdvancedPrescriptionAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [analysisMethod, setAnalysisMethod] = useState('enhanced-medical') // Default to Enhanced Medical
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setError(null)
      setAnalysis(null)
      setExtractedText('')
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setError('দয়া করে একটি ছবি ফাইল নির্বাচন করুন।')
    }
  }

  const analyzePrescription = async () => {
    if (!selectedFile) {
      setError('প্রথমে একটি প্রেসক্রিপশনের ছবি নির্বাচন করুন।')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      let apiEndpoint = ''
      let methodName = ''

      switch (analysisMethod) {
        case 'enhanced-medical':
          apiEndpoint = '/api/enhanced-medical-analysis'
          methodName = 'Enhanced Medical AI'
          break
        case 'gemini-vision':
          apiEndpoint = '/api/gemini-vision-prescription'
          methodName = 'Gemini Vision AI'
          break
        case 'google-lens':
          apiEndpoint = '/api/google-lens-prescription'
          methodName = 'Google Lens API'
          break
        default:
          apiEndpoint = '/api/enhanced-medical-analysis'
          methodName = 'Enhanced Medical AI'
      }

      console.log(`🚀 Starting ${methodName} prescription analysis...`)
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setExtractedText(result.extractedText || result.analysis?.extractedText || '')
        setAnalysis(result.analysis)
        console.log(`✅ ${methodName} analysis completed successfully`)
      } else {
        // If Google Lens fails, try Enhanced Medical as fallback
        if (analysisMethod === 'google-lens') {
          console.log('🔄 Google Lens failed, trying Enhanced Medical AI...')
          setAnalysisMethod('enhanced-medical')
          
          const fallbackResponse = await fetch('/api/enhanced-medical-analysis', {
            method: 'POST',
            body: formData
          })
          
          const fallbackResult = await fallbackResponse.json()
          
          if (fallbackResult.success) {
            setExtractedText(fallbackResult.analysis?.extractedText || '')
            setAnalysis(fallbackResult.analysis)
            console.log('✅ Fallback Enhanced Medical analysis successful')
          } else {
            setError(`সব পদ্ধতিতে সমস্যা: ${result.error}`)
          }
        } else {
          setError(`বিশ্লেষণে সমস্যা: ${result.error}`)
        }
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('নেটওয়ার্ক সমস্যা বা সার্ভার ত্রুটি। আবার চেষ্টা করুন।')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalyzer = () => {
    setSelectedFile(null)
    setPreview(null)
    setAnalysis(null)
    setError(null)
    setExtractedText('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const downloadReport = () => {
    if (!analysis) return

    const reportData = {
      timestamp: new Date().toISOString(),
      analysisMethod: analysisMethod,
      imageAnalysis: analysis.imageAnalysis,
      extractedText: extractedText,
      patientInfo: analysis.patientInformation,
      doctorInfo: analysis.doctorInformation,
      diagnosis: analysis.primaryDiagnosis,
      medications: analysis.medications,
      investigations: analysis.investigations,
      medicalAdvice: analysis.medicalAdvice,
      safetyWarnings: analysis.safetyWarnings,
      costAnalysis: analysis.costAnalysis
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prescription-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          🔬 Advanced Prescription Analyzer
        </h1>
        <p className="text-gray-600">
          Google Lens API + Gemini Vision AI দিয়ে প্রেসক্রিপশন বিশ্লেষণ
        </p>
      </div>

      {/* Analysis Method Selection */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">বিশ্লেষণ পদ্ধতি নির্বাচন করুন:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
            analysisMethod === 'enhanced-medical' 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="analysisMethod"
              value="enhanced-medical"
              checked={analysisMethod === 'enhanced-medical'}
              onChange={(e) => setAnalysisMethod(e.target.value)}
              className="mr-3"
            />
            <div className="flex items-center">
              <Brain className="w-6 h-6 mr-3 text-purple-600" />
              <div>
                <div className="font-semibold text-purple-800">Enhanced Medical AI</div>
                <div className="text-sm text-gray-600">Knowledge Base + Gemini Vision (সেরা)</div>
              </div>
            </div>
          </label>

          <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
            analysisMethod === 'gemini-vision' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="analysisMethod"
              value="gemini-vision"
              checked={analysisMethod === 'gemini-vision'}
              onChange={(e) => setAnalysisMethod(e.target.value)}
              className="mr-3"
            />
            <div className="flex items-center">
              <Brain className="w-6 h-6 mr-3 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-800">Gemini Vision AI</div>
                <div className="text-sm text-gray-600">সরাসরি ছবি বিশ্লেষণ + চিকিৎসা পরামর্শ</div>
              </div>
            </div>
          </label>

          <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
            analysisMethod === 'google-lens' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="analysisMethod"
              value="google-lens"
              checked={analysisMethod === 'google-lens'}
              onChange={(e) => setAnalysisMethod(e.target.value)}
              className="mr-3"
            />
            <div className="flex items-center">
              <Eye className="w-6 h-6 mr-3 text-green-600" />
              <div>
                <div className="font-semibold text-green-800">Google Lens API</div>
                <div className="text-sm text-gray-600">OCR + Fine-tuned Model (পরীক্ষামূলক)</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Selected prescription"
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
              <div className="flex justify-center space-x-4">
                <button
                  onClick={analyzePrescription}
                  disabled={isAnalyzing}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      বিশ্লেষণ করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      {analysisMethod === 'enhanced-medical' ? 'Enhanced Medical AI' : 
                       analysisMethod === 'gemini-vision' ? 'Gemini Vision' : 'Google Lens'} দিয়ে বিশ্লেষণ
                    </>
                  )}
                </button>
                <button
                  onClick={resetAnalyzer}
                  className="flex items-center px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  নতুন ছবি
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileText className="w-16 h-16 mx-auto text-blue-400" />
              <h3 className="text-xl font-semibold text-gray-700">
                প্রেসক্রিপশনের ছবি আপলোড করুন
              </h3>
              <p className="text-gray-500">
                উন্নত AI প্রযুক্তির মাধ্যমে স্বয়ংক্রিয় বিশ্লেষণ
              </p>
              <div className="flex justify-center space-x-4">
                <label className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                  <Upload className="w-5 h-5 mr-2" />
                  ফাইল নির্বাচন
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <label className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700">
                  <Camera className="w-5 h-5 mr-2" />
                  ক্যামেরা
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">ত্রুটি: {error}</span>
          </div>
        </div>
      )}

      {/* Extracted Text Display */}
      {extractedText && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            📄 এক্সট্রাক্ট করা টেক্সট:
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {extractedText}
            </pre>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Header with download */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2" />
              বিশ্লেষণ সম্পন্ন ({analysisMethod === 'enhanced-medical' ? 'Enhanced Medical AI' : 
                              analysisMethod === 'gemini-vision' ? 'Gemini Vision' : 'Google Lens'})
            </h2>
            <button
              onClick={downloadReport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              রিপোর্ট ডাউনলোড
            </button>
          </div>

          {/* Image Analysis Quality */}
          {analysis.imageAnalysis && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">🔍 ছবি বিশ্লেষণ গুণমান:</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">টেক্সট গুণমান:</span> {analysis.imageAnalysis.textQuality}
                </div>
                <div>
                  <span className="font-medium">পঠনযোগ্যতা:</span> {analysis.imageAnalysis.readabilityScore}
                </div>
                <div>
                  <span className="font-medium">ডকুমেন্ট ধরন:</span> {analysis.imageAnalysis.documentType}
                </div>
                <div>
                  <span className="font-medium">ভাষা:</span> {analysis.imageAnalysis.language}
                </div>
              </div>
            </div>
          )}

          {/* Patient Information */}
          {analysis.patientInformation && Object.keys(analysis.patientInformation).some(key => analysis.patientInformation[key]) && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3">👤 রোগীর তথ্য:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {Object.entries(analysis.patientInformation).map(([key, value]) => 
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
          {analysis.doctorInformation && Object.keys(analysis.doctorInformation).some(key => analysis.doctorInformation[key]) && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-3">👨‍⚕️ চিকিৎসকের তথ্য:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {Object.entries(analysis.doctorInformation).map(([key, value]) => 
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
          {analysis.primaryDiagnosis && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-3">🏥 প্রাথমিক রোগ নির্ণয়:</h3>
              <div className="space-y-2">
                <div><span className="font-medium">রোগ:</span> {analysis.primaryDiagnosis.condition}</div>
                {analysis.primaryDiagnosis.bangla && (
                  <div><span className="font-medium">বাংলায়:</span> {analysis.primaryDiagnosis.bangla}</div>
                )}
                {analysis.primaryDiagnosis.severity && (
                  <div><span className="font-medium">তীব্রতা:</span> {analysis.primaryDiagnosis.severity}</div>
                )}
                {analysis.primaryDiagnosis.description && (
                  <div className="mt-2">
                    <span className="font-medium">বিস্তারিত:</span>
                    <p className="mt-1">{analysis.primaryDiagnosis.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medications */}
          {analysis.medications && analysis.medications.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">💊 ওষুধের তালিকা:</h3>
              <div className="space-y-4">
                {analysis.medications.map((med, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">নাম:</span> {med.prescribedName || med.genericName}</div>
                      {med.bangla && <div><span className="font-medium">বাংলায়:</span> {med.bangla}</div>}
                      {med.strength && <div><span className="font-medium">শক্তি:</span> {med.strength}</div>}
                      {med.frequency && <div><span className="font-medium">সেবনবিধি:</span> {med.frequency}</div>}
                      {med.duration && <div><span className="font-medium">মেয়াদ:</span> {med.duration}</div>}
                      {med.purpose && <div><span className="font-medium">কাজ:</span> {med.purpose}</div>}
                      {med.cost && <div><span className="font-medium">খরচ:</span> {med.cost}</div>}
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
                    {med.alternatives && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">বিকল্প:</span> {med.alternatives}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investigations */}
          {analysis.investigations && analysis.investigations.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-3">🧪 পরীক্ষা-নিরীক্ষা:</h3>
              <div className="space-y-3">
                {analysis.investigations.map((test, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">পরীক্ষা:</span> {test.test}</div>
                      {test.bangla && <div><span className="font-medium">বাংলায়:</span> {test.bangla}</div>}
                      {test.purpose && <div><span className="font-medium">উদ্দেশ্য:</span> {test.purpose}</div>}
                      {test.urgency && <div><span className="font-medium">জরুরিত্ব:</span> {test.urgency}</div>}
                      {test.cost && <div><span className="font-medium">খরচ:</span> {test.cost}</div>}
                      {test.normalRange && <div><span className="font-medium">স্বাভাবিক মাত্রা:</span> {test.normalRange}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Advice */}
          {analysis.medicalAdvice && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-3">👨‍⚕️ চিকিৎসা পরামর্শ:</h3>
              <div className="space-y-3">
                {analysis.medicalAdvice.banglaReport && (
                  <div>
                    <h4 className="font-medium mb-2">সামগ্রিক পরামর্শ:</h4>
                    <div className="bg-white p-3 rounded border">
                      <pre className="whitespace-pre-wrap text-sm">{analysis.medicalAdvice.banglaReport}</pre>
                    </div>
                  </div>
                )}
                
                {analysis.medicalAdvice.dietaryGuidance && (
                  <div>
                    <h4 className="font-medium mb-2">খাদ্যাভ্যাস:</h4>
                    <div className="bg-white p-3 rounded border text-sm">
                      {analysis.medicalAdvice.dietaryGuidance}
                    </div>
                  </div>
                )}

                {analysis.medicalAdvice.exerciseRecommendations && (
                  <div>
                    <h4 className="font-medium mb-2">ব্যায়াম:</h4>
                    <div className="bg-white p-3 rounded border text-sm">
                      {analysis.medicalAdvice.exerciseRecommendations}
                    </div>
                  </div>
                )}

                {analysis.medicalAdvice.followUpPlan && (
                  <div>
                    <h4 className="font-medium mb-2">ফলো-আপ:</h4>
                    <div className="bg-white p-3 rounded border text-sm">
                      {analysis.medicalAdvice.followUpPlan}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Safety Warnings */}
          {analysis.safetyWarnings && analysis.safetyWarnings.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-3">⚠️ গুরুত্বপূর্ণ সতর্কতা:</h3>
              <ul className="space-y-2">
                {analysis.safetyWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cost Analysis */}
          {analysis.costAnalysis && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">💰 খরচ বিশ্লেষণ:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {Object.entries(analysis.costAnalysis).map(([key, value]) => 
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
          {analysis.qualityMetrics && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">📊 বিশ্লেষণের গুণমান:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {Object.entries(analysis.qualityMetrics).map(([key, value]) => (
                  <div key={key} className="bg-white p-2 rounded">
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          🔬 Powered by {analysisMethod === 'gemini-vision' ? 'Gemini Vision AI' : 'Google Lens API'} + Fine-tuned Medical AI
        </p>
        <p className="mt-1">
          ⚠️ এই বিশ্লেষণ শুধুমাত্র তথ্যগত উদ্দেশ্যে। চিকিৎসকের পরামর্শ নিন।
        </p>
      </div>
    </div>
  )
}

export default AdvancedPrescriptionAnalyzer
