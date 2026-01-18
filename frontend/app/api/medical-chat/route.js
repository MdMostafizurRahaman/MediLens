import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Cache for frequently asked questions
const responseCache = new Map()
const requestTracker = new Map() // Track recent requests to prevent duplicates
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const DUPLICATE_WINDOW = 2000 // 2 seconds to prevent duplicate requests

export async function POST(request) {
  let message = null
  try {
    const { message: msg, chatHistory, context, prescriptionData } = await request.json()
    message = msg

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    // Create a request fingerprint to prevent duplicates
    const requestFingerprint = `${message.trim()}-${Date.now() - (Date.now() % DUPLICATE_WINDOW)}`
    
    // Check if this is a duplicate request
    if (requestTracker.has(requestFingerprint)) {
      const cachedResponse = requestTracker.get(requestFingerprint)
      return NextResponse.json({ 
        success: true, 
        response: cachedResponse,
        deduplicated: true 
      })
    }

    // Check cache for common questions (performance optimization)
    const cacheKey = message.toLowerCase().trim()
    const cached = responseCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Store in request tracker too
      requestTracker.set(requestFingerprint, cached.response)
      setTimeout(() => requestTracker.delete(requestFingerprint), DUPLICATE_WINDOW)
      
      return NextResponse.json({ 
        success: true, 
        response: cached.response,
        cached: true 
      })
    }

    // Use faster model for better performance
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        maxOutputTokens: 1000, // Limit for faster responses
        temperature: 0.7,
      }
    })

    // Build conversation context
    let conversationContext = ""
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.map(msg => 
        `${msg.type === 'user' ? 'রোগী' : 'ডাক্তার'}: ${msg.content}`
      ).join('\n')
    }

    // Build prescription context if available
    let prescriptionContext = ""
    if (prescriptionData && (prescriptionData.medications || prescriptionData.diagnosis)) {
      prescriptionContext = "\n\n**প্রেসক্রিপশন তথ্য:**\n"
      
      if (prescriptionData.diagnosis) {
        prescriptionContext += `রোগ নির্ণয়: ${prescriptionData.diagnosis.condition || 'উল্লেখ নেই'}\n`
      }
      
      if (prescriptionData.medications && prescriptionData.medications.length > 0) {
        prescriptionContext += "ওষুধসমূহ:\n"
        prescriptionData.medications.forEach((med, index) => {
          prescriptionContext += `${index + 1}. ${med.prescribedName || med.genericName || 'নাম উল্লেখ নেই'}`
          if (med.strength) prescriptionContext += ` (${med.strength})`
          if (med.frequency) prescriptionContext += ` - ${med.frequency}`
          prescriptionContext += "\n"
        })
      }
      
      if (prescriptionData.investigations && prescriptionData.investigations.length > 0) {
        prescriptionContext += "পরীক্ষা-নিরীক্ষা:\n"
        prescriptionData.investigations.forEach((test, index) => {
          prescriptionContext += `${index + 1}. ${test.test || 'পরীক্ষার নাম উল্লেখ নেই'}\n`
        })
      }
    }

    const prompt = `
আপনি একজন অভিজ্ঞ বাংলাদেশী চিকিৎসক এবং PrescribeCorrect প্ল্যাটফর্মের AI সহায়ক। আপনার বিশেষত্ব:

🏥 **বিশেষত্ব:**
- সাধারণ চিকিৎসা (General Medicine)
- জরুরি চিকিৎসা (Emergency Medicine)  
- প্রাথমিক স্বাস্থ্যসেবা (Primary Healthcare)
- প্রেসক্রিপশন বিশ্লেষণ (Prescription Analysis)
- স্বাস্থ্য শিক্ষা (Health Education)

**নিরাপত্তা নির্দেশনা:**
- সবসময় রোগীর নিরাপত্তা প্রাধান্য দিন
- গুরুতর উপসর্গে তাৎক্ষণিক ডাক্তার দেখতে বলুন
- অনিশ্চিত থাকলে বিশেষজ্ঞ ডাক্তারের কাছে পাঠান

${prescriptionContext}

**পূর্ববর্তী কথোপকথন:**
${conversationContext}

**রোগীর বর্তমান প্রশ্ন/সমস্যা:**
"${message}"

**উত্তর নির্দেশনা:**
- সহজ ও বন্ধুত্বপূর্ণ ভাষায় উত্তর দিন
- প্রেসক্রিপশনের তথ্য থাকলে সেই অনুযায়ী নির্দিষ্ট পরামর্শ দিন
- অভিবাদনের জন্য সংক্ষিপ্ত ও উষ্ণ উত্তর দিন  
- চিকিৎসা বিষয়ে বিস্তারিত ও নিরাপদ পরামর্শ দিন
- সবসময় প্রয়োজনে ডাক্তার দেখার পরামর্শ যোগ করুন

**উত্তরের ভাষা:** সহজ বাংলা (অভিবাদনের জন্য ২-৩ লাইন, চিকিৎসা বিষয়ে বিস্তারিত)
**উত্তরের স্বর:** সহানুভূতিশীল ও পেশাদার

অনুগ্রহ করে উপরের নির্দেশনা অনুযায়ী উত্তর দিন:
`

    let botResponse
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      botResponse = response.text()
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError)
      
      // Check if it's a quota exceeded error
      if (geminiError.message && (
        geminiError.message.includes('quota') || 
        geminiError.message.includes('limit') ||
        geminiError.message.includes('429') ||
        geminiError.message.includes('RESOURCE_EXHAUSTED')
      )) {
        console.log('Quota exceeded, using fallback response')
        const fallbackResponse = getMedicalFallbackResponse(message)
        return NextResponse.json({
          success: true,
          response: fallbackResponse,
          source: 'fallback-quota-exceeded'
        })
      }
      
      // For other Gemini errors, still use fallback
      const fallbackResponse = getMedicalFallbackResponse(message)
      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        source: 'fallback-gemini-error'
      })
    }

    // Clean and format the response
    const cleanedResponse = botResponse
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove other markdown
      .trim()

    // Add emojis and structure for better readability
    const formattedResponse = formatMedicalResponse(cleanedResponse, message, context, prescriptionData)

    // Cache common responses for performance
    if (isCommonQuestion(message)) {
      responseCache.set(cacheKey, {
        response: formattedResponse,
        timestamp: Date.now()
      })
    }

    // Store in request tracker to prevent immediate duplicates
    requestTracker.set(requestFingerprint, formattedResponse)
    setTimeout(() => requestTracker.delete(requestFingerprint), DUPLICATE_WINDOW)

    return NextResponse.json({
      success: true,
      response: formattedResponse,
      source: 'gemini-medical-ai'
    })

  } catch (error) {
    console.error('Medical chat error:', error)
    
    // Fallback to rule-based responses
    const fallbackResponse = getMedicalFallbackResponse(message)
    
    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      source: 'fallback-medical'
    })
  }
}

