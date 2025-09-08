'use client'

import React, { useState, useEffect } from 'react'
import { MessageCircle, Share2, Copy, Download } from 'lucide-react'

const BengaliSummaryCard = ({ analysis, showChatButton = true }) => {
  const [copied, setCopied] = useState(false)

  const formatSummary = (analysis) => {
    if (!analysis) return null

    const summary = analysis.summary || analysis
    const colors = analysis.colors || {}

    return {
      title: summary.title || "📊 সাম্প্রতিক বিশ্লেষণ",
      date: summary.date || `📅 ${new Date().toLocaleDateString('bn-BD')}`,
      condition: summary.condition || analysis.analysis?.primaryDiagnosis?.condition || 'নির্দিষ্ট নেই',
      medicines: summary.medicines || analysis.analysis?.medications?.length || 0,
      tests: summary.tests || analysis.analysis?.investigations?.length || 0,
      shortDescription: summary.shortDescription || createShortDescription(analysis),
      colors: colors
    }
  }

  const createShortDescription = (analysis) => {
    let parts = []
    
    if (analysis.analysis?.primaryDiagnosis?.condition) {
      parts.push(`রোগ: ${analysis.analysis.primaryDiagnosis.condition}`)
    }
    
    if (analysis.analysis?.medications?.length > 0) {
      parts.push(`💊 ${analysis.analysis.medications.length} টি ওষুধ`)
    }
    
    if (analysis.analysis?.investigations?.length > 0) {
      parts.push(`🔬 ${analysis.analysis.investigations.length} টি টেস্ট`)
    }
    
    return parts.join(', ') || 'AI বিশ্লেষণ সম্পন্ন'
  }

  const createChatSummary = (formattedSummary) => {
    return `
📊 বিশ্লেষণের সারসংক্ষেপ (${formattedSummary.date}):

${formattedSummary.shortDescription}

🏥 রোগ নির্ণয়: ${formattedSummary.condition}
💊 ওষুধ: ${formattedSummary.medicines} টি
🔬 টেস্ট: ${formattedSummary.tests} টি

এই বিশ্লেষণ নিয়ে আপনার কোনো প্রশ্ন আছে?
    `.trim()
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const sendToChat = () => {
    const formattedSummary = formatSummary(analysis)
    const chatSummary = createChatSummary(formattedSummary)
    
    // Store detailed analysis for chat context
    localStorage.setItem('medilens_chat_context', JSON.stringify({
      type: 'analysis_discussion',
      analysis: analysis,
      summary: chatSummary,
      formattedSummary: formattedSummary,
      fullReport: generateDetailedChatContext(analysis),
      timestamp: new Date().toISOString()
    }))
    
    // Redirect to chat
    window.location.href = '/chat'
  }

  const generateDetailedChatContext = (analysis) => {
    let context = `📊 প্রেসক্রিপশন বিশ্লেষণ - ${new Date().toLocaleDateString('bn-BD')}\n\n`
    
    // Patient info
    if (analysis.analysis?.patientInformation && Object.keys(analysis.analysis.patientInformation).some(key => analysis.analysis.patientInformation[key])) {
      context += `👤 রোগীর তথ্য:\n`
      Object.entries(analysis.analysis.patientInformation).forEach(([key, value]) => {
        if (value) context += `• ${key}: ${value}\n`
      })
      context += `\n`
    }

    // Primary diagnosis
    if (analysis.analysis?.primaryDiagnosis?.condition) {
      context += `🏥 রোগ নির্ণয়: ${analysis.analysis.primaryDiagnosis.condition}\n\n`
    }

    // Medications
    if (analysis.analysis?.medications?.length > 0) {
      context += `💊 ওষুধের তালিকা:\n`
      analysis.analysis.medications.forEach((med, index) => {
        context += `${index + 1}. ${med.prescribedName || med.genericName || med.name}\n`
        if (med.frequency) context += `   সেবনবিধি: ${med.frequency}\n`
        if (med.purpose) context += `   কাজ: ${med.purpose}\n`
      })
      context += `\n`
    }

    // Investigations
    if (analysis.analysis?.investigations?.length > 0) {
      context += `🔬 পরীক্ষা-নিরীক্ষা:\n`
      analysis.analysis.investigations.forEach((test, index) => {
        const testName = typeof test === 'string' ? test : test.test
        context += `${index + 1}. ${testName}\n`
      })
      context += `\n`
    }

    // Medical advice
    if (analysis.analysis?.medicalAdvice?.banglaReport) {
      context += `👨‍⚕️ চিকিৎসা পরামর্শ:\n${analysis.analysis.medicalAdvice.banglaReport}\n\n`
    }

    // Safety warnings
    if (analysis.analysis?.safetyWarnings?.length > 0) {
      context += `⚠️ সতর্কতা:\n`
      analysis.analysis.safetyWarnings.forEach((warning, index) => {
        context += `${index + 1}. ${warning}\n`
      })
      context += `\n`
    }

    return context
  }

  const downloadSummary = () => {
    const formattedSummary = formatSummary(analysis)
    const summaryText = createChatSummary(formattedSummary)
    
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-summary-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!analysis) {
    return null
  }

  const formattedSummary = formatSummary(analysis)

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <h3 className="text-lg font-bold flex items-center">
          {formattedSummary.title}
          <span className="ml-3 text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
            #{analysis.id?.toString().slice(-6) || 'Latest'}
          </span>
        </h3>
        <p className="text-indigo-100 text-sm mt-1">{formattedSummary.date}</p>
      </div>

      {/* Summary Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {formattedSummary.condition !== 'নির্দিষ্ট নেই' && (
            <div 
              className="bg-white p-3 rounded-lg border-l-4 shadow-sm"
              style={{ borderLeftColor: formattedSummary.colors.diagnosisColor || '#dc2626' }}
            >
              <div className="text-red-600 text-lg mb-1">🏥</div>
              <div className="text-sm text-gray-600">রোগ নির্ণয়</div>
              <div className="font-medium text-gray-800 text-sm">{formattedSummary.condition}</div>
            </div>
          )}
          
          {formattedSummary.medicines > 0 && (
            <div 
              className="bg-white p-3 rounded-lg border-l-4 shadow-sm"
              style={{ borderLeftColor: formattedSummary.colors.medicationColor || '#059669' }}
            >
              <div className="text-green-600 text-lg mb-1">💊</div>
              <div className="text-sm text-gray-600">ওষুধ</div>
              <div className="font-medium text-gray-800 text-sm">{formattedSummary.medicines} টি</div>
            </div>
          )}
          
          {formattedSummary.tests > 0 && (
            <div 
              className="bg-white p-3 rounded-lg border-l-4 shadow-sm"
              style={{ borderLeftColor: formattedSummary.colors.testColor || '#2563eb' }}
            >
              <div className="text-blue-600 text-lg mb-1">🔬</div>
              <div className="text-sm text-gray-600">টেস্ট</div>
              <div className="font-medium text-gray-800 text-sm">{formattedSummary.tests} টি</div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">📋 সারসংক্ষেপ:</h4>
          <p className="text-gray-700 text-sm">{formattedSummary.shortDescription}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {showChatButton && (
            <button
              onClick={sendToChat}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              AI এর সাথে আলোচনা
            </button>
          )}
          
          <button
            onClick={() => copyToClipboard(createChatSummary(formattedSummary))}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              copied 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'কপি হয়েছে!' : 'কপি করুন'}
          </button>
          
          <button
            onClick={downloadSummary}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            ডাউনলোড
          </button>
        </div>
      </div>
    </div>
  )
}

export default BengaliSummaryCard
