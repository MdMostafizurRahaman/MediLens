import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Initialize Gemini AI with environment variable
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { text, analysisType } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Create comprehensive medical analysis prompt
    const prompt = `
    You are a medical AI assistant trained on comprehensive medical terminology. Analyze this prescription/medical document text and provide detailed information:

    TEXT TO ANALYZE:
    "${text}"

    Please provide a comprehensive analysis in the following JSON format:
    {
      "medications": [
        {
          "name": "medication name",
          "bangla": "Bengali translation",
          "strength": "dosage strength",
          "frequency": "how often to take",
          "timing": "when to take (before/after meals)",
          "instructions": "special instructions",
          "sideEffects": "common side effects in Bengali"
        }
      ],
      "diagnosis": [
        {
          "condition": "medical condition",
          "bangla": "Bengali translation",
          "severity": "mild/moderate/severe",
          "description": "brief explanation"
        }
      ],
      "symptoms": [
        {
          "symptom": "symptom name",
          "bangla": "Bengali translation",
          "severity": "severity level"
        }
      ],
      "investigations": [
        {
          "test": "test name",
          "result": "test result if available",
          "normalRange": "normal range",
          "interpretation": "normal/abnormal/high/low"
        }
      ],
      "patientInfo": {
        "name": "patient name if mentioned",
        "age": "age if mentioned",
        "gender": "gender if mentioned"
      },
      "vitalSigns": {
        "bloodPressure": "BP reading if available",
        "pulse": "pulse rate if available",
        "temperature": "temperature if available",
        "weight": "weight if available"
      },
      "summary": "Comprehensive summary in both English and Bengali explaining the prescription, conditions, and important instructions",
      "warnings": [
        "Important warnings and precautions in Bengali"
      ]
    }

    IMPORTANT INSTRUCTIONS:
    1. Extract ALL medications mentioned with complete details
    2. Identify ALL medical conditions and diseases
    3. List ALL symptoms mentioned
    4. Extract ALL test results and investigations
    5. Provide Bengali translations for medications and conditions
    6. Include safety warnings and precautions
    7. If text is unclear or garbled, use medical pattern recognition to identify likely medications and conditions
    8. Be thorough and comprehensive - this is for patient safety
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
        analysis = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: create structured response from text
        analysis = {
          summary: analysisText,
          medications: [],
          diagnosis: [],
          symptoms: [],
          investigations: [],
          patientInfo: {},
          vitalSigns: {},
          warnings: []
        }
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // Fallback response
      analysis = {
        summary: analysisText,
        medications: [],
        diagnosis: [],
        symptoms: [],
        investigations: [],
        patientInfo: {},
        vitalSigns: {},
        warnings: ['চিকিৎসকের পরামর্শ অনুযায়ী ওষুধ সেবন করুন']
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