function formatMedicalResponse(response, originalMessage, context, prescriptionData) {
  const lowerMessage = originalMessage.toLowerCase()
  
  // Add appropriate medical emojis based on content and context
  let formattedResponse = response
  
  if (context === 'prescription') {
    formattedResponse = '💊 ' + formattedResponse
  } else if (lowerMessage.includes('জ্বর') || lowerMessage.includes('fever')) {
    formattedResponse = '🌡️ ' + formattedResponse
  } else if (lowerMessage.includes('মাথাব্যথা') || lowerMessage.includes('headache')) {
    formattedResponse = '🧠 ' + formattedResponse
  } else if (lowerMessage.includes('পেট') || lowerMessage.includes('stomach')) {
    formattedResponse = '🍽️ ' + formattedResponse
  } else if (lowerMessage.includes('হার্ট') || lowerMessage.includes('heart')) {
    formattedResponse = '❤️ ' + formattedResponse
  } else if (lowerMessage.includes('কাশি') || lowerMessage.includes('cough')) {
    formattedResponse = '😷 ' + formattedResponse
  } else {
    formattedResponse = '🩺 ' + formattedResponse
  }
  
  // Add prescription-specific disclaimer if prescription data is available
  if (prescriptionData) {
    formattedResponse += '\n\n💊 **প্রেসক্রিপশন সম্পর্কিত:** এই পরামর্শ আপনার প্রেসক্রিপশনের উপর ভিত্তি করে দেওয়া। যেকোনো পরিবর্তনের জন্য চিকিৎসকের সাথে যোগাযোগ করুন।'
  } else {
    formattedResponse += '\n\n⚠️ **গুরুত্বপূর্ণ:** এটি প্রাথমিক পরামর্শ। গুরুতর সমস্যায় অবশ্যই চিকিৎসকের সাথে দেখা করুন।'
  }
  
  return formattedResponse
}

