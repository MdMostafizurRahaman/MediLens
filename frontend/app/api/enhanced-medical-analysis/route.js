import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * Enhanced Prescription Analysis using Medical Knowledge Base
 * Since fine-tuning is not available, we'll use prompt engineering with medical training data
 */
export async function POST(request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image')
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64
    const imageBuffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mimeType = imageFile.type || 'image/jpeg'
    
    console.log('🧠 Starting Enhanced Medical Analysis with Knowledge Base...')
    
    // Load medical knowledge from training data
    const medicalKnowledge = await loadMedicalKnowledge()
    
    // Analyze with enhanced medical context
    const analysisResult = await analyzeWithMedicalKnowledge(base64Image, mimeType, medicalKnowledge)
    
    return NextResponse.json({
      success: true,
      ocrSource: 'gemini-vision-enhanced',
      analysis: analysisResult,
      metadata: {
        imageSize: imageBuffer.byteLength,
        processingTime: Date.now(),
        modelUsed: 'gemini-2.5-flash-with-medical-kb',
        knowledgeBaseSize: medicalKnowledge.terms.length
      }
    })

  } catch (error) {
    console.error('❌ Enhanced Medical Analysis Error:', error)
    return NextResponse.json({
      error: 'Enhanced analysis failed',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * Load medical knowledge base from training data
 */
async function loadMedicalKnowledge() {
  try {
    // Go up one directory from frontend to find training_data.json in the root
    const trainingDataPath = path.join(process.cwd(), '..', 'training_data.json')
    const trainingData = JSON.parse(fs.readFileSync(trainingDataPath, 'utf8'))
    
    // Extract unique medical terms and explanations
    const medicalTerms = new Map()
    const categories = new Set()
    
    trainingData.forEach(item => {
      // Extract medical terms from input/output
      if (item.text_input.includes('Define the medical term:')) {
        const term = item.text_input.replace('Define the medical term: ', '').trim()
        const explanation = item.text_output.split(' (Category:')[0]
        const category = item.text_output.includes('(Category:') 
          ? item.text_output.split('(Category: ')[1].replace(')', '')
          : 'Medical Term'
        
        medicalTerms.set(term.toLowerCase(), {
          term,
          explanation,
          category
        })
        categories.add(category)
      }
    })
    
    return {
      terms: Array.from(medicalTerms.values()),
      categories: Array.from(categories),
      totalTerms: medicalTerms.size
    }
  } catch (error) {
    console.error('Error loading medical knowledge:', error)
    return {
      terms: [],
      categories: ['Medical Term'],
      totalTerms: 0
    }
  }
}

/**
 * Analyze prescription with medical knowledge base context
 */
async function analyzeWithMedicalKnowledge(base64Image, mimeType, medicalKnowledge) {
  try {
    // Use latest Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create comprehensive medical context from knowledge base
    const medicalContext = createMedicalContext(medicalKnowledge)

    // Enhanced prompt with medical knowledge
    const prompt = `
    You are MediLens AI - an advanced medical prescription analysis system with access to a comprehensive medical knowledge base containing ${medicalKnowledge.totalTerms} medical terms.

    MEDICAL KNOWLEDGE BASE CONTEXT:
    ${medicalContext}

    Your task is to analyze this prescription image and provide detailed medical analysis using the knowledge base above.

    ANALYSIS INSTRUCTIONS:
    1. Extract all text from the prescription image
    2. Identify patient information, doctor details, medications, and diagnoses
    3. Use the medical knowledge base to provide accurate explanations
    4. Provide Bengali translations for medical terms
    5. Include cost estimates for Bangladesh healthcare market
    6. Highlight safety warnings and drug interactions

    Provide analysis in this exact JSON format:

    {
      "imageAnalysis": {
        "textQuality": "excellent/good/fair/poor",
        "readabilityScore": "percentage",
        "documentType": "prescription/report/referral",
        "language": "bengali/english/mixed",
        "extractionMethod": "gemini-vision-enhanced"
      },
      
      "extractedText": "Complete text extracted from image",
      
      "patientInformation": {
        "name": "Patient name if visible",
        "age": "Age with unit",
        "gender": "Gender if mentioned",
        "weight": "Weight if mentioned",
        "address": "Address if visible",
        "contactNumber": "Phone if visible"
      },

      "doctorInformation": {
        "name": "Doctor name",
        "qualification": "Degrees/certifications",
        "designation": "Specialty or position",
        "hospital": "Institution name",
        "registrationNumber": "Medical registration if visible",
        "date": "Prescription date"
      },

      "primaryDiagnosis": {
        "condition": "Main diagnosed condition",
        "bangla": "রোগের বাংলা নাম (use knowledge base)",
        "severity": "mild/moderate/severe/chronic",
        "description": "Detailed explanation in Bengali using medical knowledge",
        "symptoms": "Associated symptoms mentioned",
        "icdCode": "ICD-10 code if applicable"
      },

      "medications": [
        {
          "prescribedName": "Exact name as written",
          "correctedName": "Standardized medication name",
          "genericName": "Active ingredient/generic name",
          "brandName": "Common brand in Bangladesh",
          "bangla": "ওষুধের বাংলা নাম",
          "strength": "Dosage strength with units",
          "formulation": "tablet/capsule/syrup/injection/cream/drops",
          "frequency": "Dosing frequency (1+0+1, BD, TDS, etc.)",
          "timing": "AC/PC/HS/empty stomach",
          "duration": "Treatment duration",
          "totalQuantity": "Total amount prescribed",
          "purpose": "What condition this treats (Bengali)",
          "mechanism": "How the medicine works (Bengali)",
          "sideEffects": "Common side effects (Bengali)",
          "contraindications": "When not to use (Bengali)",
          "instructions": "Special taking instructions (Bengali)",
          "alternatives": "Cheaper generic alternatives in Bangladesh",
          "importance": "critical/important/supportive",
          "estimatedCost": "Approximate cost in BDT"
        }
      ],

      "investigations": [
        {
          "test": "Investigation name as written",
          "standardName": "Standard test name",
          "bangla": "পরীক্ষার বাংলা নাম",
          "category": "blood/urine/imaging/cardiac/neurological",
          "purpose": "Why this test is recommended (Bengali)",
          "urgency": "routine/urgent/stat",
          "normalRange": "Normal reference values",
          "preparation": "Pre-test preparation required",
          "estimatedCost": "Approximate cost in BDT",
          "availability": "Where available in Bangladesh"
        }
      ],

      "symptoms": [
        {
          "symptom": "Symptom as mentioned",
          "bangla": "উপসর্গের বাংলা নাম",
          "severity": "mild/moderate/severe",
          "duration": "How long present",
          "frequency": "How often occurs",
          "relatedCondition": "Associated medical condition"
        }
      ],

      "vitalSigns": {
        "bloodPressure": "BP reading if mentioned",
        "pulse": "Heart rate if given",
        "temperature": "Body temperature",
        "weight": "Patient weight",
        "height": "Patient height",
        "bmi": "BMI if calculable",
        "respiratoryRate": "Breathing rate if noted"
      },

      "medicalAdvice": {
        "comprehensiveReport": "সম্পূর্ণ চিকিৎসা পরামর্শ বাংলায়:\\n\\n১. রোগের বিবরণ ও কারণ\\n২. ওষুধের সঠিক ব্যবহারবিধি\\n৩. খাদ্যাভ্যাস ও জীবনযাত্রার পরামর্শ\\n৪. ব্যায়াম ও শারীরিক কার্যকলাপ\\n৫. নিয়মিত পর্যবেক্ষণ ও ফলো-আপ\\n৬. জরুরি অবস্থার লক্ষণ",
        "dietaryGuidance": "খাদ্যাভ্যাস সংক্রান্ত বিস্তারিত পরামর্শ",
        "exerciseRecommendations": "ব্যায়াম ও শারীরিক কার্যকলাপের নির্দেশনা",
        "lifestyleModifications": "জীবনযাত্রার পরিবর্তনের পরামর্শ",
        "followUpSchedule": "পরবর্তী চেকআপের সময়সূচী",
        "emergencyWarnings": "জরুরি অবস্থার লক্ষণসমূহ যখন তাৎক্ষণিক চিকিৎসা প্রয়োজন"
      },

      "safetyWarnings": [
        "Critical drug interactions or contraindications (Bengali)",
        "Overdose symptoms to watch for (Bengali)",
        "When to stop medication immediately (Bengali)",
        "Emergency contact guidance (Bengali)"
      ],

      "costAnalysis": {
        "medicationCost": "Estimated monthly medicine cost in BDT",
        "investigationCost": "Total test costs in BDT",
        "followUpCost": "Expected follow-up consultation costs",
        "totalTreatmentCost": "Overall treatment expense estimate",
        "insuranceCoverage": "What may be covered by insurance",
        "budgetAlternatives": "Cost-effective treatment alternatives"
      },

      "drugInteractions": [
        {
          "medications": "Which medicines interact",
          "severity": "mild/moderate/severe",
          "effect": "What happens when combined",
          "recommendation": "What to do (Bengali)"
        }
      ],

      "qualityMetrics": {
        "overallAccuracy": "Confidence percentage in analysis",
        "knowledgeBaseMatches": "Number of terms matched from KB",
        "clinicalCompleteness": "Percentage of expected information extracted",
        "recommendationStrength": "High/Medium/Low confidence in recommendations"
      },

      "processingInfo": {
        "analysisTimestamp": "${new Date().toISOString()}",
        "knowledgeBaseSize": "${medicalKnowledge.totalTerms} medical terms",
        "enhancementLevel": "medical-knowledge-enhanced",
        "model": "gemini-2.5-flash-with-medical-context"
      }
    }

    CRITICAL REQUIREMENTS:
    1. Use the medical knowledge base to provide accurate explanations for any medical terms found
    2. If a medical term is found in the prescription that matches the knowledge base, use the exact explanation provided
    3. Translate all medical advice into clear, simple Bengali that patients can understand
    4. Provide realistic cost estimates for Bangladesh healthcare system
    5. Include safety warnings for any potentially dangerous drug combinations
    6. Focus on practical, actionable advice for Bangladesh context
    7. If prescription text is unclear, indicate this in textQuality and provide best interpretation
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

    console.log('✅ Enhanced medical analysis completed')

    // Parse JSON response
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        return analysis
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
    }

    // Fallback response
    return {
      imageAnalysis: {
        textQuality: 'uncertain',
        readabilityScore: '50%',
        extractionMethod: 'gemini-vision-enhanced-fallback'
      },
      extractedText: analysisText.substring(0, 1000) + '...',
      medicalAdvice: {
        comprehensiveReport: `উন্নত চিকিৎসা বিশ্লেষণ:\n\n${analysisText}\n\n⚠️ গুরুত্বপূর্ণ: এই AI বিশ্লেষণ শুধুমাত্র তথ্যগত উদ্দেশ্যে। চিকিৎসকের পরামর্শ ছাড়া কোন ওষুধ খাবেন না।`
      },
      safetyWarnings: [
        'Enhanced AI বিশ্লেষণ সম্পূর্ণভাবে নির্ভুল নাও হতে পারে',
        'চিকিৎসকের পরামর্শ অনুযায়ী ওষুধ সেবন করুন',
        'সন্দেহ হলে অবিলম্বে চিকিৎসকের সাথে যোগাযোগ করুন'
      ],
      processingInfo: {
        analysisTimestamp: new Date().toISOString(),
        enhancementLevel: 'medical-knowledge-enhanced-fallback',
        knowledgeBaseSize: `${medicalKnowledge.totalTerms} medical terms`
      }
    }

  } catch (error) {
    console.error('Enhanced medical analysis error:', error)
    throw new Error(`Enhanced analysis failed: ${error.message}`)
  }
}

/**
 * Create medical context from knowledge base for prompt enhancement
 */
function createMedicalContext(medicalKnowledge) {
  // Sample important medical terms for context (to avoid prompt being too long)
  const importantTerms = medicalKnowledge.terms
    .filter(term => term.category !== 'Prefix' && term.category !== 'Suffix')
    .slice(0, 100) // Limit to avoid exceeding prompt limits
    .map(term => `${term.term}: ${term.explanation}`)
    .join('\n')

  return `
MEDICAL TERMINOLOGY REFERENCE (${medicalKnowledge.totalTerms} total terms in knowledge base):

Key Medical Terms and Definitions:
${importantTerms}

Categories Available: ${medicalKnowledge.categories.join(', ')}

Instructions for using this knowledge base:
- Match any medical terms found in the prescription with the definitions above
- Use the provided explanations for accurate medical information
- Translate medical concepts into clear Bengali using this reference
- Provide context-appropriate advice based on the medical knowledge
`
}
