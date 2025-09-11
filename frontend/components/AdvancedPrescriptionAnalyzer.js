'use client'

import React, { useState, useRef } from 'react'
import { Camera, Upload, FileText, Loader2, CheckCircle, AlertCircle, Download, Eye, Brain, FileDown } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import BengaliSummaryCard from './BengaliSummaryCard'
import DetailedAnalysisReportGenerator from './DetailedAnalysisReportGenerator'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

const AdvancedPrescriptionAnalyzer = () => {
  const { currentUser, getToken } = useAuth()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState('')
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [analysisMethod, setAnalysisMethod] = useState('enhanced-medical') // Default to Enhanced Medical
  const [savedAnalysisId, setSavedAnalysisId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Helper function to safely get array data
  const safeArray = (data) => {
    return Array.isArray(data) ? data : []
  }

  // Create a concise summary for database storage (বাংলায়)
  const createConciseSummary = (analysisData) => {
    let summary = []
    
    // Basic info
    if (analysisData.patientInformation?.name) {
      summary.push(`রোগী: ${analysisData.patientInformation.name}`)
    }
    if (analysisData.doctorInformation?.name) {
      summary.push(`ডাক্তার: ${analysisData.doctorInformation.name}`)
    }
    
    // Primary diagnosis
    if (analysisData.primaryDiagnosis?.condition) {
      summary.push(`রোগ: ${analysisData.primaryDiagnosis.condition}`)
    } else if (analysisData.primaryDiagnosis?.conditions?.length > 0) {
      summary.push(`রোগসমূহ: ${analysisData.primaryDiagnosis.conditions.slice(0, 3).join(', ')}`)
    }
    
    // Medications count
    if (analysisData.medications?.length > 0) {
      summary.push(`💊 ${analysisData.medications.length} টি ওষুধ`)
    }
    
    // Key advice (shortened)
    if (analysisData.medicalAdvice?.banglaReport) {
      const advice = analysisData.medicalAdvice.banglaReport.substring(0, 300)
      summary.push(`পরামর্শ: ${advice}${advice.length === 300 ? '...' : ''}`)
    }
    
    return summary.join(' | ').substring(0, 9999)
  }

  // Create Bengali summary for display and chat
  const createBengaliSummary = (analysisData) => {
    let summary = {
      title: "📊 সাম্প্রতিক বিশ্লেষণ",
      date: `📅 ${new Date().toLocaleDateString('bn-BD')}`,
      condition: "",
      medicines: 0,
      tests: 0,
      shortDescription: ""
    }

    // Primary diagnosis
    if (analysisData.primaryDiagnosis?.condition) {
      summary.condition = analysisData.primaryDiagnosis.condition
    } else if (analysisData.primaryDiagnosis?.conditions?.length > 0) {
      summary.condition = analysisData.primaryDiagnosis.conditions[0]
    }

    // Medicines count
    if (analysisData.medications?.length > 0) {
      summary.medicines = analysisData.medications.length
    }

    // Tests count
    if (analysisData.investigations?.length > 0) {
      summary.tests = analysisData.investigations.length
    }

    // Short description for chat
    let description = []
    if (summary.condition) {
      description.push(`রোগ: ${summary.condition}`)
    }
    if (summary.medicines > 0) {
      description.push(`💊 ${summary.medicines} টি ওষুধ`)
    }
    if (summary.tests > 0) {
      description.push(`🔬 ${summary.tests} টি টেস্ট`)
    }
    
    summary.shortDescription = description.join(', ')
    
    return summary
  }

  // Color mapping for different analysis sections
  const getAnalysisColors = () => {
    return {
      diagnosisColor: "#dc2626", // red-600
      medicationColor: "#059669", // emerald-600
      testColor: "#2563eb", // blue-600
      warningColor: "#d97706", // amber-600
      adviceColor: "#7c3aed", // violet-600
      patientColor: "#0891b2", // cyan-600
      doctorColor: "#be185d", // pink-600
      summaryColor: "#374151" // gray-700
    }
  }

  // Store analysis data with colors in localStorage
  const storeAnalysisDataLocally = (analysisData, bengaliSummary, colors) => {
    try {
      const analysisWithColors = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('bn-BD'),
        
        // Full analysis data
        analysis: analysisData,
        summary: bengaliSummary,
        colors: colors,
        extractedText: extractedText,
        analysisMethod: analysisMethod,
        
        // Detailed sections for easy access
        imageAnalysis: analysisData.imageAnalysis || null,
        patientInformation: analysisData.patientInformation || null,
        doctorInformation: analysisData.doctorInformation || null,
        primaryDiagnosis: analysisData.primaryDiagnosis || null,
        medications: analysisData.medications || [],
        investigations: analysisData.investigations || [],
        medicalAdvice: analysisData.medicalAdvice || null,
        safetyWarnings: analysisData.safetyWarnings || [],
        costAnalysis: analysisData.costAnalysis || null,
        qualityMetrics: analysisData.qualityMetrics || null,
        
        // For autofill features
        medicalHistory: extractMedicalHistory(analysisData),
        currentMedications: extractCurrentMedications(analysisData),
        allergies: extractAllergies(analysisData),
        
        // Bengali translated content
        bengaliDiagnosis: analysisData.primaryDiagnosis?.bangla || '',
        bengaliAdvice: analysisData.medicalAdvice?.banglaReport || '',
        
        // Legacy fields for compatibility
        keyDiseases: analysisData.primaryDiagnosis?.conditions || 
                    [analysisData.primaryDiagnosis?.condition].filter(Boolean) || [],
        medicines: analysisData.medications?.map(med => 
          med.prescribedName || med.correctedName || med.genericName || med.brandName || 
          med.name || med.medication || med.drug || med.medicine || 'Unknown Medicine'
        ) || [],
        doctorName: analysisData.doctorInformation?.name || null,
        patientName: analysisData.patientInformation?.name || null
      }

      // Get existing analyses
      const existingAnalyses = JSON.parse(localStorage.getItem('medilens_analyses') || '[]')
      
      // Add new analysis at the beginning
      existingAnalyses.unshift(analysisWithColors)
      
      // Keep only last 50 analyses
      if (existingAnalyses.length > 50) {
        existingAnalyses.splice(50)
      }
      
      // Store back to localStorage
      localStorage.setItem('medilens_analyses', JSON.stringify(existingAnalyses))
      localStorage.setItem('medilens_latest_analysis', JSON.stringify(analysisWithColors))
      
      console.log('✅ Detailed analysis stored locally with colors and Bengali summary')
      return analysisWithColors
    } catch (error) {
      console.error('Error storing analysis locally:', error)
      return null
    }
  }

  // Extract medical history for autofill
  const extractMedicalHistory = (analysisData) => {
    let history = []
    
    if (analysisData.primaryDiagnosis?.condition) {
      history.push(analysisData.primaryDiagnosis.condition)
    }
    if (analysisData.primaryDiagnosis?.conditions?.length > 0) {
      history.push(...analysisData.primaryDiagnosis.conditions)
    }
    
    return [...new Set(history)] // Remove duplicates
  }

  // Extract current medications for autofill
  const extractCurrentMedications = (analysisData) => {
    let medications = []
    
    if (analysisData.medications?.length > 0) {
      medications = analysisData.medications.map(med => ({
        name: med.prescribedName || med.genericName || med.brandName || med.name,
        bangla: med.bangla || '',
        strength: med.strength || med.dosage || '',
        frequency: med.frequency || '',
        duration: med.duration || '',
        purpose: med.purpose || med.mechanism || ''
      }))
    }
    
    return medications
  }

  // Extract allergies information
  const extractAllergies = (analysisData) => {
    let allergies = []
    
    // Check safety warnings for allergy information
    if (analysisData.safetyWarnings?.length > 0) {
      analysisData.safetyWarnings.forEach(warning => {
        if (warning.toLowerCase().includes('allerg') || warning.toLowerCase().includes('অ্যালার্জি')) {
          allergies.push(warning)
        }
      })
    }
    
    return allergies
  }

  // Get stored analyses from localStorage
  const getStoredAnalyses = () => {
    try {
      const stored = localStorage.getItem('medilens_analyses')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading stored analyses:', error)
      return []
    }
  }

  // Get latest analysis from localStorage
  const getLatestAnalysis = () => {
    try {
      const stored = localStorage.getItem('medilens_latest_analysis')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error reading latest analysis:', error)
      return null
    }
  }

  // Save analysis to database
  const saveAnalysisToDatabase = async (analysisData) => {
    if (!currentUser) {
      console.log('User not logged in, saving to localStorage only')
      
      // Create Bengali summary and colors
      const bengaliSummary = createBengaliSummary(analysisData)
      const colors = getAnalysisColors()
      
      // Store locally with colors
      const storedData = storeAnalysisDataLocally(analysisData, bengaliSummary, colors)
      
      return storedData
    }

    try {
      setIsSaving(true)
      
      // Create Bengali summary and colors
      const bengaliSummary = createBengaliSummary(analysisData)
      const colors = getAnalysisColors()
      
      // Store locally first
      storeAnalysisDataLocally(analysisData, bengaliSummary, colors)
      
      // Extract key information from analysis for database storage
      const analysisForDB = {
        analysisSummary: createConciseSummary(analysisData),
        bengaliSummary: bengaliSummary.shortDescription,
        fullPrescriptionText: (extractedText || analysisData.extractedText || '').substring(0, 9999),
        
        // Detailed analysis sections
        imageAnalysis: analysisData.imageAnalysis || null,
        patientInformation: analysisData.patientInformation || null,
        doctorInformation: analysisData.doctorInformation || null,
        primaryDiagnosis: analysisData.primaryDiagnosis || null,
        
        // Medications with full details
        medications: analysisData.medications || [],
        medicineNames: safeArray(analysisData.medications?.map(med => 
          med.prescribedName || med.correctedName || med.genericName || med.brandName || 
          med.name || med.medication || med.drug || med.medicine || 'Unknown Medicine'
        )),
        
        // Investigations/Tests with full details
        investigations: analysisData.investigations || [],
        
        // Medical advice
        medicalAdvice: analysisData.medicalAdvice || null,
        
        // Safety warnings
        safetyWarnings: analysisData.safetyWarnings || [],
        
        // Cost analysis
        costAnalysis: analysisData.costAnalysis || null,
        
        // Quality metrics
        qualityMetrics: analysisData.qualityMetrics || null,
        
        // Legacy fields for compatibility
        medicines: safeArray(analysisData.medications?.map(med => 
          med.prescribedName || med.correctedName || med.genericName || med.brandName || 
          med.name || med.medication || med.drug || med.medicine || 'Unknown Medicine'
        )),
        keyDiseases: safeArray(analysisData.primaryDiagnosis?.conditions || 
                              [analysisData.primaryDiagnosis?.condition].filter(Boolean) ||
                              analysisData.keyDiseases),
        dosageInstructions: safeArray(analysisData.medications?.map(med => 
          `${med.prescribedName || med.genericName || 'Medicine'}: ${med.frequency || ''} ${med.duration || ''} ${med.timing || ''}`.trim()
        )),
        doctorName: analysisData.doctorInformation?.name || analysisData.doctorInformation?.doctorName || analysisData.doctorName || null,
        patientName: analysisData.patientInformation?.name || analysisData.patientInformation?.patientName || analysisData.patientName || null,
        
        // Add color information
        analysisColors: colors,
        
        // Add extracted information for autofill
        medicalHistory: extractMedicalHistory(analysisData),
        currentMedications: extractCurrentMedications(analysisData),
        allergies: extractAllergies(analysisData),
        
        // Analysis metadata
        analysisMethod: analysisMethod,
        timestamp: new Date().toISOString()
      }

      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/analysis/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisForDB),
      })

      if (response.ok) {
        const savedAnalysis = await response.json()
        setSavedAnalysisId(savedAnalysis.id)
        console.log('✅ Analysis saved to database with colors and Bengali summary:', savedAnalysis.id)
        return savedAnalysis
      } else {
        const errorText = await response.text()
        console.error('Failed to save analysis to database:', response.status, errorText)
        setError(`Failed to save analysis: ${errorText}`)
        return null
      }
    } catch (error) {
      console.error('Error saving analysis to database:', error)
      return null
    } finally {
      setIsSaving(false)
    }
  }

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
    setAnalysisProgress(0)
    setAnalysisStage('প্রস্তুতি...')
    setEstimatedTime(15) // 15 seconds estimate

    // Progress simulation
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.random() * 10
      })
    }, 500)

    // Stage updates
    const stages = [
      { stage: 'ছবি আপলোড করা হচ্ছে...', delay: 1000 },
      { stage: 'টেক্সট বিশ্লেষণ করা হচ্ছে...', delay: 3000 },
      { stage: 'ওষুধের তালিকা খোঁজা হচ্ছে...', delay: 5000 },
      { stage: 'রোগ নির্ণয় করা হচ্ছে...', delay: 7000 },
      { stage: 'চিকিৎসা পরামর্শ তৈরি করা হচ্ছে...', delay: 10000 },
      { stage: 'চূড়ান্ত রিপোর্ট প্রস্তুত করা হচ্ছে...', delay: 13000 }
    ]

    stages.forEach(({ stage, delay }) => {
      setTimeout(() => {
        if (isAnalyzing) {
          setAnalysisStage(stage)
          setEstimatedTime(prev => Math.max(0, prev - 2))
        }
      }, delay)
    })

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
        
        setAnalysisProgress(100)
        setAnalysisStage('সম্পন্ন!')
        setEstimatedTime(0)
        
        // Save analysis to database if user is logged in
        if (currentUser && result.analysis) {
          await saveAnalysisToDatabase(result.analysis)
        }
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
            
            // Save fallback analysis to database if user is logged in
            if (currentUser && fallbackResult.analysis) {
              await saveAnalysisToDatabase(fallbackResult.analysis)
            }
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
      setAnalysisProgress(0)
      setAnalysisStage('')
      setEstimatedTime(0)
    }
  }

  const resetAnalyzer = () => {
    setSelectedFile(null)
    setPreview(null)
    setAnalysis(null)
    setError(null)
    setExtractedText('')
    setSavedAnalysisId(null)
    setIsSaving(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const downloadReport = async (format = 'json') => {
    if (!analysis) return;

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
    };

    if (format === 'pdf') {
      try {
        // Dynamically import html2pdf.js only on the client
        const html2pdf = (await import('html2pdf.js')).default;
        console.log('[PDF] Starting PDF download...');
        const reportElement = document.getElementById('medical-report');
        if (!reportElement) {
          console.error('[PDF] #medical-report element not found!');
          alert('Unable to find report section for PDF generation.');
          return;
        }
        reportElement.style.display = 'block';
        // Remove oklch colors before PDF generation
        Array.from(document.querySelectorAll('*')).forEach(el => {
          const style = getComputedStyle(el);
          if (style.backgroundColor.includes('oklch')) {
            el.style.backgroundColor = '#2563eb'; // fallback blue
          }
          if (style.color.includes('oklch')) {
            el.style.color = '#2563eb'; // fallback blue
          }
        });
        const opt = {
          margin:       0,
          filename:     `prescription-analysis-${Date.now()}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        console.log('[PDF] Calling html2pdf...');
        await html2pdf().set(opt).from(reportElement).save();
        reportElement.style.display = '';
        console.log('[PDF] PDF download complete!');
      } catch (err) {
        console.error('[PDF] Error during PDF generation:', err);
        alert('PDF generation failed. See console for details.');
      }
      return;
    } else {
      // JSON Download
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
  }

  const generatePDFReport = async (reportData) => {
    try {
      // Method 1: Use browser's print function with professional report
      const reportElement = document.getElementById('medical-report')
      if (reportElement) {
        // Temporarily show the professional report for printing
        reportElement.style.display = 'block'
        
        // Add print styles with color preservation
        const printStyles = document.createElement('style')
        printStyles.innerHTML = `
          @media print {
            body * { visibility: hidden; }
            #medical-report, #medical-report * { visibility: visible; }
            #medical-report { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              background: white !important; 
              box-shadow: none !important; 
              border: none !important; 
            }
            .print\\:block { display: block !important; }
            .print\\:hidden { display: none !important; }
            /* Force colors and gradients to print */
            * { 
              -webkit-print-color-adjust: exact !important; 
              color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
          }
        `
        document.head.appendChild(printStyles)
        
        // Open new window with colorful content for better PDF control
        const printWindow = window.open('', '_blank', 'width=1200,height=800')
        
        if (printWindow) {
          const reportHTML = reportElement.outerHTML
          
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>MediLens Professional Medical Analysis</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 20px; }
                .print\\:hidden { display: none !important; }
                .print\\:block { display: block !important; }
                /* Ensure all colors print */
                * { 
                  -webkit-print-color-adjust: exact !important; 
                  color-adjust: exact !important; 
                  print-color-adjust: exact !important; 
                }
              </style>
            </head>
            <body>
              ${reportHTML}
              <script>
                window.onload = function() {
                  window.focus();
                  setTimeout(() => window.print(), 500);
                };
              </script>
            </body>
            </html>
          `)
          
          printWindow.document.close()
        } else {
          // Fallback to current window
          window.print()
        }
        
        // Clean up
        setTimeout(() => {
          document.head.removeChild(printStyles)
          reportElement.style.display = '' // Reset to CSS class control
        }, 1000)
        
        return
      }
      
      // Fallback method: Create iframe with professional content
      const htmlContent = createPrintableHTML(reportData)
      
      const printFrame = document.createElement('iframe')
      printFrame.style.position = 'fixed'
      printFrame.style.top = '-9999px'
      printFrame.style.left = '-9999px'
      printFrame.style.width = '8.5in'
      printFrame.style.height = '11in'
      
      document.body.appendChild(printFrame)
      
      const printDocument = printFrame.contentDocument || printFrame.contentWindow.document
      printDocument.write(htmlContent)
      printDocument.close()
      
      // Focus and print
      printFrame.contentWindow.focus()
      
      setTimeout(() => {
        try {
          printFrame.contentWindow.print()
          // Clean up after printing
          setTimeout(() => {
            document.body.removeChild(printFrame)
          }, 1000)
        } catch (printError) {
          console.log('Print method failed, trying alternative...')
          document.body.removeChild(printFrame)
          // Fallback to popup method
          openPrintableWindow(reportData)
        }
      }, 500)
      
    } catch (error) {
      console.error('Error generating PDF report:', error)
      // Final fallback: create a comprehensive text report
      createTextReport(reportData)
    }
  }

  const createPrintableHTML = (reportData) => {
    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>MediLens Prescription Analysis Report</title>
      <style>
        @page {
          margin: 0.75in;
          size: A4;
        }
        @media print {
          body { 
            margin: 0; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6; 
          color: #333;
          font-size: 14px;
          margin: 0;
          padding: 20px;
        }
        .header { 
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: blue; 
          padding: 30px; 
          text-align: center; 
          margin-bottom: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 { 
          margin: 0 0 10px 0; 
          font-size: 28px; 
          font-weight: bold;
        }
        .header p { 
          margin: 5px 0; 
          opacity: 0.9;
        }
        .section { 
          margin-bottom: 25px; 
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .section-header {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          padding: 15px 20px;
          border-bottom: 2px solid #d1d5db;
          font-weight: bold;
          font-size: 18px;
          color: #1f2937;
        }
        .section-content {
          padding: 20px;
          background: white;
        }
        .patient-grid, .doctor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        .info-item {
          background: #f9fafb;
          padding: 12px;
          border-left: 4px solid #3b82f6;
          border-radius: 4px;
        }
        .info-label {
          font-weight: 600;
          color: #374151;
          text-transform: capitalize;
        }
        .info-value {
          color: #111827;
          margin-top: 4px;
        }
        .med-card {
          background: #fef7ed;
          border: 1px solid #fed7aa;
          border-left: 5px solid #ea580c;
          padding: 20px;
          margin: 15px 0;
          border-radius: 6px;
        }
        .med-header {
          font-size: 18px;
          font-weight: bold;
          color: #9a3412;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        }
        .med-number {
          background: #ea580c;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-weight: bold;
        }
        .med-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .med-detail {
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
          border-left: 3px solid #f97316;
        }
        .list-item {
          background: #f0f9ff;
          border-left: 4px solid #0ea5e9;
          padding: 12px;
          margin: 8px 0;
          border-radius: 4px;
        }
        .warning-section {
          background: #fffbeb;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .warning-item {
          background: #fef3c7;
          border-left: 4px solid #d97706;
          padding: 12px;
          margin: 8px 0;
          border-radius: 4px;
          display: flex;
          align-items: flex-start;
        }
        .disclaimer {
          background: #fef2f2;
          border: 2px solid #dc2626;
          padding: 25px;
          border-radius: 8px;
          margin-top: 30px;
          text-align: center;
        }
        .disclaimer h3 {
          color: #991b1b;
          margin-bottom: 15px;
        }
        .disclaimer-text {
          color: #7f1d1d;
          line-height: 1.7;
          font-size: 13px;
        }
        .timestamp {
          text-align: right;
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 20px;
          font-style: italic;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
        .print-instruction {
          background: #dbeafe;
          border: 1px solid #3b82f6;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="print-instruction no-print">
        <strong>📄 How to Save as PDF:</strong><br>
        Press <kbd>Ctrl+P</kbd> (Windows) or <kbd>Cmd+P</kbd> (Mac) → Choose "Save as PDF" → Click Save
      </div>

      <div class="header">
        <h1>🏥 MediLens Prescription Analysis Report</h1>
        <p>Professional Medical AI Analysis System</p>
        <p><strong>Analysis Method:</strong> ${reportData.analysisMethod === 'enhanced-medical' ? 'Enhanced Medical AI with 50,000+ Medical Terms' : 
          reportData.analysisMethod === 'gemini-vision' ? 'Google Gemini Vision AI' : 'Google Lens OCR + AI'}</p>
      </div>
      
      <div class="timestamp">Generated: ${new Date(reportData.timestamp).toLocaleString()}</div>
      
      ${reportData.patientInfo && Object.keys(reportData.patientInfo).length > 0 ? `
      <div class="section avoid-break">
        <div class="section-header">👤 Patient Information</div>
        <div class="section-content">
          <div class="patient-grid">
            ${Object.entries(reportData.patientInfo).map(([key, value]) => 
              value && key !== 'additionalNotes' ? `
                <div class="info-item">
                  <div class="info-label">${key}:</div>
                  <div class="info-value">${value}</div>
                </div>
              ` : ''
            ).join('')}
          </div>
        </div>
      </div>
      ` : ''}
      
      ${reportData.doctorInfo && Object.keys(reportData.doctorInfo).length > 0 ? `
      <div class="section avoid-break">
        <div class="section-header">👨‍⚕️ Doctor Information</div>
        <div class="section-content">
          <div class="doctor-grid">
            ${Object.entries(reportData.doctorInfo).map(([key, value]) => 
              value ? `
                <div class="info-item">
                  <div class="info-label">${key}:</div>
                  <div class="info-value">${value}</div>
                </div>
              ` : ''
            ).join('')}
          </div>
        </div>
      </div>
      ` : ''}
      
      ${reportData.diagnosis ? `
      <div class="section avoid-break">
        <div class="section-header">🔍 Primary Diagnosis</div>
        <div class="section-content">
          ${reportData.diagnosis.conditions && Array.isArray(reportData.diagnosis.conditions) && reportData.diagnosis.conditions.length > 0 ? `
            <h4 style="margin-bottom: 10px; color: #374151;">Conditions:</h4>
            ${reportData.diagnosis.conditions.map((condition, index) => `
              <div class="list-item">${index + 1}. ${condition}</div>
            `).join('')}
          ` : ''}
          ${reportData.diagnosis.symptoms && Array.isArray(reportData.diagnosis.symptoms) && reportData.diagnosis.symptoms.length > 0 ? `
            <h4 style="margin: 20px 0 10px 0; color: #374151;">Symptoms:</h4>
            ${reportData.diagnosis.symptoms.map(symptom => `
              <div class="list-item">• ${symptom}</div>
            `).join('')}
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      ${reportData.medications && Array.isArray(reportData.medications) && reportData.medications.length > 0 ? `
      <div class="section">
        <div class="section-header">💊 Prescribed Medications</div>
        <div class="section-content">
          ${reportData.medications.map((med, index) => `
            <div class="med-card avoid-break">
              <div class="med-header">
                <div class="med-number">${index + 1}</div>
                <div>${med.prescribedName || med.correctedName || med.genericName || med.brandName || 
                       med.name || med.medication || med.drug || med.medicine || `Medication ${index + 1}`}</div>
                ${med.bangla ? `<div style="font-size: 14px; color: #7f1d1d;">(${med.bangla})</div>` : ''}
              </div>
              <div class="med-details">
                ${med.strength || med.dosage ? `<div class="med-detail"><strong>Strength:</strong> ${med.strength || med.dosage}</div>` : ''}
                ${med.frequency ? `<div class="med-detail"><strong>Frequency:</strong> ${med.frequency}${med.timing ? ` (${med.timing})` : ''}</div>` : ''}
                ${med.duration ? `<div class="med-detail"><strong>Duration:</strong> ${med.duration}</div>` : ''}
                ${med.purpose || med.mechanism ? `<div class="med-detail"><strong>Purpose:</strong> ${med.purpose || med.mechanism}</div>` : ''}
                ${med.formulation ? `<div class="med-detail"><strong>Type:</strong> ${med.formulation}</div>` : ''}
                ${med.totalQuantity ? `<div class="med-detail"><strong>Quantity:</strong> ${med.totalQuantity}</div>` : ''}
                ${med.estimatedCost ? `<div class="med-detail"><strong>Cost:</strong> ${med.estimatedCost} BDT</div>` : ''}
              </div>
              ${med.sideEffects ? `<div style="background: #fef3c7; border-left: 3px solid #f59e0b; padding: 8px; margin-top: 8px; border-radius: 4px;"><strong>Side Effects:</strong> ${med.sideEffects}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${reportData.investigations && Array.isArray(reportData.investigations) && reportData.investigations.length > 0 ? `
      <div class="section avoid-break">
        <div class="section-header">🔬 Recommended Investigations</div>
        <div class="section-content">
          ${reportData.investigations.map((investigation, index) => `
            <div class="list-item">
              <strong>${index + 1}. ${investigation.test || investigation}</strong>
              ${investigation.purpose ? `<br><em style="color: #6b7280;">Purpose: ${investigation.purpose}</em>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${reportData.medicalAdvice ? `
      <div class="section avoid-break">
        <div class="section-header">👨‍⚕️ Medical Advice</div>
        <div class="section-content">
          ${reportData.medicalAdvice.generalCare && Array.isArray(reportData.medicalAdvice.generalCare) && reportData.medicalAdvice.generalCare.length > 0 ? `
            <h4 style="margin-bottom: 10px; color: #374151;">General Care Instructions:</h4>
            ${reportData.medicalAdvice.generalCare.map(advice => `
              <div class="list-item">✓ ${advice}</div>
            `).join('')}
          ` : ''}
          ${reportData.medicalAdvice.followUp && Array.isArray(reportData.medicalAdvice.followUp) && reportData.medicalAdvice.followUp.length > 0 ? `
            <h4 style="margin: 20px 0 10px 0; color: #374151;">Follow-up Instructions:</h4>
            ${reportData.medicalAdvice.followUp.map(instruction => `
              <div class="list-item">📅 ${instruction}</div>
            `).join('')}
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      ${reportData.safetyWarnings && Array.isArray(reportData.safetyWarnings) && reportData.safetyWarnings.length > 0 ? `
      <div class="warning-section avoid-break">
        <h3 style="color: #d97706; margin-bottom: 15px;">⚠️ Safety Warnings</h3>
        ${reportData.safetyWarnings.map(warning => `
          <div class="warning-item">
            <span style="color: #d97706; margin-right: 8px; font-size: 16px;">⚠️</span>
            <span>${warning}</span>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      <div class="disclaimer avoid-break">
        <h3>⚠️ Important Medical Disclaimer</h3>
        <div class="disclaimer-text">
          <strong>This AI analysis is for informational and educational purposes only.</strong> It is <strong>NOT a substitute</strong> for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before taking any medication or making medical decisions. In case of medical emergency, seek immediate professional medical attention.
        </div>
      </div>
      
      <div class="footer">
        <p><strong>Generated by MediLens AI</strong></p>
        <p>${new Date().toLocaleDateString()} • Professional Medical Analysis System</p>
      </div>
    </body>
    </html>`
  }

  const openPrintableWindow = (reportData) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900,scrollbars=yes')
    if (!printWindow) {
      alert('Please allow popups for this site to generate PDF reports.')
      createTextReport(reportData)
      return
    }
    
    printWindow.document.write(createPrintableHTML(reportData))
    printWindow.document.close()
    printWindow.focus()
    
    // Auto-trigger print after content loads
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const createTextReport = (reportData) => {
    const textContent = `
═══════════════════════════════════════════════════
🏥 MEDILENS PRESCRIPTION ANALYSIS REPORT
═══════════════════════════════════════════════════

Analysis Method: ${reportData.analysisMethod || 'Enhanced Medical AI'}
Generated: ${new Date(reportData.timestamp).toLocaleString()}

${reportData.patientInfo && Object.keys(reportData.patientInfo).length > 0 ? `
👤 PATIENT INFORMATION:
${'─'.repeat(50)}
${Object.entries(reportData.patientInfo).map(([key, value]) => 
  value && key !== 'additionalNotes' ? `${key}: ${value}` : ''
).filter(Boolean).join('\n')}
` : ''}

${reportData.doctorInfo && Object.keys(reportData.doctorInfo).length > 0 ? `
👨‍⚕️ DOCTOR INFORMATION:
${'─'.repeat(50)}
${Object.entries(reportData.doctorInfo).map(([key, value]) => 
  value ? `${key}: ${value}` : ''
).filter(Boolean).join('\n')}
` : ''}

${reportData.diagnosis ? `
🔍 PRIMARY DIAGNOSIS:
${'─'.repeat(50)}
${reportData.diagnosis.conditions && Array.isArray(reportData.diagnosis.conditions) ? `
Conditions:
${reportData.diagnosis.conditions.map((condition, index) => `  ${index + 1}. ${condition}`).join('\n')}
` : ''}
${reportData.diagnosis.symptoms && Array.isArray(reportData.diagnosis.symptoms) ? `
Symptoms:
${reportData.diagnosis.symptoms.map(symptom => `  • ${symptom}`).join('\n')}
` : ''}
` : ''}

${reportData.medications && Array.isArray(reportData.medications) && reportData.medications.length > 0 ? `
💊 PRESCRIBED MEDICATIONS:
${'─'.repeat(50)}
${reportData.medications.map((med, index) => `
${index + 1}. ${med.prescribedName || med.correctedName || med.genericName || med.brandName || 
           med.name || med.medication || med.drug || med.medicine || `Medication ${index + 1}`}
   ${med.bangla ? `Bengali: ${med.bangla}` : ''}
   Strength: ${med.strength || med.dosage || 'Not specified'}
   Frequency: ${med.frequency || 'Not specified'}${med.timing ? ` (${med.timing})` : ''}
   Duration: ${med.duration || 'Not specified'}
   Purpose: ${med.purpose || med.mechanism || 'Not specified'}
   ${med.formulation ? `Type: ${med.formulation}` : ''}
   ${med.totalQuantity ? `Quantity: ${med.totalQuantity}` : ''}
   ${med.estimatedCost ? `Cost: ${med.estimatedCost} BDT` : ''}
`).join('')}
` : ''}

${reportData.investigations && Array.isArray(reportData.investigations) && reportData.investigations.length > 0 ? `
🔬 RECOMMENDED INVESTIGATIONS:
${'─'.repeat(50)}
${reportData.investigations.map((investigation, index) => `
${index + 1}. ${investigation.test || investigation}
   ${investigation.purpose ? `Purpose: ${investigation.purpose}` : ''}
`).join('')}
` : ''}

${reportData.medicalAdvice ? `
👨‍⚕️ MEDICAL ADVICE:
${'─'.repeat(50)}
${reportData.medicalAdvice.generalCare && Array.isArray(reportData.medicalAdvice.generalCare) ? `
General Care:
${reportData.medicalAdvice.generalCare.map(advice => `  ✓ ${advice}`).join('\n')}
` : ''}
${reportData.medicalAdvice.followUp && Array.isArray(reportData.medicalAdvice.followUp) ? `
Follow-up Instructions:
${reportData.medicalAdvice.followUp.map(instruction => `  📅 ${instruction}`).join('\n')}
` : ''}
` : ''}

${reportData.safetyWarnings && Array.isArray(reportData.safetyWarnings) && reportData.safetyWarnings.length > 0 ? `
⚠️ SAFETY WARNINGS:
${'─'.repeat(50)}
${reportData.safetyWarnings.map(warning => `  ⚠️ ${warning}`).join('\n')}
` : ''}

⚠️ IMPORTANT DISCLAIMER:
${'─'.repeat(50)}
This AI analysis is for informational and educational purposes only. 
It is NOT a substitute for professional medical advice, diagnosis, or 
treatment. Always consult with a qualified healthcare provider before 
taking any medication or making medical decisions. In case of medical 
emergency, seek immediate professional medical attention.

Generated by MediLens AI • ${new Date().toLocaleDateString()}
═══════════════════════════════════════════════════
    `
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prescription-analysis-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('PDF generation not supported. Comprehensive text report downloaded instead.')
  }

  return (
    <>
      {/* CSS for print behavior */}
      <style jsx>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
        @media screen {
          .print\\:hidden { display: block; }
          .print\\:block { display: none; }
        }
      `}</style>
      
      {/* Login Required Notice */}
      {!currentUser && (
        <div className="mb-8">
          <div className="card-enhanced bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <div className="text-white text-xl">⚠️</div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-yellow-800 mb-2 text-lg">Login Required for Full Features</h3>
                <p className="text-yellow-700 mb-4 leading-relaxed">
                  AI বিশ্লেষণের ইতিহাস সংরক্ষণ ও চ্যাট ফিচার ব্যবহারের জন্য লগইন করুন। 
                  লগইন ছাড়াও আপনি বিশ্লেষণ করতে পারেন, তবে তা সংরক্ষিত হবে না।
                </p>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="btn btn-enhanced bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2"
                >
                  <span className="mr-2">🔐</span>
                  Login Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
      {/* Progress Display */}
      {isAnalyzing && (
        <div className="fixed top-20 left-0 right-0 z-50 p-4">
          <div className="max-w-md mx-auto glass-effect rounded-2xl p-6 border border-white/20 shadow-extra">
            <div className="text-center space-y-4">
              <div className="loading-enhanced mx-auto"></div>
              <h3 className="text-lg font-semibold text-gray-800">{analysisStage}</h3>
              <div className="progress-enhanced h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Progress: {Math.round(analysisProgress)}% • Est. {estimatedTime}s remaining
              </p>
              <div className="flex justify-center items-center space-x-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span>AI Analysis</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
                  <span>Report Generation</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                  <span>Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section - Enhanced */}
      <div className="text-center mb-12">
        <div className="inline-block mb-6">
          <div className="text-6xl animate-float">🔬</div>
        </div>
        <h1 className="text-responsive-md text-gradient font-display mb-4">
          Advanced Prescription Analyzer
        </h1>
        <p className="text-lg text-white max-w-2xl mx-auto leading-relaxed">
          উন্নত AI প্রযুক্তির মাধ্যমে প্রেসক্রিপশন বিশ্লেষণ ও চিকিৎসা পরামর্শ
        </p>
        <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Analysis Method Selection - Enhanced */}
      <div className="mb-8">
        <div className="card-enhanced p-6">
          <h3 className="text-xl font-semibold mb-6 text-white text-center">Choose Analysis Method</h3>
          <div className="grid grid-cols-1 gap-4">
            <label className={`card-enhanced border-2 cursor-pointer transition-all duration-300 group ${
              analysisMethod === 'enhanced-medical' 
                ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-blue-50 scale-105' 
                : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
            }`}>
              <div className="p-6">
                <input
                  type="radio"
                  name="analysisMethod"
                  value="enhanced-medical"
                  checked={analysisMethod === 'enhanced-medical'}
                  onChange={(e) => setAnalysisMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-6 transition-all duration-300 ${
                    analysisMethod === 'enhanced-medical' 
                      ? 'bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow-primary' 
                      : 'bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-primary-200 group-hover:to-purple-300'
                  }`}>
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className={`text-xl font-bold mb-2 transition-colors ${
                      analysisMethod === 'enhanced-medical' ? 'text-primary-800' : 'text-gray-700 group-hover:text-primary-700'
                    }`}>
                      Enhanced Medical AI
                    </div>
                    <div className="text-gray-600 text-sm leading-relaxed">
                      সরাসরি ছবি বিশ্লেষণ + 50,000+ চিকিৎসা শব্দভাণ্ডার + উন্নত পরামর্শ সিস্টেম
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">AI Powered</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Bangla Support</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Medical Trained</span>
                    </div>
                  </div>
                  {analysisMethod === 'enhanced-medical' && (
                    <div className="ml-4">
                      <CheckCircle className="w-8 h-8 text-primary-600" />
                    </div>
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Upload Section - Enhanced */}
      <div className="mb-8">
        <div className="file-upload-area card-enhanced p-8 text-center min-h-[300px] flex flex-col justify-center">
          {preview ? (
            <div className="space-y-6">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Selected prescription"
                  className="max-h-80 mx-auto rounded-2xl shadow-large border-4 border-white"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={analyzePrescription}
                  disabled={isAnalyzing}
                  className="btn btn-enhanced btn-lg px-8 py-4 shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Analyzing... {Math.round(analysisProgress)}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6" />
                      <span>Start Analysis</span>
                      <div className="text-sm opacity-80">({analysisMethod === 'enhanced-medical' ? 'Enhanced AI' : 'Standard'})</div>
                    </div>
                  )}
                </button>

                <button
                  onClick={resetAnalyzer}
                  className="btn btn-outline btn-lg px-8 py-4 border-2 border-gray-400 text-gray-600 hover:bg-gray-100 hover:border-gray-500 transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload New</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-8xl mb-6 animate-float-reverse">📋</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Upload Your Prescription
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Upload a clear image of your prescription for AI-powered analysis
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <label className="btn btn-enhanced btn-lg px-8 py-4 cursor-pointer shadow-glow-primary group">
                  <div className="flex items-center gap-3">
                    <Upload className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    <span>Choose File</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                
                <div className="text-sm text-gray-500 self-center">
                  <div className="flex items-center gap-2">
                    <span>Supports:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">JPG</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">PNG</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">PDF</span>
                  </div>
                </div>
              </div>

              {/* Upload Tips */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {[
                  { icon: '📱', title: 'High Quality', desc: 'Use good lighting and focus' },
                  { icon: '📐', title: 'Full Document', desc: 'Capture entire prescription' },
                  { icon: '🔒', title: 'Secure', desc: 'Your data stays private' }
                ].map((tip, index) => (
                  <div key={index} className="glass-effect p-4 rounded-xl text-center">
                    <div className="text-3xl mb-2">{tip.icon}</div>
                    <h4 className="font-semibold text-gray-800 mb-1">{tip.title}</h4>
                    <p className="text-white text-sm">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display - Enhanced */}
      {error && (
        <div className="mb-8">
          <div className="card-enhanced bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-6 error-shake">
            <div className="flex items-center text-red-700">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">Analysis Error</h3>
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Text Display */}
      {/* {extractedText && (
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
      )} */}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Bengali Summary Display */}
          {/* <BengaliSummaryCard 
            analysis={{
              id: savedAnalysisId || Date.now(),
              timestamp: new Date().toISOString(),
              analysis: analysis,
              summary: createBengaliSummary(analysis),
              colors: getAnalysisColors(),
              extractedText: extractedText,
              analysisMethod: analysisMethod,
              medicalHistory: extractMedicalHistory(analysis),
              currentMedications: extractCurrentMedications(analysis),
              allergies: extractAllergies(analysis)
            }}
            showChatButton={!!currentUser && !!savedAnalysisId}
          /> */}

          {/* Medical Information Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-md">
            {/* <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              🏥 Medical Information
              <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                📋 স্বয়ংক্রিয় তথ্য: আপনার সর্বশেষ AI বিশ্লেষণ থেকে চিকিৎসা ইতিহাস ও বর্তমান ওষুধের তথ্য স্বয়ংক্রিয়ভাবে যোগ করা হয়েছে। প্রয়োজনে সম্পাদনা করুন।
              </span>
            </h4> */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Medical History */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📋 Medical History
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Enter each history item on a new line, or paste JSON array.
                </div>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  defaultValue={(() => {
                    const history = extractMedicalHistory(analysis)
                    return history.length > 0 ? history.join('\n') : 'No medical history detected from prescription'
                  })()}
                  placeholder="Previous medical conditions, surgeries, chronic diseases..."
                  readOnly
                />
              </div> */}

              {/* Allergies */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⚠️ Allergies
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  List any food, drug, or other allergies
                </div>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  rows="4"
                  defaultValue={(() => {
                    const allergies = extractAllergies(analysis)
                    return allergies.length > 0 ? allergies.join('\n') : 'No known allergies detected from prescription'
                  })()}
                  placeholder="Food allergies, drug allergies, environmental allergies..."
                  readOnly
                />
              </div> */}

              {/* Current Medications */}
              {/* <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💊 Current Medications
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows="6"
                  defaultValue={(() => {
                    const medications = extractCurrentMedications(analysis)
                    if (medications.length > 0) {
                      return medications.map((med, index) => 
                        `${index + 1}. ${med.name || med}${med.bangla ? ` (${med.bangla})` : ''} - ${med.strength || ''} - ${med.frequency || ''}${med.duration ? ` - ${med.duration}` : ''}${med.purpose ? ` [${med.purpose}]` : ''}`
                      ).join('\n')
                    }
                    return 'Current medications from prescription analysis'
                  })()}
                  placeholder="List current medications with dosage and frequency..."
                  readOnly
                />
              </div> */}
            </div>

            {/* Detailed Report Generator */}
            {/* <div className="mt-4 flex justify-center">
              <DetailedAnalysisReportGenerator 
                analysis={{
                  id: savedAnalysisId || Date.now(),
                  timestamp: new Date().toISOString(),
                  analysis: analysis,
                  analysisMethod: analysisMethod,
                  extractedText: extractedText,
                  imageAnalysis: analysis.imageAnalysis,
                  patientInformation: analysis.patientInformation,
                  doctorInformation: analysis.doctorInformation,
                  primaryDiagnosis: analysis.primaryDiagnosis,
                  medications: analysis.medications,
                  investigations: analysis.investigations,
                  medicalAdvice: analysis.medicalAdvice,
                  safetyWarnings: analysis.safetyWarnings,
                  costAnalysis: analysis.costAnalysis,
                  qualityMetrics: analysis.qualityMetrics
                }}
              />
            </div> */}
          </div>

          {/* Header with download */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2" />
              বিশ্লেষণ সম্পন্ন ({analysisMethod === 'enhanced-medical' ? 'Enhanced Medical AI' : 
                              analysisMethod === 'gemini-vision' ? 'Gemini Vision' : 'Google Lens'})
              {isSaving && (
                <span className="ml-3 text-sm text-blue-600 flex items-center">
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  সেভ করা হচ্ছে...
                </span>
              )}
              {savedAnalysisId && !isSaving && (
                <span className="ml-3 text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  সেভ হয়েছে
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => downloadReport('pdf')}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Opens printable medical report - use browser's print to save as PDF"
              >
                <FileDown className="w-4 h-4 mr-2" />
                📄 Print Report
              </button>
              <button
                onClick={() => downloadReport('json')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Download raw analysis data as JSON file"
              >
                <Download className="w-4 h-4 mr-2" />
                💾 Save Data
              </button>
              {currentUser && savedAnalysisId && (
                <>
                  <button
                    onClick={() => router.push(`/analysis/${savedAnalysisId}`)}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    📋 View Details
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const token = getToken()
                        const response = await fetch(`${API_BASE_URL}/analysis/${savedAnalysisId}/send-to-chat`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                        })
                        
                        if (response.ok) {
                          alert('✅ বিশ্লেষণ চ্যাটে পাঠানো হয়েছে! এখন আপনি AI Assistant এর সাথে এই বিশ্লেষণ নিয়ে আলোচনা করতে পারেন।')
                          router.push('/chat')
                        } else {
                          alert('❌ চ্যাটে পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
                        }
                      } catch (error) {
                        console.error('Error sending to chat:', error)
                        alert('❌ চ্যাটে পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
                      }
                    }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💬 চ্যাটে আলোচনা করুন
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Professional Medical Report Display - PDF Only */}
          <div className="bg-blue-600 border-2 border-gray-200 rounded-lg shadow-lg p-6 print:block hidden" id="medical-report">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 print:bg-blue-700 text-white p-8 rounded-xl mb-8 shadow-lg" style={{backgroundColor: '#1d4ed8', background: 'linear-gradient(to right, #2563eb, #1d4ed8, #1e40af)'}}>
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-3 drop-shadow-lg text-red-700">🏥 MediLens Professional Medical Analysis</h1>
                <p className="text-blue-100 text-lg font-medium">Advanced AI-Powered Prescription Intelligence System</p>
                <div className="mt-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <p className="flex items-center justify-center md:justify-start">
                      <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2 animate-pulse"></span>
                      <strong>Analysis Engine:</strong> {analysisMethod === 'enhanced-medical' ? 'Enhanced Medical AI with 50K+ Medical Terms' : 
                        analysisMethod === 'gemini-vision' ? 'Google Gemini Vision AI' : 'Google Lens OCR + AI'}
                    </p>
                    <p className="flex items-center justify-center md:justify-start">
                      <span className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
                      <strong>Generated:</strong> {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            {analysis.patientInformation && (
              <div className="mb-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-l-8 border-emerald-500 p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-emerald-800 mb-4 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                    👤
                  </div>
                  Patient Information
                  <div className="ml-3 px-3 py-1 bg-emerald-500 text-white text-sm font-medium rounded-full">
                    Personal Details
                  </div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(analysis.patientInformation).map(([key, value]) => 
                    value && key !== 'additionalNotes' ? (
                      <div key={key} className="bg-white p-4 rounded-xl border-l-4 border-emerald-400 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mr-3"></div>
                          <span className="font-bold text-emerald-700 capitalize text-lg">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        </div>
                        <span className="ml-6 text-gray-800 font-medium text-lg">{value}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Doctor Information */}
            {analysis.doctorInformation && (
              <div className="mb-8 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 border-l-8 border-violet-500 p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-violet-800 mb-4 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                    👨‍⚕️
                  </div>
                  Prescribing Physician
                  <div className="ml-3 px-3 py-1 bg-violet-500 text-white text-sm font-medium rounded-full">
                    Healthcare Provider
                  </div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(analysis.doctorInformation).map(([key, value]) => 
                    value ? (
                      <div key={key} className="bg-white p-4 rounded-xl border-l-4 border-violet-400 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mr-3"></div>
                          <span className="font-bold text-violet-700 capitalize text-lg">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        </div>
                        <span className="ml-6 text-gray-800 font-medium text-lg">{value}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Primary Diagnosis */}
            {analysis.primaryDiagnosis && (
              <div className="mb-8 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-l-8 border-amber-500 p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-amber-800 mb-4 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                    🔍
                  </div>
                  Primary Medical Diagnosis
                  <div className="ml-3 px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-full">
                    Clinical Findings
                  </div>
                </h3>
                {analysis.primaryDiagnosis.conditions && Array.isArray(analysis.primaryDiagnosis.conditions) && analysis.primaryDiagnosis.conditions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-amber-700 mb-3 text-lg flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mr-3"></div>
                      Diagnosed Conditions:
                    </h4>
                    <div className="space-y-3">
                      {analysis.primaryDiagnosis.conditions.map((condition, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl border-l-4 border-amber-400 shadow-sm hover:shadow-md transition-shadow flex items-center">
                          <span className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 shadow-sm">
                            {index + 1}
                          </span>
                          <span className="text-gray-800 font-medium text-lg">{condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.primaryDiagnosis.symptoms && Array.isArray(analysis.primaryDiagnosis.symptoms) && analysis.primaryDiagnosis.symptoms.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
                    <h4 className="font-bold text-amber-700 mb-3 text-lg flex items-center">
                      <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mr-3"></div>
                      Associated Symptoms:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.primaryDiagnosis.symptoms.map((symptom, index) => (
                        <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border-l-4 border-red-300 flex items-center">
                          <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mr-3"></div>
                          <span className="text-gray-800 font-medium">{symptom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prescribed Medications */}
            {analysis.medications && Array.isArray(analysis.medications) && analysis.medications.length > 0 && (
              <div className="mb-8 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 border-l-8 border-pink-500 p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-pink-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                    💊
                  </div>
                  Prescribed Medications
                  <div className="ml-3 px-3 py-1 bg-pink-500 text-white text-sm font-medium rounded-full">
                    {analysis.medications.length} Medication{analysis.medications.length > 1 ? 's' : ''}
                  </div>
                </h3>
                <div className="space-y-6">
                  {analysis.medications.map((medication, index) => (
                    <div key={index} className="bg-white border-2 border-pink-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-start mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4 shadow-md">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-pink-900 mb-2">
                            {medication.prescribedName || medication.correctedName || medication.genericName || medication.brandName || 
                             medication.name || medication.medication || medication.drug || medication.medicine || `Medication ${index + 1}`}
                          </h4>
                          {medication.genericName && medication.prescribedName !== medication.genericName && (
                            <div className="mb-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                Generic: {medication.genericName}
                              </span>
                            </div>
                          )}
                          {medication.bangla && (
                            <div className="mb-2">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                বাংলা: {medication.bangla}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(medication.strength || medication.dosage) && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-l-4 border-blue-400">
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mr-2"></div>
                              <span className="font-bold text-blue-700 text-sm">Strength/Dosage</span>
                            </div>
                            <p className="text-gray-800 font-medium">{medication.strength || medication.dosage}</p>
                          </div>
                        )}
                        {medication.frequency && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 border-green-400">
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-2"></div>
                              <span className="font-bold text-green-700 text-sm">Frequency</span>
                            </div>
                            <p className="text-gray-800 font-medium">{medication.frequency}</p>
                            {medication.timing && (
                              <p className="text-green-600 text-xs mt-1 font-medium">({medication.timing})</p>
                            )}
                          </div>
                        )}
                        {medication.duration && (
                          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border-l-4 border-purple-400">
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full mr-2"></div>
                              <span className="font-bold text-purple-700 text-sm">Duration</span>
                            </div>
                            <p className="text-gray-800 font-medium">{medication.duration}</p>
                          </div>
                        )}
                        {(medication.purpose || medication.mechanism) && (
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border-l-4 border-orange-400">
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mr-2"></div>
                              <span className="font-bold text-orange-700 text-sm">Purpose</span>
                            </div>
                            <p className="text-gray-800 font-medium">{medication.purpose || medication.mechanism}</p>
                          </div>
                        )}
                      </div>
                      {(medication.sideEffects || medication.instructions || medication.alternatives) && (
                        <div className="mt-4 space-y-3">
                          {medication.instructions && (
                            <div className="bg-gradient-to-r from-cyan-50 to-sky-50 p-4 rounded-xl border-l-4 border-cyan-400">
                              <div className="flex items-center mb-2">
                                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full mr-2"></div>
                                <span className="font-bold text-cyan-700 text-sm">Special Instructions</span>
                              </div>
                              <p className="text-gray-800">{medication.instructions}</p>
                            </div>
                          )}
                          {medication.sideEffects && (
                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border-l-4 border-yellow-400">
                              <div className="flex items-center mb-2">
                                <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full mr-2"></div>
                                <span className="font-bold text-yellow-700 text-sm">Potential Side Effects</span>
                              </div>
                              <p className="text-gray-800">{medication.sideEffects}</p>
                            </div>
                          )}
                          {medication.alternatives && (
                            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-xl border-l-4 border-slate-400">
                              <div className="flex items-center mb-2">
                                <div className="w-3 h-3 bg-gradient-to-r from-slate-400 to-gray-400 rounded-full mr-2"></div>
                                <span className="font-bold text-slate-700 text-sm">Alternative Options</span>
                              </div>
                              <p className="text-gray-800 text-sm">{medication.alternatives}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Investigations - Enhanced Professional Design */}
            {analysis.investigations && Array.isArray(analysis.investigations) && analysis.investigations.length > 0 && (
              <div className="mb-6 print:block bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border-l-4 border-cyan-500 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-800 to-blue-800 bg-clip-text text-transparent mb-3 flex items-center">
                  <span className="mr-2 text-cyan-600">🔬</span>
                  Recommended Investigations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.investigations.map((investigation, index) => (
                    <div key={index} className="bg-gradient-to-br from-white to-cyan-50 p-4 rounded-lg border border-cyan-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <span className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1 shadow-md">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold bg-gradient-to-r from-cyan-900 to-blue-900 bg-clip-text text-transparent mb-2">
                            {investigation.test || investigation}
                          </h4>
                          {investigation.purpose && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border-l-4 border-blue-300">
                              <span className="font-medium bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">🎯 Purpose:</span>
                              <p className="text-gray-800 text-sm mt-1">{investigation.purpose}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Advice - Enhanced Professional Design */}
            {analysis.medicalAdvice && (
              <div className="mb-6 print:block bg-gradient-to-r from-teal-50 via-emerald-50 to-green-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold bg-gradient-to-r from-teal-800 to-emerald-800 bg-clip-text text-transparent mb-3 flex items-center">
                  <span className="mr-2 text-teal-600">👨‍⚕️</span>
                  Medical Advice
                </h3>
                {analysis.medicalAdvice.generalCare && Array.isArray(analysis.medicalAdvice.generalCare) && analysis.medicalAdvice.generalCare.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent mb-3 flex items-center">
                      <span className="mr-2">🏥</span>
                      General Care Instructions:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.medicalAdvice.generalCare.map((advice, index) => (
                        <div key={index} className="bg-gradient-to-br from-white to-teal-50 p-4 rounded-lg border border-teal-200 shadow-sm">
                          <div className="flex items-start">
                            <span className="w-6 h-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">✓</span>
                            <span className="text-gray-900 font-medium">{advice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.medicalAdvice.followUp && Array.isArray(analysis.medicalAdvice.followUp) && analysis.medicalAdvice.followUp.length > 0 && (
                  <div>
                    <h4 className="font-semibold bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent mb-3 flex items-center">
                      <span className="mr-2">📅</span>
                      Follow-up Instructions:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.medicalAdvice.followUp.map((instruction, index) => (
                        <div key={index} className="bg-gradient-to-br from-white to-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-sm">
                          <div className="flex items-start">
                            <span className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">📅</span>
                            <span className="text-gray-900 font-medium">{instruction}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Safety Warnings - Enhanced Professional Design */}
            {analysis.safetyWarnings && Array.isArray(analysis.safetyWarnings) && analysis.safetyWarnings.length > 0 && (
              <div className="mb-6 print:block bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-800 to-orange-800 bg-clip-text text-transparent mb-3 flex items-center">
                  <span className="mr-2 text-yellow-600">⚠️</span>
                  Safety Warnings
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {analysis.safetyWarnings.map((warning, index) => (
                    <div key={index} className="bg-gradient-to-br from-yellow-100 to-amber-100 border-2 border-yellow-300 p-4 rounded-lg shadow-sm">
                      <div className="flex items-start">
                        <span className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3 mt-1 shadow-md">⚠️</span>
                        <span className="text-yellow-900 font-semibold text-base leading-relaxed">{warning}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Metrics - Enhanced Professional Design */}
            {analysis.qualityMetrics && (
              <div className="mb-6 print:block bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-3 flex items-center">
                  <span className="mr-2 text-blue-600">📊</span>
                  Analysis Quality Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysis.qualityMetrics).map(([key, value]) => (
                    <div key={key} className="bg-gradient-to-br from-white to-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                      <div className="flex items-center mb-2">
                        <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">📈</span>
                        <span className="font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      </div>
                      <p className="text-gray-900 font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Analysis - Enhanced Professional Design */}
            {analysis.costAnalysis && (
              <div className="mb-6 print:block bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold bg-gradient-to-r from-green-800 to-teal-800 bg-clip-text text-transparent mb-3 flex items-center">
                  <span className="mr-2 text-green-600">💰</span>
                  Cost Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysis.costAnalysis).map(([key, value]) => 
                    value && (
                      <div key={key} className="bg-gradient-to-br from-white to-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                        <div className="flex items-center mb-2">
                          <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">💵</span>
                          <span className="font-semibold bg-gradient-to-r from-green-700 to-teal-700 bg-clip-text text-transparent capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        </div>
                        <p className="text-gray-900 font-medium text-lg">{value}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Legal Disclaimer - Enhanced Professional Design */}
            <div className="print:block bg-gradient-to-r from-red-100 via-pink-100 to-rose-100 border-2 border-red-300 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold bg-gradient-to-r from-red-800 to-pink-800 bg-clip-text text-transparent mb-3 flex items-center">
                <span className="mr-2 text-red-600">⚠️</span>
                Important Medical Disclaimer
              </h3>
              <div className="bg-gradient-to-br from-white to-red-50 p-5 rounded-lg border-2 border-red-200 shadow-sm">
                <div className="flex items-start mb-4">
                  <span className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-3 mt-1 shadow-md">⚖️</span>
                  <p className="text-red-900 text-sm leading-relaxed font-medium">
                    This AI analysis is for <strong className="text-red-800">informational and educational purposes only</strong>. It is <strong className="text-red-800">NOT a substitute</strong> for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before taking any medication or making medical decisions. In case of medical emergency, seek immediate professional medical attention.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border border-red-200">
                  <p className="text-center text-red-700 font-bold text-sm">
                    Generated by <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">MediLens AI</span> • {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Analysis Display - Website Only */}
          <div className="print:hidden block">
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
          </div> {/* End Simple Analysis Display - Website Only */}

          {/* Bengali Summary Card & Report Generator */}
          <div className="mt-8 space-y-6">
            {/* BengaliSummaryCard commented out - not needed on Google Lens Test page */}
            {/*
            <BengaliSummaryCard 
              analysis={{
                id: Date.now(),
                timestamp: new Date().toISOString(),
                analysis: analysis,
                summary: createBengaliSummary(analysis),
                colors: getAnalysisColors(),
                medicalHistory: extractMedicalHistory(analysis),
                currentMedications: extractCurrentMedications(analysis),
                allergies: extractAllergies(analysis)
              }} 
              showChatButton={true} 
            />
            */}
            
            <DetailedAnalysisReportGenerator 
              analysis={{
                id: Date.now(),
                timestamp: new Date().toISOString(),
                analysisMethod: analysisMethod,
                
                // Core analysis data
                ...analysis,
                
                // Make sure all sections are included
                patientInformation: analysis.patientInformation || null,
                doctorInformation: analysis.doctorInformation || null,
                primaryDiagnosis: analysis.primaryDiagnosis || null,
                medications: analysis.medications || [],
                investigations: analysis.investigations || [],
                medicalAdvice: analysis.medicalAdvice || null,
                safetyWarnings: analysis.safetyWarnings || [],
                costAnalysis: analysis.costAnalysis || null,
                qualityMetrics: analysis.qualityMetrics || null,
                imageAnalysis: analysis.imageAnalysis || null,
                
                // Additional data for complete report
                extractedText: extractedText,
                bengaliSummary: createBengaliSummary(analysis),
                colors: getAnalysisColors()
              }} 
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="glass-effect p-6 rounded-2xl">
          <p className="text-sm text-gray-600 mb-2">
            🔬 Powered by {analysisMethod === 'enhanced-medical' ? 'Enhanced Medical AI' : 'Advanced Analysis Engine'}
          </p>
          <p className="text-xs text-gray-500">
            ⚠️ এই বিশ্লেষণ শুধুমাত্র তথ্যগত উদ্দেশ্যে। চিকিৎসকের পরামর্শ নিন।
          </p>
        </div>
      </div>
    </div>
    </>
  )
}

export default AdvancedPrescriptionAnalyzer
