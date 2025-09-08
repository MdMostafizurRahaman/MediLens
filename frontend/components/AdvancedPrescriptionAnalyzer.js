'use client'

import React, { useState, useRef } from 'react'
import { Camera, Upload, FileText, Loader2, CheckCircle, AlertCircle, Download, Eye, Brain, FileDown } from 'lucide-react'


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

  // Helper function to safely get array data
  const safeArray = (data) => {
    return Array.isArray(data) ? data : []
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
      
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          🔬 Advanced Prescription Analyzer
        </h1>
        {/* <p className="text-gray-600">
          Google Lens API + Gemini Vision AI দিয়ে প্রেসক্রিপশন বিশ্লেষণ
        </p> */}
      </div>

      {/* Analysis Method Selection */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        {/* <h3 className="text-lg font-semibold mb-3 text-gray-800">বিশ্লেষণ পদ্ধতি নির্বাচন করুন:</h3> */}
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
                <div className="text-sm text-gray-600">সরাসরি ছবি বিশ্লেষণ + চিকিৎসা পরামর্শ</div>
              </div>
            </div>
          </label>

          {/* <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
          </label> */}
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
                {/* <label className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700">
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
                </label> */}
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
          {/* Header with download */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2" />
              বিশ্লেষণ সম্পন্ন ({analysisMethod === 'enhanced-medical' ? 'Enhanced Medical AI' : 
                              analysisMethod === 'gemini-vision' ? 'Gemini Vision' : 'Google Lens'})
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
    </>
  )
}

export default AdvancedPrescriptionAnalyzer
