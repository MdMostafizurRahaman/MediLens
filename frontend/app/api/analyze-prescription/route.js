import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Initialize Gemini AI with environment variable (server-side only)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { text, analysisType } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Create comprehensive medical analysis prompt optimized for garbled OCR
    const prompt = `
    You are an expert medical AI trained on 100,000+ medical terms with advanced OCR text interpretation capabilities. You specialize in analyzing prescriptions from Bangladesh and understand both English and Bengali medical terminology.
    
    PRESCRIPTION TEXT TO ANALYZE:
    "${text}"

    ANALYSIS FRAMEWORK - Extract information in this exact order:

    1. **DISEASES/CONDITIONS** (রোগ নির্ণয়):
       - Identify any mentioned diseases, conditions, or diagnoses
       - Look for patterns like "DM", "HTN", "GERD", disease names
       - Consider symptoms that suggest specific conditions
       - Provide Bengali translation for each condition

    2. **TESTS/INVESTIGATIONS** (পরীক্ষা-নিরীক্ষা):
       - Find any lab tests mentioned (CBC, RBS, HbA1c, TSH, etc.)
       - Look for investigation results or recommendations
       - Include normal ranges and interpretation
       - Note any pending or recommended tests

    3. **MEDICINES** (ওষুধ):
       - Extract medication names (handle OCR errors like Co-amoxiclav as "Co amoxiclav")
       - Identify strength (mg, ml, units)
       - Determine frequency (OD, BD, TDS, QID or 1+0+0, 1+0+1, etc.)
       - Find timing (AC, PC, HS - before meal, after meal, bedtime)
       - Note duration if mentioned
       - Provide purpose and side effects for each medicine

    4. **ADVANCED OCR CORRECTION**:
       - "Co" + space + medicine name = "Co-" prefix medications
       - "rng" or "n19" = "mg"
       - "l" in numbers = "1", "O" in numbers = "0"
       - "Tab" or "tablet" = Tablet form
       - Common Bangladesh medicine brand names
       - Bengali medicine names recognition

    5. **COMPREHENSIVE MEDICAL INTELLIGENCE**:
       - Cross-reference medications with likely conditions
       - Identify treatment patterns (diabetes, hypertension, infection, etc.)
       - Suggest missing information based on medication combinations
       - Provide health education in Bengali

    RESPONSE FORMAT (JSON):
    {
      "textQuality": "poor/fair/good/excellent",
      "confidenceScore": "overall analysis confidence 0-100%",
      
      "diseases": [
        {
          "condition": "Medical condition name",
          "bangla": "রোগের বাংলা নাম",
          "confidence": "high/medium/low",
          "severity": "mild/moderate/severe",
          "reasoning": "Why this condition is suspected",
          "description": "Brief explanation in Bengali"
        }
      ],
      
      "investigations": [
        {
          "test": "Test name (e.g., HbA1c, CBC)",
          "bangla": "পরীক্ষার বাংলা নাম",
          "result": "Test result if mentioned",
          "normalRange": "Normal range",
          "interpretation": "Normal/Abnormal with Bengali explanation",
          "recommendation": "When to repeat or follow up"
        }
      ],
      
      "medications": [
        {
          "name": "Medicine name (corrected from OCR)",
          "bangla": "ওষুধের বাংলা নাম",
          "genericName": "Generic name if different",
          "strength": "Dosage strength",
          "frequency": "How often to take",
          "timing": "When to take (AC/PC/HS)",
          "duration": "How long to take",
          "purpose": "What this medicine treats (in Bengali)",
          "sideEffects": "Common side effects (in Bengali)",
          "instructions": "Special instructions (in Bengali)",
          "confidence": "high/medium/low"
        }
      ],
      
      "symptoms": [
        {
          "symptom": "Symptom mentioned",
          "bangla": "উপসর্গের বাংলা নাম",
          "severity": "mild/moderate/severe",
          "duration": "How long present"
        }
      ],
      
      "patientInfo": {
        "name": "Patient name if found",
        "age": "Age if found",
        "gender": "Gender if found",
        "weight": "Weight if mentioned",
        "allergies": "Any allergies mentioned"
      },
      
      "vitalSigns": {
        "bloodPressure": "BP reading if found",
        "pulse": "Pulse rate if found",
        "temperature": "Temperature if found",
        "weight": "Weight if found"
      },
      
      "comprehensiveSummary": "Complete analysis in Bengali covering:\n1. রোগ নির্ণয় (Diseases identified)\n2. প্রয়োজনীয় পরীক্ষা (Required tests)\n3. ওষুধের তালিকা ও নির্দেশনা (Medicine list and instructions)\n4. জীবনযাত্রার পরামর্শ (Lifestyle advice)\n5. ফলো-আপ নির্দেশনা (Follow-up instructions)",
      
      "warnings": [
        "Critical safety warnings in Bengali",
        "Drug interaction warnings",
        "When to contact doctor immediately"
      ],
      
      "healthEducation": "Educational content in Bengali about the condition, prevention, and self-care",
      
      "followUpPlan": "When to see doctor again, what to monitor, when to do tests",
      
      "emergencyInstructions": "When to go to emergency/hospital immediately (in Bengali)"
    }

    CRITICAL REQUIREMENTS:
    - Prioritize patient safety above all else
    - Provide comprehensive Bengali explanations
    - Be honest about confidence levels
    - Give actionable health advice
    - Focus on disease → tests → medicines workflow like expert doctors
    - Handle OCR errors intelligently
    - Provide emergency guidance when needed
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    // Try to parse JSON response
    let analysis
    try {
      // Clean the response to extract JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const rawAnalysis = JSON.parse(jsonMatch[0])
        
        // Transform the response to match our display format
        analysis = {
          textQuality: rawAnalysis.textQuality || 'unknown',
          confidenceScore: rawAnalysis.confidenceScore || 'Unknown',
          diseases: rawAnalysis.diseases || [],
          medications: rawAnalysis.medications || [],
          investigations: rawAnalysis.investigations || [],
          symptoms: rawAnalysis.symptoms || [],
          patientInfo: rawAnalysis.patientInfo || {},
          vitalSigns: rawAnalysis.vitalSigns || {},
          summary: rawAnalysis.comprehensiveSummary || 'প্রেসক্রিপশন বিশ্লেষণ সম্পূর্ণ করা যায়নি।',
          warnings: rawAnalysis.warnings || ['চিকিৎসকের পরামর্শ অনুযায়ী ওষুধ সেবন করুন'],
          healthEducation: rawAnalysis.healthEducation || '',
          followUpPlan: rawAnalysis.followUpPlan || '',
          emergencyInstructions: rawAnalysis.emergencyInstructions || '',
          originalTextAnalysis: rawAnalysis.originalTextAnalysis || '',
          analysisSource: 'gemini-enhanced-v2'
        }
      } else {
        // Fallback: create structured response from text
        analysis = {
          textQuality: 'poor',
          summary: analysisText || 'প্রেসক্রিপশন বিশ্লেষণে সমস্যা হয়েছে।',
          medications: [],
          diagnosis: [],
          symptoms: [],
          investigations: [],
          patientInfo: {},
          vitalSigns: {},
          warnings: ['এই প্রেসক্রিপশনটি স্পষ্ট নয়। দয়া করে চিকিৎসকের সাথে পরামর্শ করুন।'],
          analysisSource: 'gemini-fallback'
        }
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // Enhanced fallback response for garbled text
      analysis = {
        textQuality: 'very poor',
        summary: `প্রেসক্রিপশন বিশ্লেষণ:\n\nএই প্রেসক্রিপশনের টেক্সট স্পষ্ট নয় বা ক্ষতিগ্রস্ত। সম্ভাব্য কারণ:\n• ছবির গুণমান খারাপ\n• হাতের লেখা অস্পষ্ট\n• স্ক্যান/ফটোকপির সমস্যা\n\n🚨 গুরুত্বপূর্ণ নির্দেশনা:\n• এই প্রেসক্রিপশন অনুযায়ী ওষুধ খাবেন না\n• মূল প্রেসক্রিপশন নিয়ে চিকিৎসকের কাছে যান\n• স্পষ্ট ছবি তুলে আবার চেষ্টা করুন\n\n💡 উন্নত ফলাফলের জন্য:\n• উজ্জ্বল আলোতে ছবি তুলুন\n• ক্যামেরা সোজা রাখুন\n• প্রেসক্রিপশনটি সমতল রাখুন`,
        medications: [],
        diagnosis: [],
        symptoms: [],
        investigations: [],
        patientInfo: {},
        vitalSigns: {},
        warnings: [
          'এই প্রেসক্রিপশনের টেক্সট পড়া যাচ্ছে না',
          'মূল প্রেসক্রিপশন নিয়ে চিকিৎসকের কাছে যান',
          'স্পষ্ট ছবি তুলে আবার চেষ্টা করুন'
        ],
        analysisSource: 'error-fallback'
      }
    }

    return NextResponse.json({
      success: true,
      analysis: analysis,
      rawResponse: analysisText
    })

  } catch (error) {
    console.error('Gemini analysis error:', error)
    return NextResponse.json({
      error: 'Analysis failed',
      details: error.message
    }, { status: 500 })
  }
}
