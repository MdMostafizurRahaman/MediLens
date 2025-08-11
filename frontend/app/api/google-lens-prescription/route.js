import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI for analysis
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * Google Lens API Integration for Prescription Analysis
 * Combines Google Lens OCR with fine-tuned medical model
 */
export async function POST(request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image')
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64 for Google Lens API
    const imageBuffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    
    console.log('🔍 Starting Google Lens OCR extraction...')
    
    // Step 1: Extract text using Google Lens API
    const lensResult = await extractTextWithGoogleLens(base64Image)
    
    if (!lensResult.success) {
      return NextResponse.json({ 
        error: 'Google Lens extraction failed', 
        details: lensResult.error 
      }, { status: 500 })
    }

    console.log('✅ Google Lens extraction successful')
    console.log('Extracted text length:', lensResult.text.length)

    // Step 2: Analyze prescription with fine-tuned model
    const analysisResult = await analyzePrescriptionWithFineTunedModel(lensResult.text)
    
    return NextResponse.json({
      success: true,
      ocrSource: 'google-lens',
      ocrConfidence: lensResult.confidence,
      extractedText: lensResult.text,
      analysis: analysisResult,
      metadata: {
        imageSize: imageBuffer.byteLength,
        processingTime: Date.now(),
        modelUsed: 'google-lens + fine-tuned-gemini'
      }
    })

  } catch (error) {
    console.error('❌ Google Lens Prescription Analysis Error:', error)
    return NextResponse.json({
      error: 'Prescription analysis failed',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * Extract text from image using Google Lens API
 */
async function extractTextWithGoogleLens(base64Image) {
  try {
    const GOOGLE_LENS_API_KEY = process.env.GOOGLE_LENS_API
    
    if (!GOOGLE_LENS_API_KEY) {
      throw new Error('Google Lens API key not configured')
    }

    // Google Lens API endpoint (using Google Vision API as alternative)
    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_LENS_API_KEY}`
    
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1
            },
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            }
          ],
          imageContext: {
            languageHints: ['en', 'bn'] // English and Bengali
          }
        }
      ]
    }

    const response = await fetch(visionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.responses && result.responses[0]) {
      const textAnnotations = result.responses[0].textAnnotations
      const fullTextAnnotation = result.responses[0].fullTextAnnotation
      
      if (fullTextAnnotation) {
        return {
          success: true,
          text: fullTextAnnotation.text,
          confidence: calculateAverageConfidence(fullTextAnnotation.pages),
          detectedLanguages: extractLanguages(fullTextAnnotation.pages),
          wordCount: fullTextAnnotation.text.split(/\s+/).length
        }
      } else if (textAnnotations && textAnnotations.length > 0) {
        return {
          success: true,
          text: textAnnotations[0].description,
          confidence: Math.round(textAnnotations[0].boundingPoly ? 90 : 70),
          detectedLanguages: ['unknown'],
          wordCount: textAnnotations[0].description.split(/\s+/).length
        }
      }
    }

    return {
      success: false,
      error: 'No text detected in image'
    }

  } catch (error) {
    console.error('Google Lens API Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Analyze prescription using fine-tuned Gemini model
 */
async function analyzePrescriptionWithFineTunedModel(extractedText) {
  try {
    // Load fine-tuned model if available, otherwise use base model
    let model
    try {
      // Try to use fine-tuned model first
      model = genAI.getGenerativeModel({ 
        model: 'tunedModels/medical-terminology-assistant'
      })
      console.log('🎯 Using fine-tuned medical model')
    } catch (error) {
      console.log('⚠️ Fine-tuned model not available, using base model')
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    }

    // Enhanced prompt that leverages training data
    const prompt = `
    You are MediLens AI - an advanced medical prescription analysis system trained on extensive medical terminology data.
    
    EXTRACTED PRESCRIPTION TEXT (via Google Lens OCR):
    "${extractedText}"

    Using your medical terminology training, analyze this prescription and provide a comprehensive medical report in the following JSON format:

    {
      "ocrAnalysis": {
        "textQuality": "excellent/good/fair/poor",
        "medicalTermsDetected": "number of medical terms found",
        "ocrCorrections": ["list of corrections made to garbled text"],
        "confidence": "percentage 0-100%"
      },
      
      "patientInformation": {
        "name": "Patient name if visible",
        "age": "Age if mentioned",
        "gender": "Gender if mentioned",
        "weight": "Weight if mentioned",
        "allergies": "Known allergies"
      },

      "primaryDiagnosis": {
        "condition": "Main medical condition",
        "bangla": "রোগের বাংলা নাম",
        "severity": "mild/moderate/severe",
        "description": "Detailed explanation in Bengali",
        "symptoms": "Associated symptoms"
      },

      "medications": [
        {
          "prescribedName": "Name as written (corrected from OCR)",
          "genericName": "Scientific/generic name",
          "brandName": "Common brand in Bangladesh",
          "bangla": "ওষুধের বাংলা নাম",
          "strength": "Dosage strength",
          "frequency": "How often (1+0+1, BD, TDS, etc.)",
          "duration": "Treatment duration",
          "purpose": "What this treats (Bengali)",
          "sideEffects": "Common side effects (Bengali)",
          "instructions": "Special instructions (Bengali)",
          "alternatives": "Cheaper alternatives available",
          "importance": "critical/important/supportive"
        }
      ],

      "investigations": [
        {
          "test": "Test name",
          "bangla": "পরীক্ষার বাংলা নাম",
          "purpose": "Why this test is needed",
          "normalRange": "Normal values",
          "urgency": "routine/urgent/stat",
          "cost": "Approximate cost in BDT"
        }
      ],

      "medicalAdvice": {
        "banglaReport": "Complete medical advice in Bengali covering condition, medications, lifestyle",
        "dietaryGuidance": "খাদ্যাভ্যাস সংক্রান্ত পরামর্শ",
        "exerciseRecommendations": "ব্যায়াম ও শারীরিক কার্যকলাপ",
        "followUpPlan": "পরবর্তী চেকআপের পরিকল্পনা",
        "emergencyWarnings": "জরুরি অবস্থার লক্ষণসমূহ"
      },

      "safetyWarnings": [
        "Critical warnings in Bengali",
        "Drug interactions to avoid",
        "Emergency symptoms to watch"
      ],

      "costAnalysis": {
        "estimatedMedicationCost": "Monthly medicine cost in BDT",
        "investigationCost": "Test costs in BDT",
        "totalTreatmentCost": "Overall treatment expense"
      },

      "qualityScore": {
        "overallAccuracy": "percentage",
        "terminologyCorrectness": "percentage",
        "clinicalCompleteness": "percentage"
      }
    }

    CRITICAL INSTRUCTIONS:
    1. Use your medical terminology training to correct OCR errors
    2. Identify medicine names even if misspelled or abbreviated
    3. Provide Bengali explanations for patient understanding
    4. Include cost estimates for Bangladesh market
    5. Highlight any critical drug interactions or safety concerns
    6. Focus on practical advice for patients in Bangladesh
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    // Parse JSON response
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        
        // Add metadata
        analysis.processingInfo = {
          modelUsed: 'fine-tuned-medical-terminology',
          analysisTimestamp: new Date().toISOString(),
          textLength: extractedText.length,
          processingMethod: 'google-lens-enhanced'
        }
        
        return analysis
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
    }

    // Fallback: create structured response
    return {
      ocrAnalysis: {
        textQuality: 'uncertain',
        confidence: '50%',
        ocrCorrections: []
      },
      medicalAdvice: {
        banglaReport: `প্রেসক্রিপশন বিশ্লেষণ:\n\n${analysisText}\n\n⚠️ গুরুত্বপূর্ণ: এই বিশ্লেষণটি শুধুমাত্র তথ্যের জন্য। চিকিৎসকের পরামর্শ ছাড়া কোন ওষুধ খাবেন না।`
      },
      safetyWarnings: [
        'চিকিৎসকের পরামর্শ অনুযায়ী ওষুধ সেবন করুন',
        'নির্দিষ্ট সময় অন্তর ফলো-আপ করুন'
      ],
      processingInfo: {
        modelUsed: 'fallback-analysis',
        analysisTimestamp: new Date().toISOString()
      }
    }

  } catch (error) {
    console.error('Medical analysis error:', error)
    throw new Error(`Medical analysis failed: ${error.message}`)
  }
}

/**
 * Calculate average confidence from Google Vision API pages
 */
function calculateAverageConfidence(pages) {
  if (!pages || pages.length === 0) return 75

  let totalConfidence = 0
  let wordCount = 0

  pages.forEach(page => {
    page.blocks?.forEach(block => {
      block.paragraphs?.forEach(paragraph => {
        paragraph.words?.forEach(word => {
          if (word.confidence) {
            totalConfidence += word.confidence * 100
            wordCount++
          }
        })
      })
    })
  })

  return wordCount > 0 ? Math.round(totalConfidence / wordCount) : 75
}

/**
 * Extract detected languages from Google Vision API response
 */
function extractLanguages(pages) {
  const languages = new Set()
  
  pages?.forEach(page => {
    if (page.property?.detectedLanguages) {
      page.property.detectedLanguages.forEach(lang => {
        languages.add(lang.languageCode)
      })
    }
  })

  return Array.from(languages)
}
