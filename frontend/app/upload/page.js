'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Tesseract from 'tesseract.js'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [ocrText, setOcrText] = useState('')
  const [error, setError] = useState('')
  
  const { currentUser, getToken } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    processFile(selectedFile)
  }

  const processFile = (selectedFile) => {
    if (!selectedFile) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image (JPG, PNG) or PDF file')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setError('')

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    processFile(droppedFile)
  }

  const preprocessImage = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        // Calculate optimal size for better OCR (larger images work better)
        const maxDim = 3000 // Increased from 2000
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 4) // Max 4x scaling
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        // Advanced image preprocessing for better OCR
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Get image data for advanced processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Advanced preprocessing pipeline
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale first
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
          
          // Enhanced adaptive thresholding for medical prescriptions
          let processed
          if (gray > 160) {
            processed = 255 // Pure white background
          } else if (gray < 80) {
            processed = 0   // Pure black text
          } else {
            // Improved edge detection for medium values
            // This helps with handwritten prescriptions
            const threshold = 120
            processed = gray > threshold ? 255 : 0
          }
          
          data[i] = processed     // Red
          data[i + 1] = processed // Green
          data[i + 2] = processed // Blue
          // Alpha unchanged (data[i + 3])
        }

        // Apply noise reduction (simple median filter)
        const processedData = new Uint8ClampedArray(data)
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4
            
            // Get surrounding pixels for noise reduction
            const neighbors = []
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nIdx = ((y + dy) * canvas.width + (x + dx)) * 4
                neighbors.push(data[nIdx])
              }
            }
            
            // Apply median filter to reduce noise
            neighbors.sort((a, b) => a - b)
            const median = neighbors[Math.floor(neighbors.length / 2)]
            
            processedData[idx] = median
            processedData[idx + 1] = median
            processedData[idx + 2] = median
          }
        }

        // Apply processed data back to canvas
        const finalImageData = new ImageData(processedData, canvas.width, canvas.height)
        ctx.putImageData(finalImageData, 0, 0)
        
        // Return the processed image as blob
        canvas.toBlob(resolve, 'image/png', 1.0)
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const performOCR = async () => {
    if (!file) return

    setLoading(true)
    setOcrProgress(0)
    setError('')

    try {
      // Preprocess the image
      const processedImage = await preprocessImage(file)
      
      // Enhanced OCR with better configuration for medical prescriptions
      const { data: { text } } = await Tesseract.recognize(
        processedImage,
        'eng+ben', // Add Bengali support for local prescriptions
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100))
            }
          },
          tessedit_pageseg_mode: Tesseract.PSM.AUTO,
          tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
          // Enhanced character set for medical prescriptions
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,+:-()[]{}|/\\@#%&=_*~ \n\t',
          // Medical-specific OCR improvements
          user_defined_dpi: '400', // Increased DPI
          tessedit_create_hocr: '1',
          preserve_interword_spaces: '1',
          // Additional OCR parameters for better medical text recognition
          tessedit_do_invert: '0',
          classify_enable_learning: '1',
          classify_enable_adaptive_matcher: '1',
        }
      )

      // Advanced text cleaning and correction
      const cleanedText = cleanAndCorrectText(text)
      setOcrText(cleanedText)
      
      // Enhanced analysis
      await analyzeWithBackend(cleanedText)
      
    } catch (error) {
      console.error('OCR Error:', error)
      setError('Failed to extract text from image. Please ensure the image is clear, well-lit, and contains readable text.')
    } finally {
      setLoading(false)
      setOcrProgress(0)
    }
  }

  const cleanAndCorrectText = (text) => {
    let cleaned = text
      .replace(/[^\w\s\n.,+:()\-/\\@#%]/g, ' ') // Remove special chars but keep important ones
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim()

    // Common OCR corrections for medical prescriptions
    const corrections = {
      'O/E': 'O/E:',
      'Rx': 'Rx:',
      'Tab': 'Tab.',
      'mg': 'mg',
      'ml': 'ml',
      'OD': '1+0+0',
      'BD': '1+0+1',
      'TDS': '1+1+1',
      'QID': '1+1+1+1',
      'SOS': 'as needed',
      'AC': 'before meal',
      'PC': 'after meal',
      'HS': 'at bedtime',
      // Number corrections
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
      '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
    }

    Object.entries(corrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
      cleaned = cleaned.replace(regex, correct)
    })

    return cleaned
  }

  const analyzeWithBackend = async (extractedText) => {
    try {
      const token = getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/prescription/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalText: extractedText,
          userEmail: currentUser?.email
        }),
      })

      if (response.ok) {
        const analysisResult = await response.json()
        setResult(analysisResult)
      } else {
        // Advanced client-side analysis as fallback
        const analysisResult = await performAdvancedAnalysis(extractedText)
        setResult(analysisResult)
      }
    } catch (error) {
      console.error('Backend analysis error:', error)
      // Advanced fallback processing
      const analysisResult = await performAdvancedAnalysis(extractedText)
      setResult(analysisResult)
    }
  }

  const performAdvancedAnalysis = async (text) => {
    try {
      // First try Gemini API for comprehensive medical analysis
      const geminiResponse = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          analysisType: 'comprehensive'
        })
      })

      if (geminiResponse.ok) {
        const geminiResult = await geminiResponse.json()
        if (geminiResult.success && geminiResult.analysis) {
          // Enhance with local analysis
          const localAnalysis = {
            originalText: text,
            banglaTranslation: translateToBangla(text)
          }

          return {
            ...localAnalysis,
            ...geminiResult.analysis,
            analysisSource: 'gemini-enhanced'
          }
        }
      }
    } catch (error) {
      console.error('Gemini analysis failed, using local analysis:', error)
    }

    // Fallback to local analysis
    const analysis = {
      originalText: text,
      banglaTranslation: translateToBangla(text),
      patientInfo: extractPatientInfo(text),
      medications: extractMedications(text),
      symptoms: extractSymptoms(text),
      investigations: extractInvestigations(text),
      diagnosis: extractDiagnosis(text),
      followUp: extractFollowUp(text),
      vitalSigns: extractVitalSigns(text),
      analysis: generateDetailedAnalysis(text),
      analysisSource: 'local-fallback'
    }

    return analysis
  }

  const extractPatientInfo = (text) => {
    const patientInfo = {}
    
    // Extract patient name
    const nameMatch = text.match(/(?:Patient|Name|Mr\.|Mrs\.|Ms\.)\s*:?\s*([A-Za-z\s]+)/i)
    if (nameMatch) patientInfo.name = nameMatch[1].trim()
    
    // Extract age
    const ageMatch = text.match(/(?:Age|age)\s*:?\s*(\d+)/i)
    if (ageMatch) patientInfo.age = ageMatch[1]
    
    // Extract date
    const dateMatch = text.match(/(?:Date|date)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i)
    if (dateMatch) patientInfo.date = dateMatch[1]
    
    return patientInfo
  }

  const extractMedications = (text) => {
    const medications = []
    const lines = text.split('\n')
    
    // Common medication patterns
    const medicationPatterns = [
      /(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?)\s*(mg|ml|g|tablet|tab|cap)\s*[-:]?\s*(.*)/i,
      /(?:Tab|Cap|Tablet|Capsule)\.?\s+(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?)\s*(mg|ml|g)?\s*[-:]?\s*(.*)/i,
      /(\w+)\s+(\d+)\s*(mg|ml|g)?\s*[-:]?\s*(\d+\+\d+\+\d+|\d+\+\d+|\d+)/i
    ]
    
    lines.forEach(line => {
      medicationPatterns.forEach(pattern => {
        const match = line.match(pattern)
        if (match) {
          const medication = {
            name: match[1].trim(),
            strength: match[2] ? `${match[2]}${match[3] || 'mg'}` : 'Not specified',
            dosage: match[4] || 'As directed',
            bangla: translateMedicationToBangla(match[1].trim()),
            sideEffects: getMedicationSideEffects(match[1].trim()),
            timing: extractMedicationTiming(match[4] || ''),
            instructions: extractMedicationInstructions(line)
          }
          
          // Avoid duplicates
          if (!medications.find(med => med.name.toLowerCase() === medication.name.toLowerCase())) {
            medications.push(medication)
          }
        }
      })
    })
    
    return medications
  }

  const extractSymptoms = (text) => {
    const symptoms = []
    const symptomKeywords = [
      'fever', 'headache', 'cough', 'cold', 'pain', 'ache', 'nausea', 'vomiting',
      'diarrhea', 'constipation', 'fatigue', 'weakness', 'dizziness', 'shortness of breath',
      'chest pain', 'abdominal pain', 'back pain', 'joint pain', 'muscle pain',
      'sleep', 'appetite', 'bowel', 'tremor', 'weight'
    ]
    
    const banglaSymptoms = {
      'fever': 'জ্বর',
      'headache': 'মাথাব্যথা',
      'cough': 'কাশি',
      'cold': 'সর্দি',
      'pain': 'ব্যথা',
      'sleep': 'ঘুম',
      'appetite': 'ক্ষুধা',
      'bowel': 'পেট',
      'weight': 'ওজন'
    }
    
    symptomKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        symptoms.push({
          english: keyword,
          bangla: banglaSymptoms[keyword] || keyword,
          status: 'Present'
        })
      }
    })
    
    return symptoms
  }

  const extractInvestigations = (text) => {
    const investigations = []
    const lines = text.split('\n')
    
    // Look for investigation section
    const investigationSection = lines.find(line => 
      line.toLowerCase().includes('investigation') || 
      line.toLowerCase().includes('test') ||
      line.toLowerCase().includes('lab')
    )
    
    if (investigationSection) {
      // Common test patterns
      const testPatterns = [
        /([A-Z]+[0-9]*)\s*[-:]?\s*(\d+(?:\.\d+)?)\s*([a-zA-Z\/]+)/g,
        /(TSH|T3|T4|HbA1c|FBS|PPBS|HDL|LDL|TG|TC)\s*[-:]?\s*(\d+(?:\.\d+)?)/gi
      ]
      
      testPatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(investigationSection)) !== null) {
          investigations.push({
            name: match[1],
            value: match[2],
            unit: match[3] || '',
            interpretation: interpretTestResult(match[1], match[2])
          })
        }
      })
    }
    
    return investigations
  }

  const extractDiagnosis = (text) => {
    const diagnosisKeywords = [
      'diabetes', 'hypertension', 'thyroid', 'gastritis', 'infection',
      'allergy', 'asthma', 'arthritis', 'migraine', 'depression'
    ]
    
    const diagnosis = []
    diagnosisKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        diagnosis.push({
          condition: keyword,
          bangla: getDiagnosisBangla(keyword)
        })
      }
    })
    
    return diagnosis
  }

  const extractVitalSigns = (text) => {
    const vitals = {}
    
    // Blood pressure
    const bpMatch = text.match(/(\d{2,3})\/(\d{2,3})/i)
    if (bpMatch) {
      vitals.bloodPressure = {
        systolic: bpMatch[1],
        diastolic: bpMatch[2],
        status: interpretBloodPressure(bpMatch[1], bpMatch[2])
      }
    }
    
    // Pulse
    const pulseMatch = text.match(/(?:pulse|heart rate)\s*:?\s*(\d+)/i)
    if (pulseMatch) {
      vitals.pulse = {
        value: pulseMatch[1],
        status: interpretPulse(pulseMatch[1])
      }
    }
    
    // Weight
    const weightMatch = text.match(/(?:weight|wt)\s*:?\s*(\d+(?:\.\d+)?)/i)
    if (weightMatch) {
      vitals.weight = {
        value: weightMatch[1],
        unit: 'kg'
      }
    }
    
    return vitals
  }

  const generateDetailedAnalysis = (text) => {
    const hasSymptoms = text.toLowerCase().includes('sleep') || text.toLowerCase().includes('appetite')
    const hasMedications = text.toLowerCase().includes('tab') || text.toLowerCase().includes('mg')
    const hasTests = text.toLowerCase().includes('investigation') || text.toLowerCase().includes('tsh')
    
    let analysis = "📋 প্রেসক্রিপশন বিশ্লেষণ:\n\n"
    
    if (hasSymptoms) {
      analysis += "🔍 লক্ষণসমূহ চিহ্নিত করা হয়েছে\n"
    }
    
    if (hasMedications) {
      analysis += "💊 ওষুধের তালিকা পাওয়া গেছে\n"
    }
    
    if (hasTests) {
      analysis += "🧪 পরীক্ষার ফলাফল বিশ্লেষিত\n"
    }
    
    analysis += "\n⚠️ গুরুত্বপূর্ণ:\n"
    analysis += "• ওষুধ সেবনের আগে চিকিৎসকের পরামর্শ নিন\n"
    analysis += "• নির্দিষ্ট সময়ে ওষুধ সেবন করুন\n"
    analysis += "• পার্শ্বপ্রতিক্রিয়া দেখা দিলে চিকিৎসকের সাথে যোগাযোগ করুন\n"
    
    return analysis
  }

  // Helper functions
  const translateMedicationToBangla = (medication) => {
    const translations = {
      'Paracetamol': 'প্যারাসিটামল',
      'Omeprazole': 'ওমিপ্রাজল',
      'Metformin': 'মেটফরমিন',
      'Aspirin': 'অ্যাসপিরিন',
      'Amoxicillin': 'অ্যামক্সিসিলিন',
      'Cetirizine': 'সেটিরিজিন',
      'Thyronorm': 'থাইরোনর্ম',
      'Atorvastatin': 'এটরভাস্টেটিন'
    }
    
    return translations[medication] || medication
  }

  const getMedicationSideEffects = (medication) => {
    const sideEffects = {
      'Paracetamol': 'লিভারের ক্ষতি (অতিরিক্ত সেবনে)',
      'Omeprazole': 'মাথাব্যথা, পেট ব্যথা, ডায়রিয়া',
      'Metformin': 'পেট খারাপ, বমি ভাব, ডায়রিয়া',
      'Aspirin': 'পেটে আলসার, রক্তক্ষরণ',
      'Amoxicillin': 'অ্যালার্জিক রিঅ্যাকশন, ডায়রিয়া'
    }
    
    return sideEffects[medication] || 'চিকিৎসকের পরামর্শ অনুযায়ী সেবন করুন'
  }

  const extractFollowUp = (text) => {
    const followUpMatch = text.match(/(?:follow.?up|next visit)\s*:?\s*([^\n]+)/i)
    return followUpMatch ? followUpMatch[1].trim() : null
  }

  const translateToBangla = async (text) => {
    // Simple medication name translations (you can expand this)
    const translations = {
      'Paracetamol': 'প্যারাসিটামল',
      'Omeprazole': 'ওমিপ্রাজল',
      'Cetirizine': 'সেটিরিজিন',
      'Amoxicillin': 'অ্যামক্সিসিলিন',
      'Metformin': 'মেটফরমিন',
      'Aspirin': 'অ্যাসপিরিন',
      'Patient': 'রোগী',
      'Age': 'বয়স',
      'Doctor': 'ডাক্তার',
      'Medicine': 'ওষুধ',
      'Dosage': 'মাত্রা',
      'Before meal': 'খাবারের আগে',
      'After meal': 'খাবারের পর',
      'At night': 'রাতে',
      'Morning': 'সকালে',
      'Evening': 'সন্ধ্যায়',
      'Tab': 'ট্যাব',
      'Tablet': 'ট্যাবলেট',
      'Capsule': 'ক্যাপসুল',
      'mg': 'মিগ্রা',
      'ml': 'মিলি',
    }

    let translatedText = text
    Object.entries(translations).forEach(([english, bangla]) => {
      const regex = new RegExp(english, 'gi')
      translatedText = translatedText.replace(regex, bangla)
    })

    return translatedText
  }

  const clearAll = () => {
    setFile(null)
    setImagePreview(null)
    setResult(null)
    setOcrText('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const exportToPDF = async () => {
    if (!result) return
    
    try {
      const token = getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/prescription/export-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(result),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prescription-analysis-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to upload prescriptions</h1>
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
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.back()} 
              className="btn btn-ghost btn-circle"
            >
              ← Back
            </button>
            <div></div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">🔍 Prescription Analyzer</h1>
          <p className="text-lg text-base-content/70">
            Upload your prescription image to get detailed analysis in Bangla
          </p>
          <p className="text-sm text-info mt-2">
            ✨ Enhanced OCR • 🇧🇩 Bangla Support • 🏥 Medical Intelligence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div 
            className="card bg-base-200 shadow-xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card-body">
              <h2 className="card-title text-primary mb-4">📄 Upload Document</h2>
              
              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}
              
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  dragOver ? 'border-primary bg-primary/10 scale-105' : 'border-base-300 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-6xl mb-4">
                  {loading ? '⚡' : file ? '✅' : '📋'}
                </div>
                <p className="text-lg mb-4 font-semibold">
                  {file ? 'File Ready for Analysis' : 'Drop your prescription here'}
                </p>
                <p className="text-sm text-base-content/70 mb-4">
                  Supports: JPG, PNG, PDF (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                />
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">Preview:</p>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                </div>
              )}

              {file && (
                <div className="mt-4 p-4 bg-base-100 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-primary">📎 {file.name}</p>
                      <p className="text-sm text-base-content/70">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button onClick={clearAll} className="btn btn-ghost btn-sm">
                      🗑️ Clear
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">OCR Progress</span>
                    <span className="text-sm">{ocrProgress}%</span>
                  </div>
                  <progress className="progress progress-primary w-full" value={ocrProgress} max="100"></progress>
                  <p className="text-xs text-center mt-1 text-base-content/70">
                    Extracting text from image...
                  </p>
                </div>
              )}

              <div className="card-actions justify-end mt-6">
                <button 
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  onClick={performOCR}
                  disabled={!file || loading}
                >
                  {loading ? 'Analyzing...' : '🚀 Analyze Prescription'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div 
            className="card bg-base-200 shadow-xl"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="card-body">
              <h2 className="card-title text-primary mb-4">📊 Analysis Results</h2>
              
              {result ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Analysis Source Indicator with Quality Assessment */}
                  <div className={`alert ${
                    result.analysisSource === 'gemini-enhanced-v2' ? 'alert-success' : 
                    result.analysisSource === 'error-fallback' ? 'alert-error' : 'alert-warning'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {result.analysisSource === 'gemini-enhanced-v2' ? '✨' : 
                         result.analysisSource === 'error-fallback' ? '❌' : '⚠️'}
                      </span>
                      <div>
                        <div className="font-semibold">
                          {result.analysisSource === 'gemini-enhanced-v2' 
                            ? '🤖 Advanced Medical AI - Enhanced Analysis Model' 
                            : result.analysisSource === 'error-fallback'
                            ? '❌ Analysis Failed - Text Quality Too Poor'
                            : '📍 Basic Analysis - Limited Pattern Recognition'}
                        </div>
                        {result.textQuality && (
                          <div className="text-sm opacity-75">
                            OCR Quality: {result.textQuality === 'poor' ? '🔴 Poor' : 
                                        result.textQuality === 'fair' ? '🟡 Fair' : 
                                        result.textQuality === 'good' ? '🟢 Good' : 
                                        result.textQuality === 'excellent' ? '💚 Excellent' : '⚪ Unknown'}
                            {result.confidenceScore && ` | Confidence: ${result.confidenceScore}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Summary */}
                  {result.summary && (
                    <div className="collapse collapse-arrow bg-gradient-to-br from-blue-50 to-indigo-50">
                      <input type="checkbox" name="results-accordion" defaultChecked /> 
                      <div className="collapse-title text-lg font-medium text-blue-800">
                        📋 সম্পূর্ণ মেডিকেল বিশ্লেষণ (Complete Medical Analysis)
                      </div>
                      <div className="collapse-content"> 
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <pre className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">{result.summary}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NEW: Diseases Section - PRIMARY FOCUS */}
                  {result.diseases && result.diseases.length > 0 && (
                    <div className="collapse collapse-arrow bg-gradient-to-br from-red-50 to-pink-50">
                      <input type="checkbox" name="results-accordion" defaultChecked /> 
                      <div className="collapse-title text-lg font-medium text-red-800">
                        🏥 রোগ নির্ণয় (Diseases Diagnosed) - {result.diseases.length} টি
                      </div>
                      <div className="collapse-content"> 
                        <div className="space-y-3">
                          {result.diseases.map((disease, index) => (
                            <div key={index} className="card bg-white shadow-sm border-l-4 border-red-400">
                              <div className="card-body p-4">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-bold text-lg text-red-700">
                                    {disease.condition} {disease.bangla && `(${disease.bangla})`}
                                  </h4>
                                  <div className="flex gap-2">
                                    {disease.confidence && (
                                      <span className={`badge badge-sm ${
                                        disease.confidence === 'high' ? 'badge-success' :
                                        disease.confidence === 'medium' ? 'badge-warning' : 'badge-error'
                                      }`}>
                                        {disease.confidence}
                                      </span>
                                    )}
                                    {disease.severity && (
                                      <span className={`badge badge-sm ${
                                        disease.severity === 'severe' ? 'badge-error' : 
                                        disease.severity === 'moderate' ? 'badge-warning' : 'badge-success'
                                      }`}>
                                        {disease.severity}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {disease.description && (
                                  <p className="text-sm text-gray-700 mt-2 mb-2">{disease.description}</p>
                                )}
                                {disease.reasoning && (
                                  <p className="text-xs text-gray-500 italic">
                                    <strong>কারণ:</strong> {disease.reasoning}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NEW: Investigations Section - SECOND PRIORITY */}
                  {result.investigations && result.investigations.length > 0 && (
                    <div className="collapse collapse-arrow bg-gradient-to-br from-purple-50 to-violet-50">
                      <input type="checkbox" name="results-accordion" defaultChecked /> 
                      <div className="collapse-title text-lg font-medium text-purple-800">
                        🧪 পরীক্ষা-নিরীক্ষা (Tests & Investigations) - {result.investigations.length} টি
                      </div>
                      <div className="collapse-content"> 
                        <div className="space-y-3">
                          {result.investigations.map((test, index) => (
                            <div key={index} className="card bg-white shadow-sm border-l-4 border-purple-400">
                              <div className="card-body p-4">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-bold text-lg text-purple-700">
                                    {test.test} {test.bangla && `(${test.bangla})`}
                                  </h4>
                                </div>
                                <div className="grid md:grid-cols-3 gap-3 mt-2">
                                  {test.result && (
                                    <div>
                                      <p className="text-sm text-gray-600">
                                        <strong>ফলাফল:</strong> {test.result}
                                      </p>
                                    </div>
                                  )}
                                  {test.normalRange && (
                                    <div>
                                      <p className="text-sm text-gray-600">
                                        <strong>স্বাভাবিক মাত্রা:</strong> {test.normalRange}
                                      </p>
                                    </div>
                                  )}
                                  {test.interpretation && (
                                    <div>
                                      <p className={`text-sm font-semibold ${
                                        test.interpretation.includes('Normal') || test.interpretation.includes('স্বাভাবিক') 
                                          ? 'text-green-600' 
                                          : 'text-red-600'
                                      }`}>
                                        <strong>অবস্থা:</strong> {test.interpretation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                {test.recommendation && (
                                  <p className="text-sm text-blue-600 mt-2">
                                    <strong>পরামর্শ:</strong> {test.recommendation}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Medications - THIRD PRIORITY */}
                  {result.medications && result.medications.length > 0 && (
                    <div className="collapse collapse-arrow bg-gradient-to-br from-green-50 to-emerald-50">
                      <input type="checkbox" name="results-accordion" defaultChecked /> 
                      <div className="collapse-title text-lg font-medium text-green-800">
                        💊 ওষুধের তালিকা (Medications) - {result.medications.length} টি
                      </div>
                      <div className="collapse-content"> 
                        <div className="space-y-3">
                          {result.medications.map((med, index) => (
                            <div key={index} className="card bg-white shadow-sm border-l-4 border-green-400">
                              <div className="card-body p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-bold text-lg text-green-700">
                                      {med.name} {med.bangla && `(${med.bangla})`}
                                    </h4>
                                    {med.genericName && med.genericName !== med.name && (
                                      <p className="text-sm text-gray-600">Generic: {med.genericName}</p>
                                    )}
                                  </div>
                                  {med.confidence && (
                                    <span className={`badge badge-sm ${
                                      med.confidence === 'high' ? 'badge-success' :
                                      med.confidence === 'medium' ? 'badge-warning' : 'badge-error'
                                    }`}>
                                      {med.confidence}
                                    </span>
                                  )}
                                </div>
                                <div className="grid md:grid-cols-2 gap-3 mt-3">
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      <strong>শক্তি:</strong> {med.strength || 'উল্লেখ নেই'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <strong>মাত্রা:</strong> {med.frequency || med.dosage || 'চিকিৎসকের নির্দেশমতো'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <strong>সময়:</strong> {med.timing || 'উল্লেখ নেই'}
                                    </p>
                                    {med.duration && (
                                      <p className="text-sm text-gray-600">
                                        <strong>কত দিন:</strong> {med.duration}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    {med.purpose && (
                                      <p className="text-sm text-blue-600">
                                        <strong>কাজ:</strong> {med.purpose}
                                      </p>
                                    )}
                                    {med.instructions && (
                                      <p className="text-sm text-indigo-600">
                                        <strong>নির্দেশনা:</strong> {med.instructions}
                                      </p>
                                    )}
                                    {med.sideEffects && (
                                      <p className="text-sm text-orange-600">
                                        <strong>পার্শ্বপ্রতিক্রিয়া:</strong> {med.sideEffects}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Diagnosis - REMOVED (replaced by diseases section above) */}
                  {/* Legacy support for old analysis format */}
                  {result.diagnosis && result.diagnosis.length > 0 && !result.diseases && (
                    <div className="collapse collapse-arrow bg-gradient-to-br from-red-50 to-pink-50">
                      <input type="checkbox" name="results-accordion" defaultChecked /> 
                      <div className="collapse-title text-lg font-medium text-red-800">
                        🏥 Diagnosis & Conditions
                      </div>
                      <div className="collapse-content"> 
                        <div className="space-y-3">
                          {result.diagnosis.map((diag, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-400">
                              <div className="flex items-start justify-between">
                                <h4 className="font-bold text-lg text-red-700">
                                  {diag.condition} {diag.bangla && `(${diag.bangla})`}
                                </h4>
                                {diag.confidence && (
                                  <span className={`badge badge-sm ${
                                    diag.confidence === 'high' ? 'badge-success' :
                                    diag.confidence === 'medium' ? 'badge-warning' : 'badge-error'
                                  }`}>
                                    {diag.confidence} confidence
                                  </span>
                                )}
                              </div>
                              {diag.severity && (
                                <span className={`badge ${
                                  diag.severity === 'severe' ? 'badge-error' : 
                                  diag.severity === 'moderate' ? 'badge-warning' : 'badge-success'
                                }`}>
                                  {diag.severity}
                                </span>
                              )}
                              {diag.description && (
                                <p className="text-sm text-gray-700 mt-2">{diag.description}</p>
                              )}
                              {diag.reasoning && (
                                <p className="text-xs text-gray-500 mt-2 italic">
                                  <strong>Reasoning:</strong> {diag.reasoning}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Symptoms */}
                  {result.symptoms && result.symptoms.length > 0 && (
                    <div className="collapse collapse-arrow bg-gradient-to-br from-yellow-50 to-amber-50">
                      <input type="checkbox" name="results-accordion" defaultChecked /> 
                      <div className="collapse-title text-lg font-medium text-yellow-800">
                        🤒 Symptoms Identified
                      </div>
                      <div className="collapse-content"> 
                        <div className="grid md:grid-cols-2 gap-3">
                          {result.symptoms.map((symptom, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-yellow-400">
                              <h4 className="font-semibold text-yellow-700">
                                {symptom.symptom} {symptom.bangla && `(${symptom.bangla})`}
                              </h4>
                              {symptom.severity && (
                                <span className="badge badge-outline badge-sm">{symptom.severity}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Investigations */}
                  {(result.investigations && result.investigations.length > 0) ? null : 
                   /* Show legacy investigations if new format not available */
                   (result.investigations && result.investigations.length > 0 && (
                    <div className="collapse collapse-arrow bg-gradient-to-br from-purple-50 to-violet-50">
                      <input type="checkbox" name="results-accordion" defaultChecked /> 
                      <div className="collapse-title text-lg font-medium text-purple-800">
                        🧪 Test Results & Investigations
                      </div>
                      <div className="collapse-content"> 
                        <div className="space-y-3">
                          {result.investigations.map((test, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-400">
                              <h4 className="font-bold text-lg text-purple-700">{test.test}</h4>
                              <div className="grid md:grid-cols-3 gap-2 mt-2">
                                {test.result && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Result:</strong> {test.result}
                                  </p>
                                )}
                                {test.normalRange && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Normal Range:</strong> {test.normalRange}
                                  </p>
                                )}
                                {test.interpretation && (
                                  <p className={`text-sm font-semibold ${
                                    test.interpretation.includes('Normal') || test.interpretation.includes('স্বাভাবিক') 
                                      ? 'text-green-600' 
                                      : 'text-red-600'
                                  }`}>
                                    <strong>Status:</strong> {test.interpretation}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* NEW: Health Education Section */}
                  {result.healthEducation && (
                    <div className="collapse collapse-arrow bg-gradient-to-br from-emerald-50 to-teal-50">
                      <input type="checkbox" name="results-accordion" /> 
                      <div className="collapse-title text-lg font-medium text-emerald-800">
                        📚 স্বাস্থ্য শিক্ষা (Health Education)
                      </div>
                      <div className="collapse-content"> 
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <pre className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">{result.healthEducation}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NEW: Follow-up Plan */}
                  {result.followUpPlan && (
                    <div className="collapse collapse-arrow bg-gradient-to-br from-orange-50 to-amber-50">
                      <input type="checkbox" name="results-accordion" /> 
                      <div className="collapse-title text-lg font-medium text-orange-800">
                        📅 ফলো-আপ পরিকল্পনা (Follow-up Plan)
                      </div>
                      <div className="collapse-content"> 
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <pre className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">{result.followUpPlan}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NEW: Emergency Instructions */}
                  {result.emergencyInstructions && (
                    <div className="alert alert-error">
                      <div>
                        <span className="text-2xl">🚨</span>
                        <div>
                          <h3 className="font-bold text-lg">জরুরি নির্দেশনা (Emergency Instructions)</h3>
                          <pre className="text-sm whitespace-pre-wrap mt-2">{result.emergencyInstructions}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Patient Info */}
                  {result.patientInfo && Object.keys(result.patientInfo).length > 0 && (
                    <div className="collapse collapse-arrow bg-gradient-to-br from-indigo-50 to-blue-50">
                      <input type="checkbox" name="results-accordion" /> 
                      <div className="collapse-title text-lg font-medium text-indigo-800">
                        👤 Patient Information
                      </div>
                      <div className="collapse-content"> 
                        <div className="bg-white p-4 rounded-lg shadow-sm grid md:grid-cols-3 gap-4">
                          {result.patientInfo.name && (
                            <p className="text-sm"><strong>Name:</strong> {result.patientInfo.name}</p>
                          )}
                          {result.patientInfo.age && (
                            <p className="text-sm"><strong>Age:</strong> {result.patientInfo.age}</p>
                          )}
                          {result.patientInfo.gender && (
                            <p className="text-sm"><strong>Gender:</strong> {result.patientInfo.gender}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warnings Section */}
                  {result.warnings && result.warnings.length > 0 && (
                    <div className="alert alert-warning">
                      <div>
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <h3 className="font-bold text-lg">Important Warnings</h3>
                          <ul className="list-disc list-inside mt-2 text-sm">
                            {result.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback Sections for Local Analysis */}
                  <div className="collapse collapse-arrow bg-base-100">
                    <input type="checkbox" name="results-accordion" /> 
                    <div className="collapse-title text-lg font-medium">
                      📝 Original Text (OCR Output)
                    </div>
                    <div className="collapse-content"> 
                      <pre className="text-sm whitespace-pre-wrap bg-base-200 p-4 rounded">{result.originalText}</pre>
                    </div>
                  </div>

                  {result.banglaTranslation && (
                    <div className="collapse collapse-arrow bg-base-100">
                      <input type="checkbox" name="results-accordion" /> 
                      <div className="collapse-title text-lg font-medium">
                        🇧🇩 Bangla Translation
                      </div>
                      <div className="collapse-content"> 
                        <pre className="text-sm whitespace-pre-wrap bg-base-200 p-4 rounded">{result.banglaTranslation}</pre>
                      </div>
                    </div>
                  )}

                  {/* Fallback Analysis Display */}
                  {result.analysis && !result.summary && (
                    <div className="alert alert-info">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="text-sm">{result.analysis}</span>
                    </div>
                  )}

                  <div className="card-actions justify-end mt-6 space-x-2">
                    <button 
                      onClick={exportToPDF}
                      className="btn btn-secondary btn-sm"
                    >
                      📄 Export PDF
                    </button>
                    <a 
                      href="/chat" 
                      className="btn btn-accent btn-sm"
                    >
                      💬 Ask Questions
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-base-content/70 text-lg">
                    Upload and analyze a prescription to see detailed results
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-base-content/50">
                    <p>✨ Advanced OCR with Bengali support</p>
                    <p>🏥 Medical terminology recognition</p>
                    <p>💊 Medication side effects & dosage</p>
                    <p>📱 Mobile-friendly analysis</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a href="/vitals" className="card bg-primary text-primary-content shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body text-center">
              <h3 className="card-title justify-center">🩺 Check Vitals</h3>
              <p>Monitor your health parameters</p>
            </div>
          </a>
          <a href="/doctors" className="card bg-secondary text-secondary-content shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body text-center">
              <h3 className="card-title justify-center">👨‍⚕️ Find Doctors</h3>
              <p>Browse verified medical professionals</p>
            </div>
          </a>
          <a href="/chat" className="card bg-accent text-accent-content shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body text-center">
              <h3 className="card-title justify-center">💬 AI Assistant</h3>
              <p>Get medical guidance in Bangla</p>
            </div>
          </a>
        </motion.div>
      </div>
    </div>
  )
}
