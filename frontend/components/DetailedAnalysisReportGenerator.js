'use client'

import React, { useState, useEffect } from 'react'
import { Download, Copy, Eye, Share2, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const DetailedAnalysisReportGenerator = ({ analysis }) => {
  const [copied, setCopied] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const generateDetailedReport = (analysis) => {
    const date = new Date(analysis.timestamp).toLocaleDateString('bn-BD')
    const time = new Date(analysis.timestamp).toLocaleTimeString('bn-BD')
    
    let report = `
═══════════════════════════════════════════════════
🏥 PrescribeCorrect বিস্তারিত প্রেসক্রিপশন বিশ্লেষণ রিপোর্ট
═══════════════════════════════════════════════════

📅 তারিখ: ${date}
⏰ সময়: ${time}
🔍 বিশ্লেষণ পদ্ধতি: ${analysis.analysisMethod || 'Enhanced Medical AI'}
📊 রিপোর্ট ID: #${analysis.id?.toString().slice(-6) || 'Latest'}

${'─'.repeat(60)}
`

    // Image Analysis Quality
    if (analysis.imageAnalysis || analysis.analysis?.imageAnalysis) {
      const imgAnalysis = analysis.imageAnalysis || analysis.analysis?.imageAnalysis
      report += `
🔍 ছবি বিশ্লেষণ গুণমান:
${'─'.repeat(30)}
টেক্সট গুণমান: ${imgAnalysis.textQuality || 'N/A'}
পঠনযোগ্যতা: ${imgAnalysis.readabilityScore || 'N/A'}
ডকুমেন্ট ধরন: ${imgAnalysis.documentType || 'prescription'}
ভাষা: ${imgAnalysis.language || 'mixed'}
`
    }

    // Patient Information
    const patientInfo = analysis.patientInformation || analysis.analysis?.patientInformation
    if (patientInfo && Object.keys(patientInfo).some(key => patientInfo[key])) {
      report += `
👤 রোগীর তথ্য:
${'─'.repeat(30)}
${Object.entries(patientInfo).map(([key, value]) => 
  value ? `${key}: ${value}` : `${key}: N/A`
).join('\n')}
`
    }

    // Doctor Information
    const doctorInfo = analysis.doctorInformation || analysis.analysis?.doctorInformation
    if (doctorInfo && Object.keys(doctorInfo).some(key => doctorInfo[key])) {
      report += `
👨‍⚕️ চিকিৎসকের তথ্য:
${'─'.repeat(30)}
${Object.entries(doctorInfo).map(([key, value]) => 
  value ? `${key}: ${value}` : `${key}: N/A`
).join('\n')}
`
    }

    // Primary Diagnosis
    const diagnosis = analysis.primaryDiagnosis || analysis.analysis?.primaryDiagnosis
    if (diagnosis) {
      report += `
🏥 প্রাথমিক রোগ নির্ণয়:
${'─'.repeat(30)}
রোগ: ${diagnosis.condition || 'N/A'}
${diagnosis.bangla ? `বাংলায়: ${diagnosis.bangla}` : ''}
${diagnosis.severity ? `তীব্রতা: ${diagnosis.severity}` : ''}
${diagnosis.description ? `\nবিস্তারিত:\n${diagnosis.description}` : ''}
`
    }

    // Medications
    const medications = analysis.medications || analysis.analysis?.medications
    if (medications && medications.length > 0) {
      report += `
💊 ওষুধের তালিকা:
${'─'.repeat(30)}
${medications.map((med, index) => `
${index + 1}. নাম: ${med.prescribedName || med.genericName || med.name || 'N/A'}
   ${med.bangla ? `বাংলায়: ${med.bangla}` : ''}
   শক্তি: ${med.strength || med.dosage || 'N/A'}
   সেবনবিধি: ${med.frequency || 'N/A'}
   মেয়াদ: ${med.duration || 'N/A'}
   কাজ: ${med.purpose || med.mechanism || 'N/A'}
   ${med.instructions ? `নির্দেশনা: ${med.instructions}` : ''}
   ${med.sideEffects ? `পার্শ্বপ্রতিক্রিয়া: ${med.sideEffects}` : ''}
   ${med.alternatives ? `বিকল্প: ${med.alternatives}` : ''}
`).join('')}
`
    }

    // Investigations
    const investigations = analysis.investigations || analysis.analysis?.investigations
    if (investigations && investigations.length > 0) {
      report += `
🧪 পরীক্ষা-নিরীক্ষা:
${'─'.repeat(30)}
${investigations.map((test, index) => `
${index + 1}. পরীক্ষা: ${test.test || test}
   ${test.bangla ? `বাংলায়: ${test.bangla}` : ''}
   ${test.purpose ? `উদ্দেশ্য: ${test.purpose}` : ''}
   ${test.urgency ? `জরুরিত্ব: ${test.urgency}` : ''}
   ${test.normalRange ? `স্বাভাবিক মাত্রা: ${test.normalRange}` : ''}
`).join('')}
`
    }

    // Medical Advice
    const medicalAdvice = analysis.medicalAdvice || analysis.analysis?.medicalAdvice
    if (medicalAdvice) {
      report += `
👨‍⚕️ চিকিৎসা পরামর্শ:
${'─'.repeat(30)}
`
      if (medicalAdvice.banglaReport) {
        report += `সামগ্রিক পরামর্শ:\n${medicalAdvice.banglaReport}\n\n`
      }
      if (medicalAdvice.dietaryGuidance) {
        report += `খাদ্যাভ্যাস:\n${medicalAdvice.dietaryGuidance}\n\n`
      }
      if (medicalAdvice.exerciseRecommendations) {
        report += `ব্যায়াম:\n${medicalAdvice.exerciseRecommendations}\n\n`
      }
    }

    // Safety Warnings
    const safetyWarnings = analysis.safetyWarnings || analysis.analysis?.safetyWarnings
    if (safetyWarnings && safetyWarnings.length > 0) {
      report += `
⚠️ গুরুত্বপূর্ণ সতর্কতা:
${'─'.repeat(30)}
${safetyWarnings.map((warning, index) => `${index + 1}. ${warning}`).join('\n')}
`
    }

    // Cost Analysis
    const costAnalysis = analysis.costAnalysis || analysis.analysis?.costAnalysis
    if (costAnalysis && Object.keys(costAnalysis).some(key => costAnalysis[key])) {
      report += `
💰 খরচ বিশ্লেষণ:
${'─'.repeat(30)}
${Object.entries(costAnalysis).map(([key, value]) => 
  value ? `${key}: ${value}` : null
).filter(Boolean).join('\n')}
`
    }

    // Quality Metrics
    const qualityMetrics = analysis.qualityMetrics || analysis.analysis?.qualityMetrics
    if (qualityMetrics && Object.keys(qualityMetrics).some(key => qualityMetrics[key])) {
      report += `
📊 বিশ্লেষণের গুণমান:
${'─'.repeat(30)}
${Object.entries(qualityMetrics).map(([key, value]) => `${key}: ${value}`).join('\n')}
`
    }

    // Footer
    report += `
${'─'.repeat(60)}
⚠️ গুরুত্বপূর্ণ দাবিত্যাগ:
এই AI বিশ্লেষণ শুধুমাত্র তথ্যগত এবং শিক্ষামূলক উদ্দেশ্যে। এটি কোনো চিকিৎসকের 
পরামর্শের বিকল্প নয়। ওষুধ সেবনের আগে অবশ্যই যোগ্য চিকিৎসকের সাথে পরামর্শ করুন। 
জরুরি অবস্থায় তাৎক্ষণিক চিকিৎসা সেবা নিন।

Generated by MediBot • ${new Date().toLocaleDateString('bn-BD')}
═══════════════════════════════════════════════════
`
    
    return report.trim()
  }

  const downloadReport = () => {
    const report = generateDetailedReport(analysis)
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `detailed-analysis-${analysis.id || Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadPDFReport = async () => {
    setIsGeneratingPDF(true)
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Get the text report and convert to PDF
      const textReport = generateDetailedReport(analysis)
      
      // Page settings
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      let yPosition = margin

      // Helper function to add text with proper wrapping and Bengali support
      const addTextToPDF = (text, fontSize = 9, style = 'normal', color = [0, 0, 0]) => {
        pdf.setFontSize(fontSize)
        pdf.setFont('helvetica', style)
        pdf.setTextColor(...color)
        
        const maxWidth = pageWidth - (margin * 2)
        
        // Split text by lines first
        const textLines = text.split('\n')
        
        textLines.forEach(line => {
          if (line.trim() === '') {
            yPosition += fontSize * 0.3
            return
          }
          
          // Handle special formatting
          if (line.includes('═══════')) {
            pdf.setDrawColor(100, 100, 100)
            pdf.line(margin, yPosition, pageWidth - margin, yPosition)
            yPosition += 5
            return
          }
          
          if (line.includes('─────')) {
            pdf.setDrawColor(200, 200, 200)
            pdf.line(margin, yPosition, pageWidth - margin, yPosition)
            yPosition += 3
            return
          }
          
          // Check for headers (emoji + text)
          if (line.includes('🏥') || line.includes('👤') || line.includes('👨‍⚕️') || 
              line.includes('💊') || line.includes('🧪') || line.includes('⚠️') || 
              line.includes('💰') || line.includes('📊')) {
            
            // Add some space before headers
            yPosition += 5
            
            // Make headers bold and larger
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'bold')
            pdf.setTextColor(37, 99, 235)
          } else {
            // Regular text
            pdf.setFontSize(fontSize)
            pdf.setFont('helvetica', style)
            pdf.setTextColor(...color)
          }
          
          // Wrap long lines
          const wrappedLines = pdf.splitTextToSize(line, maxWidth)
          
          wrappedLines.forEach(wrappedLine => {
            // Check if we need a new page
            if (yPosition > pageHeight - 20) {
              pdf.addPage()
              yPosition = margin
            }
            
            pdf.text(wrappedLine, margin, yPosition)
            yPosition += fontSize * 0.6
          })
          
          // Reset to normal style after headers
          if (line.includes('🏥') || line.includes('👤') || line.includes('👨‍⚕️') || 
              line.includes('💊') || line.includes('🧪') || line.includes('⚠️') || 
              line.includes('💰') || line.includes('📊')) {
            yPosition += 3
          }
        })
      }

      // Header
      pdf.setFillColor(37, 99, 235)
      pdf.rect(0, 0, pageWidth, 35, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PrescribeCorrect - Prescription Analysis Report', pageWidth/2, 15, { align: 'center' })
      pdf.text('Professional Medical AI Analysis', pageWidth/2, 25, { align: 'center' })
      
      yPosition = 45

      // Add the complete text report
      addTextToPDF(textReport, 9)

      // Footer
      yPosition = pageHeight - 15
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(8)
      pdf.text(`Generated by MediBot • ${new Date().toLocaleDateString('en-GB')}`, pageWidth/2, yPosition, { align: 'center' })

      // Save PDF with timestamp
      const filename = `PrescribeCorrect-prescription-analysis-${Date.now()}.pdf`
      pdf.save(filename)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback to text download
      downloadReport()
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const copyReport = async () => {
    try {
      const report = generateDetailedReport(analysis)
      await navigator.clipboard.writeText(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback - show the report in a new window for manual copy
      const newWindow = window.open()
      newWindow.document.write(`<pre style="white-space: pre-wrap; font-family: monospace; padding: 20px;">${generateDetailedReport(analysis)}</pre>`)
      newWindow.document.title = 'PrescribeCorrect Analysis Report - Copy this text'
    }
  }

  const shareReport = async () => {
    const report = generateDetailedReport(analysis)
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PrescribeCorrect বিস্তারিত প্রেসক্রিপশন বিশ্লেষণ রিপোর্ট',
          text: report,
        })
      } catch (error) {
        console.error('Error sharing:', error)
        // Fallback to copy
        copyReport()
      }
    } else {
      // Fallback - open email with report
      const subject = encodeURIComponent('PrescribeCorrect প্রেসক্রিপশন বিশ্লেষণ রিপোর্ট')
      const body = encodeURIComponent(report)
      window.open(`mailto:?subject=${subject}&body=${body}`)
    }
  }

  if (!analysis) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* <button
        onClick={downloadPDFReport}
        disabled={isGeneratingPDF}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
          isGeneratingPDF 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        <FileText className="w-4 h-4 mr-2" />
        {isGeneratingPDF ? 'PDF তৈরি হচ্ছে...' : 'PDF রিপোর্ট ডাউনলোড'}
      </button>
      
      <button
        onClick={downloadReport}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        <Download className="w-4 h-4 mr-2" />
        টেক্সট রিপোর্ট ডাউনলোড
      </button> */}
      
      <button
        onClick={copyReport}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
          copied 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Copy className="w-4 h-4 mr-2" />
        {copied ? 'কপি হয়েছে!' : 'রিপোর্ট কপি করুন'}
      </button>
      
      <button
        onClick={shareReport}
        className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
      >
        <Share2 className="w-4 h-4 mr-2" />
        শেয়ার করুন
      </button>
    </div>
  )
}

export default DetailedAnalysisReportGenerator
