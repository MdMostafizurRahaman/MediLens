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
    You are an expert medical AI trained on 50,000+ medical terms with advanced OCR text interpretation capabilities. 
    
    The following text is from a medical prescription that has been processed through OCR and may contain errors, garbled characters, or unclear text. Your task is to intelligently interpret this text and extract meaningful medical information.

    OCR TEXT TO ANALYZE:
    "${text}"

    ADVANCED ANALYSIS INSTRUCTIONS:
    1. **OCR Error Correction**: Look for common OCR mistakes like:
       - "Co" might be "Co-" (prefix for medications)
       - "mg" might appear as "rng" or "n19"
       - Numbers may be misread (1 as l, 0 as O)
       - Medical abbreviations may be corrupted
    
    2. **Pattern Recognition**: Identify medical patterns even in garbled text:
       - Look for medication name patterns (Tab, Cap, Syr)
       - Dosage patterns (1+1+1, BD, TDS, QID)
       - Common drug prefixes/suffixes
       - Bengali medication names
    
    3. **Medical Intelligence**: Use medical knowledge to infer:
       - Common medications for symptoms mentioned
       - Standard dosages for identified drugs
       - Typical prescription formats in Bangladesh
    
    4. **Comprehensive Extraction**: Even from unclear text, try to identify:
       - Any recognizable medication names
       - Dosage instructions
       - Timing information
       - Medical conditions or symptoms
       - Patient information

    Please provide analysis in JSON format:
    {
      "textQuality": "assessment of OCR quality (poor/fair/good)",
      "extractedMedications": [
        {
          "name": "best guess medication name",
          "confidence": "high/medium/low",
          "bangla": "Bengali translation",
          "strength": "dosage strength if identifiable",
          "frequency": "dosage frequency if identifiable",
          "timing": "timing instructions",
          "commonUse": "what this medication is typically used for",
          "sideEffects": "common side effects in Bengali"
        }
      ],
      "possibleConditions": [
        {
          "condition": "likely medical condition based on medications/context",
          "bangla": "Bengali translation",
          "confidence": "high/medium/low",
          "reasoning": "why this condition is suspected"
        }
      ],
      "symptoms": [
        {
          "symptom": "any symptoms mentioned or inferred",
          "bangla": "Bengali translation"
        }
      ],
      "patientInfo": {
        "extractedInfo": "any patient details found",
        "age": "if identifiable",
        "gender": "if identifiable"
      },
      "summary": "Comprehensive Bengali summary explaining what could be determined from this prescription, including:\n- Identified medications and their purposes\n- Likely medical conditions\n- General health advice\n- Important warnings about medication safety\n- Recommendation to consult doctor for unclear prescriptions",
      "recommendations": [
        "Specific recommendations in Bengali for the patient",
        "Safety warnings",
        "When to consult doctor"
      ],
      "originalTextAnalysis": "Brief analysis of what made the text difficult to read and suggestions for better image quality"
    }

    CRITICAL REQUIREMENTS:
    - Provide comprehensive Bengali explanations for everything
    - Include safety warnings about unclear prescriptions
    - Give general health advice when specific medications can't be identified
    - Be honest about uncertainty levels
    - Focus on patient safety above all else
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
          medications: rawAnalysis.extractedMedications || [],
          diagnosis: rawAnalysis.possibleConditions || [],
          symptoms: rawAnalysis.symptoms || [],
          investigations: [], // Keep empty for now
          patientInfo: rawAnalysis.patientInfo || {},
          vitalSigns: {}, // Keep empty for now
          summary: rawAnalysis.summary || 'প্রেসক্রিপশন বিশ্লেষণ সম্পূর্ণ করা যায়নি।',
          warnings: rawAnalysis.recommendations || ['চিকিৎসকের পরামর্শ অনুযায়ী ওষুধ সেবন করুন'],
          originalTextAnalysis: rawAnalysis.originalTextAnalysis || '',
          analysisSource: 'gemini-enhanced'
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
