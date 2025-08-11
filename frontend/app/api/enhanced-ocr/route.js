import { NextResponse } from 'next/server'

/**
 * Enhanced OCR Route with Google Lens Integration
 * Provides multiple OCR options including Google Lens API
 */
export async function POST(request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image')
    const ocrMethod = formData.get('method') || 'google-lens' // default to Google Lens
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const imageBuffer = await imageFile.arrayBuffer()
    let ocrResult

    switch (ocrMethod) {
      case 'google-lens':
        ocrResult = await extractWithGoogleLens(imageBuffer)
        break
      case 'tesseract':
        ocrResult = await extractWithTesseract(imageBuffer)
        break
      default:
        ocrResult = await extractWithGoogleLens(imageBuffer)
    }

    return NextResponse.json({
      success: true,
      method: ocrMethod,
      ...ocrResult
    })

  } catch (error) {
    console.error('Enhanced OCR Error:', error)
    return NextResponse.json({
      error: 'OCR extraction failed',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * Google Lens OCR extraction
 */
async function extractWithGoogleLens(imageBuffer) {
  const base64Image = Buffer.from(imageBuffer).toString('base64')
  const GOOGLE_LENS_API_KEY = process.env.GOOGLE_LENS_API
  
  if (!GOOGLE_LENS_API_KEY) {
    throw new Error('Google Lens API key not configured')
  }

  const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_LENS_API_KEY}`
  
  const requestBody = {
    requests: [
      {
        image: { content: base64Image },
        features: [
          { type: 'TEXT_DETECTION', maxResults: 1 },
          { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
        ],
        imageContext: {
          languageHints: ['en', 'bn'] // English and Bengali
        }
      }
    ]
  }

  const response = await fetch(visionApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error(`Google Vision API error: ${response.status}`)
  }

  const result = await response.json()
  
  if (result.responses && result.responses[0]) {
    const textAnnotations = result.responses[0].textAnnotations
    const fullTextAnnotation = result.responses[0].fullTextAnnotation
    
    if (fullTextAnnotation) {
      return {
        text: fullTextAnnotation.text,
        confidence: calculateConfidence(fullTextAnnotation.pages),
        method: 'google-lens',
        wordCount: fullTextAnnotation.text.split(/\s+/).length
      }
    } else if (textAnnotations && textAnnotations.length > 0) {
      return {
        text: textAnnotations[0].description,
        confidence: 85,
        method: 'google-lens',
        wordCount: textAnnotations[0].description.split(/\s+/).length
      }
    }
  }

  throw new Error('No text detected in image')
}

/**
 * Fallback Tesseract OCR (if needed)
 */
async function extractWithTesseract(imageBuffer) {
  // Placeholder for Tesseract implementation
  // You can add Tesseract.js integration here if needed
  return {
    text: 'Tesseract OCR not implemented yet',
    confidence: 0,
    method: 'tesseract',
    wordCount: 0
  }
}

/**
 * Calculate average confidence from Vision API response
 */
function calculateConfidence(pages) {
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