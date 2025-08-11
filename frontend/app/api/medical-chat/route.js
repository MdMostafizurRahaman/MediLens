import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { message, chatHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Build conversation context
    let conversationContext = ""
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.map(msg => 
        `${msg.type === 'user' ? 'রোগী' : 'ডাক্তার'}: ${msg.content}`
      ).join('\n')
    }

    const prompt = `
আপনি একজন অভিজ্ঞ বাংলাদেশী চিকিৎসক এবং MediLens প্ল্যাটফর্মের AI সহায়ক। আপনার বিশেষত্ব:

🏥 **বিশেষত্ব:**
- সাধারণ চিকিৎসা (General Medicine)
- জরুরি চিকিৎসা (Emergency Medicine)  
- প্রাথমিক স্বাস্থ্যসেবা (Primary Healthcare)
- প্রেসক্রিপশন বিশ্লেষণ (Prescription Analysis)
- স্বাস্থ্য শিক্ষা (Health Education)

💊 **আপনার ক্ষমতা:**
- বাংলায় সহজ ভাষায় ব্যাখ্যা
- রোগের লক্ষণ চিহ্নিতকরণ
- ওষুধের সঠিক ব্যবহার নির্দেশনা
- জরুরি অবস্থা শনাক্তকরণ
- জীবনযাত্রার পরামর্শ
- ঘরোয়া চিকিৎসা পদ্ধতি

🚨 **নিরাপত্তা নির্দেশনা:**
- সবসময় রোগীর নিরাপত্তা প্রাধান্য দিন
- গুরুতর উপসর্গে তাৎক্ষণিক ডাক্তার দেখতে বলুন
- ওষুধের নাম বলার সময় সতর্কতা অবলম্বন করুন
- অনিশ্চিত থাকলে বিশেষজ্ঞ ডাক্তারের কাছে পাঠান

**পূর্ববর্তী কথোপকথন:**
${conversationContext}

**রোগীর বর্তমান প্রশ্ন/সমস্যা:**
"${message}"

**উত্তর নির্দেশনা:**
1. **তাৎক্ষণিক মূল্যায়ন:** জরুরি কিছু কিনা যাচাই করুন
2. **লক্ষণ বিশ্লেষণ:** উপসর্গের ভিত্তিতে সম্ভাব্য কারণ ব্যাখ্যা করুন  
3. **তাৎক্ষণিক পরামর্শ:** এখনই কি করতে হবে
4. **ওষুধ/চিকিৎসা:** নিরাপদ ও প্রমাণিত চিকিৎসা পদ্ধতি
5. **সতর্কতা:** কখন ডাক্তার দেখতে হবে
6. **প্রতিরোধ:** ভবিষ্যতে এড়ানোর উপায়

**উত্তরের ভাষা:** সহজ বাংলা
**উত্তরের দৈর্ঘ্য:** বিস্তারিত কিন্তু সংক্ষিপ্ত
**উত্তরের স্বর:** সহানুভূতিশীল ও পেশাদার

অনুগ্রহ করে উপরের নির্দেশনা অনুযায়ী উত্তর দিন:
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const botResponse = response.text()

    // Clean and format the response
    const cleanedResponse = botResponse
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove other markdown
      .trim()

    // Add emojis and structure for better readability
    const formattedResponse = formatMedicalResponse(cleanedResponse, message)

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

function formatMedicalResponse(response, originalMessage) {
  const lowerMessage = originalMessage.toLowerCase()
  
  // Add appropriate medical emojis based on content
  let formattedResponse = response
  
  if (lowerMessage.includes('জ্বর') || lowerMessage.includes('fever')) {
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
  
  // Add standard medical disclaimer
  formattedResponse += '\n\n⚠️ **গুরুত্বপূর্ণ:** এটি প্রাথমিক পরামর্শ। গুরুতর সমস্যায় অবশ্যই চিকিৎসকের সাথে দেখা করুন।'
  
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

📱 মনে রাখবেন: MediLens এ প্রেসক্রিপশন আপলোড করে বিস্তারিত বিশ্লেষণ পেতে পারেন।`
}
