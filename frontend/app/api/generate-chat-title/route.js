import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { conversation, prescriptionContext, chatContext } = await request.json()

    if (!conversation || conversation.trim().length === 0) {
      return Response.json({ title: 'নতুন চ্যাট' })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
You are an AI assistant that generates concise, meaningful chat titles in Bengali for medical consultations.

Context:
- Conversation: "${conversation}"
- Type: ${prescriptionContext}
- Chat Context: ${chatContext}

Instructions:
1. Generate a short, descriptive title (maximum 4-5 words) in Bengali that captures the main medical topic
2. Use appropriate medical emojis if relevant
3. Be specific about the health condition or topic discussed
4. Use Bengali language for the title
5. Make it helpful for users to identify the conversation later

Examples:
- For fever discussion: "🌡️ জ্বরের চিকিৎসা"
- For prescription analysis: "💊 ওষুধের পরামর্শ"
- For diabetes consultation: "🍎 ডায়াবেটিস নিয়ন্ত্রণ"
- For headache: "🧠 মাথাব্যথার সমাধান"

Generate only the title, nothing else:
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let title = response.text().trim()

    // Clean up the response
    title = title.replace(/['"]/g, '').trim()
    
    // Ensure it's not too long
    if (title.length > 30) {
      title = title.substring(0, 27) + '...'
    }

    // Fallback if empty or invalid
    if (!title || title.length < 3) {
      title = generateFallbackTitle(conversation, prescriptionContext)
    }

    return Response.json({ title })
  } catch (error) {
    console.error('Error generating chat title:', error)
    
    // Fallback title generation
    const fallbackTitle = generateFallbackTitle(
      request.conversation || '', 
      request.prescriptionContext || 'general_health'
    )
    
    return Response.json({ title: fallbackTitle })
  }
}

function generateFallbackTitle(conversation, context) {
  const text = conversation.toLowerCase()
  
  // Medical condition patterns
  const patterns = [
    { keywords: ['জ্বর', 'fever'], title: '🌡️ জ্বরের সমস্যা' },
    { keywords: ['মাথাব্যথা', 'headache'], title: '🧠 মাথাব্যথা' },
    { keywords: ['ডায়াবেটিস', 'diabetes'], title: '🍎 ডায়াবেটিস' },
    { keywords: ['কাশি', 'cough'], title: '😷 কাশির সমস্যা' },
    { keywords: ['পেট', 'stomach'], title: '🍽️ পেটের সমস্যা' },
    { keywords: ['প্রেসক্রিপশন', 'ওষুধ'], title: '💊 ওষুধ পরামর্শ' },
    { keywords: ['রক্তচাপ', 'pressure'], title: '🩺 রক্তচাপ' },
    { keywords: ['হৃদরোগ', 'heart'], title: '❤️ হৃদরোগ' }
  ]

  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => text.includes(keyword))) {
      return pattern.title
    }
  }

  if (context === 'prescription_analysis') {
    return '💊 প্রেসক্রিপশন বিশ্লেষণ'
  }

  return 'স্বাস্থ্য পরামর্শ'
}