function getMedicalFallbackResponse(message) {
  const lowerMessage = message.toLowerCase()
  
  // Emergency conditions - immediate attention needed
  const emergencyKeywords = [
    'chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding',
    'বুকে ব্যথা', 'শ্বাস নিতে কষ্ট', 'অজ্ঞান', 'রক্তক্ষরণ'
  ]
  
  if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return `🚨 **জরুরি অবস্থা সনাক্ত করা হয়েছে!**

অবিলম্বে নিকটস্থ হাসপাতালের জরুরি বিভাগে যান বা ০০০ নম্বরে কল করুন।

🏥 **তাৎক্ষণিক করণীয়:**
• রোগীকে আরামদায়ক অবস্থানে রাখুন
• শ্বাস-প্রশ্বাসের দিকে নজর রাখুন  
• জ্ঞান হারালে পাশে শুইয়ে দিন
• দ্রুত হাসপাতালে নিয়ে যান

⚠️ **বিলম্ব করবেন না - জীবন ঝুঁকিতে থাকতে পারে!**`
  }
  
  // Common medical responses
  if (lowerMessage.includes('জ্বর') || lowerMessage.includes('fever')) {
    return `🌡️ **জ্বরের চিকিৎসা:**

**তাৎক্ষণিক করণীয়:**
• প্যারাসিটামল ৫০০ মিগ্রা - প্রতি ৬ ঘন্টায়
• প্রচুর পানি ও তরল খাবার
• হালকা কাপড় পরুন
• কুসুম গরম পানিতে গোসল

**সতর্কতা:**
• ১০৩°F এর বেশি জ্বর
• ৩ দিনের বেশি স্থায়ী হলে
• শ্বাস কষ্ট বা বুকে ব্যথা হলে

➡️ এসব ক্ষেত্রে তাৎক্ষণিক ডাক্তার দেখান।`
  }
  
  if (lowerMessage.includes('ডায়াবেটিস') || lowerMessage.includes('diabetes')) {
    return `🍎 **ডায়াবেটিস নিয়ন্ত্রণ:**

**খাদ্য নিয়ন্ত্রণ:**
• চিনি, মিষ্টি ও ভাত কম খান
• বেশি শাকসবজি ও আঁশযুক্ত খাবার
• নিয়মিত সময়ে খাবার খান

**জীবনযাত্রা:**
• প্রতিদিন ৩০ মিনিট হাঁটুন
• ওজন নিয়ন্ত্রণে রাখুন
• পর্যাপ্ত ঘুম নিন

**নিয়মিত পরীক্ষা:**
• মাসে ১ বার রক্তের চিনি
• ৩ মাসে ১ বার HbA1c
• চোখ ও কিডনি চেকআপ`
  }
  
  if (lowerMessage.includes('রক্তচাপ') || lowerMessage.includes('pressure')) {
    return `🩺 **উচ্চ রক্তচাপ নিয়ন্ত্রণ:**

**খাদ্যাভ্যাস:**
• লবণ কম খান (দিনে ৫ গ্রামের কম)
• তাজা ফল ও সবজি বেশি খান
• তেল-চর্বি কম খান

**জীবনযাত্রা:**
• নিয়মিত ব্যায়াম করুন
• ধূমপান ও মদ্যপান ছাড়ুন
• মানসিক চাপ কমান

**ওষুধ:**
• নিয়মিত ওষুধ খান, বন্ধ করবেন না
• প্রতিদিন একই সময়ে খান`
  }
  
  // Default response for unrecognized queries
  return `🩺 **স্বাস্থ্য পরামর্শ:**

আপনার প্রশ্নটি আরো স্পষ্ট করে জানালে আমি আরো ভালো সাহায্য করতে পারব।

**আমি সাহায্য করতে পারি:**
• রোগের লক্ষণ ও চিকিৎসা
• ওষুধের সঠিক ব্যবহার
• জরুরি অবস্থা চিহ্নিতকরণ
• স্বাস্থ্যকর জীবনযাত্রার পরামর্শ
• প্রেসক্রিপশন বুঝতে সাহায্য

💬 **উদাহরণ প্রশ্ন:**
"জ্বর হলে কি করব?"
"ডায়াবেটিস নিয়ন্ত্রণের উপায়?"
"বুকে ব্যথা হচ্ছে কেন?"

📱 মনে রাখবেন: PrescribeCorrect এ প্রেসক্রিপশন আপলোড করে বিস্তারিত বিশ্লেষণ পেতে পারেন।`
}

// Helper function to identify common questions for caching
function isCommonQuestion(message) {
  const commonPatterns = [
    'জ্বর', 'fever', 'মাথাব্যথা', 'headache', 
    'ডায়াবেটিস', 'diabetes', 'রক্তচাপ', 'pressure',
    'কাশি', 'cough', 'পেট', 'stomach', 'ব্যথা', 'pain'
  ]
  
  const lowerMessage = message.toLowerCase()
  return commonPatterns.some(pattern => lowerMessage.includes(pattern))
}
