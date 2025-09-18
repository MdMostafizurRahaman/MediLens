import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI for analysis
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * Alternative Prescription Analysis using Gemini Vision
 * Since Google Lens API key is not valid for Vision API,
 * we'll use Gemini's vision capabilities directly
 */
export async function POST(request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image')
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64 for Gemini Vision
    const imageBuffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = imageFile.type || 'image/jpeg'
    
    console.log('🔍 Starting Gemini Vision OCR + Analysis...')
    
    // Use Gemini Vision for both OCR and analysis in one step
    const analysisResult = await analyzeWithGeminiVision(base64Image, mimeType)
    
    return NextResponse.json({
      success: true,
      ocrSource: 'gemini-vision',
      analysis: analysisResult,
      metadata: {
        imageSize: imageBuffer.byteLength,
        processingTime: Date.now(),
        modelUsed: 'gemini-1.5-pro-vision'
      }
    })

  } catch (error) {
    console.error('❌ Gemini Vision Prescription Analysis Error:', error)
    return NextResponse.json({
      error: 'Prescription analysis failed',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * Analyze prescription using Gemini Vision model
 */
async function analyzeWithGeminiVision(base64Image, mimeType) {
  try {
    // Use Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    // Enhanced prompt for direct image analysis
    const prompt = `
    You are MediBot - an advanced medical prescription analysis system trained on extensive medical data.
    
    Analyze this prescription image and extract all medical information. Then provide a comprehensive analysis in JSON format.

    Please examine the image carefully and extract:
    1. Patient information (name, age, etc.)
    2. Doctor information and date
    3. All medications with dosages and frequencies
    4. Medical conditions/diagnoses
    5. Investigation/test recommendations
    6. Any special instructions

    Provide your analysis in this JSON format:

    {
      "imageAnalysis": {
        "textQuality": "excellent/good/fair/poor",
        "readabilityScore": "percentage 0-100%",
        "documentType": "prescription/report/other",
        "language": "bengali/english/mixed"
      },
      
      "extractedText": "Complete text extracted from the image",
      
      "patientInformation": {
        "name": "Patient name if visible",
        "age": "Age if mentioned", 
        "gender": "Gender if mentioned",
        "weight": "Weight if mentioned",
        "address": "Address if visible",
        "phoneNumber": "Phone if visible"
      },

      "doctorInformation": {
        "name": "Doctor name",
        "qualification": "Doctor qualifications",
        "designation": "Position/specialty",
        "hospital": "Hospital/clinic name",
        "date": "Prescription date"
      },

      "primaryDiagnosis": {
        "condition": "Main medical condition",
        "bangla": "রোগের বাংলা নাম",
        "severity": "mild/moderate/severe",
        "description": "Detailed explanation in Bengali",
        "icdCode": "ICD-10 code if applicable"
      },

      "medications": [
        {
          "prescribedName": "Name as written in prescription",
          "correctedName": "Corrected/standardized name",
          "genericName": "Scientific/generic name",
          "brandName": "Common brand in Bangladesh",
          "bangla": "ওষুধের বাংলা নাম",
          "strength": "Dosage strength with units",
          "formulation": "tablet/capsule/syrup/injection/cream",
          "frequency": "How often (1+0+1, BD, TDS, etc.)",
          "timing": "AC/PC/HS/empty stomach",
          "duration": "Treatment duration",
          "totalQuantity": "Total amount prescribed",
          "purpose": "What this treats (Bengali)",
          "mechanism": "How it works (Bengali)",
          "sideEffects": "Common side effects (Bengali)",
          "contraindications": "When not to use (Bengali)",
          "instructions": "Special instructions (Bengali)",
          "alternatives": "Cheaper alternatives available",
          "importance": "critical/important/supportive",
          "cost": "Approximate cost in BDT"
        }
      ],

      "investigations": [
        {
          "test": "Test name as written",
          "standardName": "Standard test name",
          "bangla": "পরীক্ষার বাংলা নাম",
          "category": "blood/urine/imaging/cardiac/other",
          "purpose": "Why this test is needed",
          "urgency": "routine/urgent/stat",
          "normalRange": "Normal values",
          "cost": "Approximate cost in BDT",
          "preparation": "Pre-test preparation"
        }
      ],

      "symptoms": [
        {
          "symptom": "Symptom as mentioned",
          "bangla": "উপসর্গের বাংলা",
          "severity": "mild/moderate/severe",
          "duration": "How long present",
          "frequency": "How often occurs"
        }
      ],

      "vitalSigns": {
        "bloodPressure": "BP reading if mentioned",
        "pulse": "Heart rate if mentioned",
        "temperature": "Body temperature if mentioned",
        "weight": "Weight if mentioned",
        "height": "Height if mentioned"
      },

      "medicalAdvice": {
        "banglaReport": "সম্পূর্ণ চিকিৎসা পরামর্শ বাংলায় যাতে থাকবে:\n- রোগের বিবরণ\n- ওষুধের ব্যবহারবিধি\n- জীবনযাত্রার পরামর্শ\n- খাদ্যাভ্যাসের নির্দেশনা\n- ব্যায়াম ও শারীরিক কার্যকলাপ\n- ফলো-আপের সময়সূচী",
        "dietaryGuidance": "খাদ্যাভ্যাস সংক্রান্ত বিস্তারিত পরামর্শ",
        "exerciseRecommendations": "ব্যায়াম ও শারীরিক কার্যকলাপের পরামর্শ",
        "lifestyleChanges": "জীবনযাত্রার পরিবর্তনের পরামর্শ",
        "followUpPlan": "পরবর্তী চেকআপ ও ফলো-আপের পরিকল্পনা",
        "emergencyWarnings": "জরুরি অবস্থার লক্ষণসমূহ"
      },

      "safetyWarnings": [
        "Critical warnings in Bengali",
        "Drug interactions to avoid", 
        "Emergency symptoms to watch for",
        "When to contact doctor immediately"
      ],

      "costAnalysis": {
        "medicationCost": "Monthly medicine cost estimate in BDT",
        "investigationCost": "Test costs in BDT",
        "totalTreatmentCost": "Overall treatment expense estimate",
        "budgetAlternatives": "Cost-effective alternatives"
      },

      "qualityMetrics": {
        "overallAccuracy": "percentage estimate",
        "clinicalCompleteness": "percentage of information extracted",
        "recommendationStrength": "high/medium/low confidence"
      }
    }

    CRITICAL INSTRUCTIONS:
    1. Extract ALL visible text from the image first
    2. Identify medicine names even if handwritten or abbreviated
    3. Correct common OCR errors for medical terms
    4. Provide comprehensive Bengali explanations for patients
    5. Include cost estimates for Bangladesh healthcare market
    6. Highlight critical drug interactions or safety concerns
    7. Focus on practical advice suitable for Bangladesh context
    8. If text is unclear, mention it in textQuality and provide best interpretation
    `

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const analysisText = response.text()

    console.log('✅ Gemini Vision analysis completed')

    // Parse JSON response
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        
        // Add processing metadata
        analysis.processingInfo = {
          modelUsed: 'gemini-1.5-pro-vision',
          analysisTimestamp: new Date().toISOString(),
          processingMethod: 'direct-vision-analysis',
          fallbackUsed: false
        }
        
        return analysis
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
    }

    // Fallback: create structured response from text
    return {
      imageAnalysis: {
        textQuality: 'uncertain',
        readabilityScore: '50%',
        documentType: 'prescription'
      },
      extractedText: analysisText.substring(0, 1000) + '...',
      medicalAdvice: {
        banglaReport: `প্রেসক্রিপশন বিশ্লেষণ:\n\n${analysisText}\n\n⚠️ গুরুত্বপূর্ণ: এই বিশ্লেষণটি AI দ্বারা করা হয়েছে। চিকিৎসকের পরামর্শ ছাড়া কোন ওষুধ খাবেন না।`
      },
      safetyWarnings: [
        'AI বিশ্লেষণ সম্পূর্ণভাবে নির্ভুল নাও হতে পারে',
        'চিকিৎসকের পরামর্শ অনুযায়ী ওষুধ সেবন করুন',
        'সন্দেহ হলে চিকিৎসকের সাথে যোগাযোগ করুন'
      ],
      processingInfo: {
        modelUsed: 'gemini-1.5-pro-vision-fallback',
        analysisTimestamp: new Date().toISOString(),
        fallbackUsed: true
      }
    }

  } catch (error) {
    console.error('Gemini Vision analysis error:', error)
    throw new Error(`Vision analysis failed: ${error.message}`)
  }
}
