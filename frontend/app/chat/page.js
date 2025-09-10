'use client'

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

// Lazy load Navigation component
const Navigation = dynamic(() => import('@/components/Navigation'), {
  loading: () => <div className="h-16 bg-primary animate-pulse"></div>
})

// Memoized message component for performance
const MessageItem = memo(({ message, isTyping = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <div
      className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
        message.type === 'user'
          ? 'bg-primary text-primary-content ml-auto'
          : 'bg-base-200 text-base-content'
      }`}
    >
      {message.type === 'bot' && (
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">🤖</span>
          <span className="text-sm font-medium">MediLens AI</span>
          {message.timestamp && (
            <span className="text-xs opacity-60 ml-auto">
              {new Date(message.timestamp).toLocaleTimeString('bn-BD', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
      )}
      
      {message.type === 'user' && message.timestamp && (
        <div className="text-xs opacity-80 mb-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}
      
      <div className="whitespace-pre-wrap break-words">
        {isTyping ? (
          <div className="flex items-center">
            <span>টাইপ করছি</span>
            <div className="ml-2 flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : (
          message.content
        )}
      </div>
    </div>
  </motion.div>
))

// Memoized chat item for performance
const ChatItem = memo(({ chat, isSelected, onSelect }) => (
  <div
    className={`p-3 border-b cursor-pointer hover:bg-base-300 transition-colors ${
      isSelected ? 'bg-base-300' : ''
    }`}
    onClick={onSelect}
  >
    <h4 className="text-sm font-medium truncate">
      {chat.title || `চ্যাট ${chat.id}`}
    </h4>
    <p className="text-xs text-base-content/60">
      {new Date(chat.createdAt).toLocaleDateString('bn-BD')}
    </p>
  </div>
))

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [chatHistory, setChatHistory] = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [prescriptionData, setPrescriptionData] = useState(null)
  const [chatContext, setChatContext] = useState('')
  const [isSending, setIsSending] = useState(false) // New flag to prevent duplicate sends
  const [lastMessageId, setLastMessageId] = useState(null) // Track last message to prevent duplicates
  const messagesEndRef = useRef(null)
  const { currentUser, getToken } = useAuth()
  const router = useRouter()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const debouncedScrollToBottom = useMemo(() => {
    let timeoutId
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(scrollToBottom, 100)
    }
  }, [scrollToBottom])

  useEffect(() => {
    debouncedScrollToBottom()
  }, [messages, debouncedScrollToBottom])

  useEffect(() => {
    if (currentUser) {
      // Check for prescription data from Google Lens
      const urlParams = new URLSearchParams(window.location.search)
      const source = urlParams.get('source')
      
      if (source === 'prescription') {
        const storedPrescriptionData = sessionStorage.getItem('prescriptionAnalysis')
        if (storedPrescriptionData) {
          try {
            const prescriptionAnalysis = JSON.parse(storedPrescriptionData)
            setPrescriptionData(prescriptionAnalysis)
            setChatContext('prescription')
            sessionStorage.removeItem('prescriptionAnalysis') // Clear after use
          } catch (error) {
            console.error('Error parsing prescription data:', error)
          }
        }
      }
      
      // Check for analysis context from localStorage
      const storedChatContext = localStorage.getItem('medilens_chat_context')
      if (storedChatContext) {
        try {
          const chatContextData = JSON.parse(storedChatContext)
          if (chatContextData.type === 'analysis_discussion' && chatContextData.analysis) {
            setPrescriptionData(chatContextData.analysis)
            setChatContext('analysis_discussion')
            
            // Set a detailed welcome message with analysis context
            const welcomeMessage = `🔬 প্রেসক্রিপশন বিশ্লেষণ থেকে আপনাকে স্বাগতম!\n\n${chatContextData.fullReport || chatContextData.summary}\n\nএই বিশ্লেষণ নিয়ে আপনার কোনো প্রশ্ন আছে? আমি সাহায্য করতে প্রস্তুত! 💬`
            
            setMessages([{
              id: 'welcome-analysis-' + Date.now(),
              type: 'bot',
              content: welcomeMessage,
              timestamp: new Date()
            }])
            
            localStorage.removeItem('medilens_chat_context') // Clear after use
            return // Don't continue with normal initialization
          }
        } catch (error) {
          console.error('Error parsing chat context data:', error)
        }
      }
      
      initializeChat()
    }
  }, [currentUser])

  const initializeChat = async () => {
    try {
      setLoading(true)
      await loadChatHistory()
      
      // Start with welcome message if no chat history
      if (messages.length === 0) {
        let welcomeMessage = 'আসসালামু আলাইকুম! 🙏\n\nআমি MediLens এর AI সহায়ক। আপনার স্বাস্থ্য বিষয়ক যেকোনো প্রশ্ন করুন - আমি বাংলায় সাহায্য করতে পারি! 🩺💚'
        
        // If coming from prescription analysis, customize welcome message
        if (prescriptionData) {
          welcomeMessage = `🔬 প্রেসক্রিপশন বিশ্লেষণ থেকে আপনাকে স্বাগতম!\n\nআমি আপনার প্রেসক্রিপশন বিশ্লেষণ করেছি এবং এখন আপনার যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত। আপনি নিম্নলিখিত বিষয়ে প্রশ্ন করতে পারেন:\n\n• ওষুধের পার্শ্বপ্রতিক্রিয়া\n• সেবনবিধি সম্পর্কে\n• খাদ্যাভ্যাস ও সতর্কতা\n• বিকল্প চিকিৎসা\n• পরীক্ষা-নিরীক্ষা সম্পর্কে\n\nকী জানতে চান? 💬`
          
          // Also add prescription summary as a system message
          if (prescriptionData.summary) {
            setMessages([
              {
                id: 'welcome-' + Date.now(),
                type: 'bot',
                content: welcomeMessage,
                timestamp: new Date()
              },
              {
                id: 'prescription-' + Date.now(),
                type: 'system',
                content: prescriptionData.summary,
                timestamp: new Date(),
                isHidden: true // This will be used for context but not displayed
              }
            ])
            return
          }
        }
        
        setMessages([{
          id: 'welcome-' + Date.now(),
          type: 'bot',
          content: welcomeMessage,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChatHistory = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/user/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const chats = await response.json()
        setChatHistory(chats)
        
        // If there are existing chats, load the most recent one (only if not coming from prescription)
        if (chats.length > 0 && !prescriptionData) {
          const latestChat = chats[0]
          setSelectedChatId(latestChat.id)
          await loadChatMessages(latestChat.id)
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const loadChatMessages = async (chatId) => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const chatData = await response.json()
        const formattedMessages = chatData.messages?.map(msg => ({
          id: msg.id,
          type: msg.role === 'USER' ? 'user' : 'bot',
          content: msg.message,
          timestamp: new Date(msg.createdAt)
        })) || []
        
        // Sort messages by timestamp (oldest first)
        formattedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Error loading chat messages:', error)
    }
  }

  const generateChatTitle = async (messages) => {
    if (!messages || messages.length === 0) return 'নতুন চ্যাট'
    
    // Get first few user messages to understand the conversation topic
    const userMessages = messages.filter(msg => msg.sender === 'user').slice(0, 3)
    const conversationContext = userMessages.map(msg => msg.content).join(' ')
    
    try {
      // Use AI to generate a meaningful title based on conversation content
      const response = await fetch('/api/generate-chat-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversationContext,
          prescriptionContext: prescriptionData ? 'prescription_analysis' : 'general_health',
          chatContext: chatContext
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.title || generateFallbackTitle(conversationContext)
      }
    } catch (error) {
      console.error('Error generating AI title:', error)
    }

    // Fallback to intelligent local title generation
    return generateFallbackTitle(conversationContext)
  }

  const generateFallbackTitle = (conversationText) => {
    if (!conversationText) return 'নতুন চ্যাট'
    
    const text = conversationText.toLowerCase()
    
    // Medical conditions with emojis
    const conditionMatches = [
      { keywords: ['জ্বর', 'fever', 'তাপমাত্রা'], title: '🌡️ জ্বর ও তাপমাত্রা' },
      { keywords: ['মাথাব্যথা', 'headache', 'মাথা ব্যথা'], title: '🧠 মাথাব্যথার সমস্যা' },
      { keywords: ['ডায়াবেটিস', 'diabetes', 'চিনি', 'সুগার'], title: '🍎 ডায়াবেটিস নিয়ন্ত্রণ' },
      { keywords: ['রক্তচাপ', 'pressure', 'হাইপ্রেশার'], title: '🩺 রক্তচাপ ব্যবস্থাপনা' },
      { keywords: ['কাশি', 'cough', 'খুসখুসানি'], title: '😷 কাশি ও শ্বাসকষ্ট' },
      { keywords: ['পেট', 'stomach', 'গ্যাস', 'হজম'], title: '🍽️ পেট ও হজমের সমস্যা' },
      { keywords: ['হৃদরোগ', 'heart', 'বুকে ব্যথা'], title: '❤️ হৃদরোগ পরামর্শ' },
      { keywords: ['অ্যালার্জি', 'allergy', 'চুলকানি'], title: '🤧 অ্যালার্জি সমস্যা' },
      { keywords: ['ত্বক', 'skin', 'চর্মরোগ'], title: '🧴 ত্বকের সমস্যা' },
      { keywords: ['চোখ', 'eye', 'দৃষ্টি'], title: '👁️ চোখের পরামর্শ' },
      { keywords: ['দাঁত', 'teeth', 'মাড়ি'], title: '🦷 দাঁত ও মুখের স্বাস্থ্য' },
      { keywords: ['প্রেসক্রিপশন', 'ওষুধ', 'medicine'], title: '💊 ওষুধ ও প্রেসক্রিপশন' },
      { keywords: ['গর্ভাবস্থা', 'pregnancy', 'মা'], title: '🤱 গর্ভাবস্থা পরামর্শ' },
      { keywords: ['শিশু', 'baby', 'বাচ্চা'], title: '� শিশু স্বাস্থ্য' }
    ]

    // Check for condition matches
    for (const condition of conditionMatches) {
      if (condition.keywords.some(keyword => text.includes(keyword))) {
        return condition.title
      }
    }

    // If it's a prescription context
    if (chatContext === 'prescription' || prescriptionData) {
      return '� প্রেসক্রিপশন বিশ্লেষণ'
    }
    
    // Extract meaningful words and create title
    const meaningfulWords = conversationText
      .replace(/[^\u0980-\u09FF\w\s]/g, '') // Keep Bengali and English characters
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 3)
      .join(' ')
    
    if (meaningfulWords.length > 0) {
      return meaningfulWords.length > 25 ? 
        meaningfulWords.substring(0, 25) + '...' : 
        meaningfulWords
    }

    return 'স্বাস্থ্য পরামর্শ'
  }

  const createNewChat = async (firstMessage = null) => {
    try {
      // Clear current messages and create new chat
      let welcomeContent = '✨ নতুন চ্যাট শুরু হয়েছে!\n\nআপনার স্বাস্থ্য বিষয়ক যেকোনো প্রশ্ন করুন। আমি সাহায্য করতে প্রস্তুত! 🩺'
      
      if (prescriptionData) {
        welcomeContent = '🔬 প্রেসক্রিপশন বিশ্লেষণ চ্যাট শুরু!\n\nআপনার প্রেসক্রিপশন সম্পর্কে যেকোনো প্রশ্ন করুন। আমি সাহায্য করতে প্রস্তুত! 💊'
      }
      
      setMessages([{
        id: 'welcome-' + Date.now(),
        type: 'bot',
        content: welcomeContent,
        timestamp: new Date()
      }])
      
      setSelectedChatId(null) // Reset selected chat
      
      // Create new chat in backend with smart title
      const token = getToken()
      let chatTitle = 'নতুন চ্যাট'
      
      // Generate title based on first message if provided
      if (firstMessage) {
        chatTitle = generateFallbackTitle(firstMessage)
      } else if (prescriptionData) {
        chatTitle = '💊 প্রেসক্রিপশন বিশ্লেষণ'
      }
      
      const response = await fetch(`${API_BASE_URL}/chat/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: chatTitle,
          context: chatContext || 'general'
        })
      })

      if (response.ok) {
        const newChatId = await response.text()
        setSelectedChatId(parseInt(newChatId))
        await loadChatHistory()
        return parseInt(newChatId)
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
      setSelectedChatId(null)
    }
    return null
  }

  const updateChatTitle = async (chatId, messages) => {
    if (!chatId || !messages || messages.length < 3) return

    try {
      const userMessages = messages.filter(msg => msg.sender === 'user')
      if (userMessages.length < 2) return

      const newTitle = await generateChatTitle(messages)
      const token = getToken()
      
      await fetch(`${API_BASE_URL}/chat/${chatId}/title`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle })
      })

      // Update local chat history
      setChatHistory(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      ))
    } catch (error) {
      console.error('Error updating chat title:', error)
    }
  }

  const sendMessageToBackend = async (message, chatId) => {
    try {
      const token = getToken()
      
      // Save user message to backend first if we have a chatId
      if (chatId) {
        try {
          const userMessageData = {
            role: 'USER',
            message: message
          }
          
          await fetch(`${API_BASE_URL}/chat/${chatId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userMessageData),
          })
        } catch (error) {
          console.log('Failed to save user message to backend:', error)
        }
      }
      
      // Prepare context for AI - include prescription data if available
      let chatHistoryForAI = messages.slice(-10)
      if (prescriptionData && prescriptionData.summary) {
        chatHistoryForAI = [
          {
            type: 'system',
            content: `প্রেসক্রিপশন প্রসঙ্গ: ${prescriptionData.summary}`
          },
          ...chatHistoryForAI
        ]
      }
      
      // Get AI response from medical chat API
      const medicalChatResponse = await fetch('/api/medical-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          chatHistory: chatHistoryForAI,
          context: chatContext || 'general',
          prescriptionData: prescriptionData ? {
            medications: prescriptionData.analysis?.medications || [],
            diagnosis: prescriptionData.analysis?.primaryDiagnosis || null,
            investigations: prescriptionData.analysis?.investigations || []
          } : null
        })
      })

      if (medicalChatResponse.ok) {
        const aiResult = await medicalChatResponse.json()
        if (aiResult.success && aiResult.response) {
          
          // Save bot response to backend if we have a chatId
          if (chatId) {
            try {
              const botMessageData = {
                role: 'ASSISTANT',
                message: aiResult.response
              }
              
              await fetch(`${API_BASE_URL}/chat/${chatId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(botMessageData),
              })
            } catch (error) {
              console.log('Failed to save bot response to backend:', error)
            }
          }
          
          return aiResult.response
        }
      }
      
      // Fallback to local enhanced response
      return getEnhancedLocalResponse(message)
      
    } catch (error) {
      console.error('Error sending message:', error)
      return getEnhancedLocalResponse(message)
    }
  }

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isTyping || isSending) return

    const currentMessage = inputMessage.trim()
    const messageId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    
    // Prevent duplicate messages
    if (lastMessageId === messageId) return
    setLastMessageId(messageId)
    
    const userMessage = {
      id: messageId,
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
      sender: 'user'
    }

    // Prevent concurrent sends
    setIsSending(true)
    
    // Optimistically add user message
    setMessages(prev => {
      // Check if message already exists
      if (prev.some(msg => msg.id === messageId)) {
        return prev
      }
      return [...prev, userMessage]
    })
    
    setInputMessage('')
    setIsTyping(true)

    try {
      let currentChatId = selectedChatId
      
      // Create new chat if none exists
      if (!currentChatId) {
        currentChatId = await createNewChat(currentMessage)
        if (!currentChatId) {
          throw new Error('Failed to create chat')
        }
      }

      // Send message to backend and get AI response
      const botResponseContent = await sendMessageToBackend(currentMessage, currentChatId)
      
      const botMessage = {
        id: 'bot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        type: 'bot',
        content: botResponseContent,
        timestamp: new Date(),
        sender: 'bot'
      }
      
      setMessages(prev => {
        // Check if bot response already exists
        if (prev.some(msg => msg.content === botResponseContent && msg.sender === 'bot' && 
                          Math.abs(new Date(msg.timestamp) - new Date()) < 5000)) {
          return prev
        }
        return [...prev, botMessage]
      })
      
      // Update chat title intelligently (only after meaningful conversation)
      const newMessageCount = messages.filter(m => m.sender === 'user').length + 1
      if (newMessageCount === 2) {
        // Update title after second message for better context
        setTimeout(() => {
          const allMessages = [...messages, userMessage, botMessage]
          updateChatTitle(currentChatId, allMessages)
        }, 1500)
      }
      
      // Refresh chat history periodically, not every message (performance optimization)
      if (newMessageCount % 3 === 0) {
        setTimeout(loadChatHistory, 2000)
      }
      
    } catch (error) {
      console.error('Error handling message:', error)
      
      // Enhanced fallback response
      const fallbackResponse = {
        id: 'bot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        type: 'bot',
        content: '⚠️ দুঃখিত, সংযোগে সমস্যা হচ্ছে। আপনার প্রশ্ন আবার করুন অথবা কিছুক্ষণ পর চেষ্টা করুন। 🔄',
        timestamp: new Date(),
        sender: 'bot'
      }
      
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsTyping(false)
      setIsSending(false)
    }
  }, [inputMessage, isTyping, isSending, selectedChatId, messages, createNewChat, sendMessageToBackend, updateChatTitle, loadChatHistory, lastMessageId])

  const getEnhancedLocalResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Enhanced prescription responses if prescription data is available
    if (prescriptionData) {
      if (lowerMessage.includes('ওষুধ') || lowerMessage.includes('medicine') || lowerMessage.includes('medication')) {
        const medications = prescriptionData.analysis?.medications || []
        if (medications.length > 0) {
          let response = "আপনার প্রেসক্রিপশনের ওষুধ সম্পর্কে তথ্য:\n\n"
          medications.forEach((med, index) => {
            response += `${index + 1}. **${med.prescribedName || med.genericName}**\n`
            if (med.strength) response += `   শক্তি: ${med.strength}\n`
            if (med.frequency) response += `   সেবনবিধি: ${med.frequency}\n`
            if (med.purpose) response += `   কাজ: ${med.purpose}\n\n`
          })
          response += "আরো কোন প্রশ্ন থাকলে জানান! 💊"
          return response
        }
      }
      
      if (lowerMessage.includes('পার্শ্ব') || lowerMessage.includes('side effect')) {
        return `আপনার প্রেসক্রিপশনের ওষুধের পার্শ্বপ্রতিক্রিয়া সম্পর্কে:\n\n• যেকোন নতুন উপসর্গ দেখা দিলে চিকিৎসকের সাথে যোগাযোগ করুন\n• পেট খারাপ হলে খাবারের সাথে ওষুধ খান\n• চুলকানি বা র‍্যাশ হলে ওষুধ বন্ধ করে চিকিৎসকের পরামর্শ নিন\n• মাথা ঘোরা বা দুর্বলতা হলে বিশ্রাম নিন\n\nকোন নির্দিষ্ট ওষুধের পার্শ্বপ্রতিক্রিয়া জানতে চান? 🤔`
      }
    }
    
    // Simple greetings
    const greetings = ['hello', 'hi', 'সালাম', 'আসসালামু আলাইকুম', 'হ্যালো', 'হাই', 'নমস্কার']
    if (greetings.some(greeting => lowerMessage.includes(greeting))) {
      let response = `আসসালামু আলাইকুম! 🙏\n\nআমি MediLens এর AI সহায়ক। আমি আপনাকে স্বাস্থ্য বিষয়ক যেকোনো প্রশ্নের উত্তর দিতে পারি!`
      
      if (prescriptionData) {
        response += `\n\n🔬 **আপনার প্রেসক্রিপশন বিশ্লেষণ করা হয়েছে!**\n\nআপনি নিম্নলিখিত বিষয়ে প্রশ্ন করতে পারেন:\n• ওষুধের বিস্তারিত তথ্য\n• সেবনবিধি ও সময়সূচি\n• পার্শ্বপ্রতিক্রিয়া\n• খাদ্যাভ্যাস ও সতর্কতা`
      } else {
        response += `\n\n🩺 **আমি সাহায্য করতে পারি:**\n• রোগের লক্ষণ ও চিকিৎসা\n• ওষুধের তথ্য ও ব্যবহার\n• স্বাস্থ্য পরামর্শ ও টিপস\n• প্রেসক্রিপশন বুঝতে সাহায্য`
      }
      
      response += `\n\nআপনার কোন প্রশ্ন আছে? 💬`
      return response
    }
    
    // Default enhanced response
    let defaultResponse = `🩺 **MediLens স্বাস্থ্য সহায়ক**\n\nআপনার প্রশ্নটি আরো স্পষ্ট করে জানালে আমি আরো ভালো সাহায্য করতে পারব।`
    
    if (prescriptionData) {
      defaultResponse += `\n\n🔬 **আপনার প্রেসক্রিপশনের তথ্য আছে।** নিম্নলিখিত বিষয়ে প্রশ্ন করতে পারেন:\n• "ওষুধের তালিকা দেখান"\n• "পার্শ্বপ্রতিক্রিয়া কী?"\n• "সেবনবিধি কী?"\n• "খাদ্য নিয়ম কী?"`
    } else {
      defaultResponse += `\n\n**🔥 জনপ্রিয় প্রশ্নসমূহ:**\n• "জ্বর হলে কি করব?"\n• "ডায়াবেটিস নিয়ন্ত্রণের উপায়?"\n• "রক্তচাপ বেশি হলে কি খাব?"\n• "মাথাব্যথার ওষুধ কি?"`
    }
    
    defaultResponse += `\n\nআপনার স্বাস্থ্যের যত্ন নিন, MediLens আপনার পাশে! 💚`
    return defaultResponse
  }

  const quickQuestions = [
    'আসসালামু আলাইকুম',
    prescriptionData ? 'ওষুধের তালিকা' : 'জ্বর হলে কি করব?',
    prescriptionData ? 'পার্শ্বপ্রতিক্রিয়া' : 'রক্তচাপ বেশি হলে কি খাব?',
    prescriptionData ? 'সেবনবিধি' : 'ডায়াবেটিস কন্ট্রোল করার উপায়?',
    prescriptionData ? 'খাদ্য নিয়ম' : 'মাথাব্যথার ওষুধ কি?',
    'পেট ব্যথার কারণ কি?',
    'কাশির ঘরোয়া চিকিৎসা',
    'হার্টের সমস্যার লক্ষণ'
  ]

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to chat</h1>
          <a href="/auth/login" className="btn btn-primary">Login</a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading your chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navigation />
      <div className="flex h-screen pt-16">
        {/* Sidebar - Chat History - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block w-1/4 bg-base-200 border-r">
          <div className="p-4 border-b">
            <button 
              onClick={() => createNewChat()}
              className="btn btn-primary btn-sm w-full"
            >
              ➕ নতুন চ্যাট
            </button>
          </div>
          <div className="overflow-y-auto h-full">
            {chatHistory.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onSelect={() => {
                  setSelectedChatId(chat.id)
                  loadChatMessages(chat.id)
                }}
              />
            ))}
            {chatHistory.length === 0 && (
              <div className="p-4 text-center text-base-content/60">
                <p className="text-sm">কোন চ্যাট নেই</p>
                <p className="text-xs mt-1">নতুন চ্যাট শুরু করুন</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className={`${prescriptionData ? 'bg-success' : 'bg-primary'} text-primary-content p-4`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h1 className="text-xl lg:text-2xl font-bold">
                  {prescriptionData ? '🔬 প্রেসক্রিপশন AI সহায়ক' : '🤖 MediLens AI Assistant'}
                </h1>
                <p className="text-primary-content/80 text-sm lg:text-base">
                  {prescriptionData ? 'আপনার প্রেসক্রিপশন বিষয়ক সহায়ক' : 'আপনার স্বাস্থ্য বিষয়ক সহায়ক'}
                </p>
              </div>
              {/* Mobile: New Chat Button */}
              <div className="lg:hidden">
                <button 
                  onClick={() => createNewChat()}
                  className="btn btn-sm btn-ghost"
                  disabled={isTyping}
                >
                  ➕
                </button>
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-base-100">
            <div className="space-y-4">
              {messages.filter(message => !message.isHidden).map((message) => (
                <motion.div
                  key={message.id}
                  className={`chat ${message.type === 'user' ? 'chat-end' : 'chat-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      {message.type === 'user' ? (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold">
                          {currentUser?.firstName?.[0] || 'U'}
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full ${prescriptionData ? 'bg-success' : 'bg-secondary'} flex items-center justify-center text-secondary-content`}>
                          {prescriptionData ? '🔬' : '🤖'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="chat-header">
                    {message.type === 'user' ? `${currentUser?.firstName || 'You'}` : (prescriptionData ? 'প্রেসক্রিপশন AI' : 'MediLens AI')}
                    <time className="text-xs opacity-50 ml-2">
                      {message.timestamp.toLocaleTimeString('bn-BD')}
                    </time>
                  </div>
                  <div className={`chat-bubble ${message.type === 'user' ? 'chat-bubble-primary' : (prescriptionData ? 'chat-bubble-success' : 'chat-bubble-secondary')} whitespace-pre-line`}>
                    {message.content}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  className="chat chat-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="chat-image avatar">
                    <div className={`w-10 rounded-full ${prescriptionData ? 'bg-success' : 'bg-secondary'} flex items-center justify-center text-secondary-content`}>
                      {prescriptionData ? '🔬' : '🤖'}
                    </div>
                  </div>
                  <div className={`chat-bubble ${prescriptionData ? 'chat-bubble-success' : 'chat-bubble-secondary'}`}>
                    <span className="loading loading-dots loading-sm"></span>
                    <span className="ml-2">চিন্তা করছি...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Questions */}
          <div className="p-3 lg:p-4 bg-base-200 border-t">
            <p className="text-xs lg:text-sm text-base-content/70 mb-2">
              {prescriptionData ? 'প্রেসক্রিপশন সম্পর্কিত প্রশ্ন:' : 'দ্রুত প্রশ্ন:'}
            </p>
            <div className="flex flex-wrap gap-1 lg:gap-2">
              {quickQuestions.slice(0, 8).map((question, index) => (
                <button
                  key={index}
                  className="btn btn-xs lg:btn-sm btn-outline text-xs"
                  onClick={() => {
                    if (!isTyping && !isSending) {
                      setInputMessage(question)
                    }
                  }}
                  disabled={isTyping || isSending}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 lg:p-4 bg-base-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={prescriptionData ? "প্রেসক্রিপশন সম্পর্কে প্রশ্ন করুন..." : "আপনার স্বাস্থ্য বিষয়ক প্রশ্ন লিখুন..."}
                className="input input-bordered flex-1 text-sm lg:text-base"
                disabled={isTyping || isSending}
              />
              <button
                type="submit"
                className={`btn ${prescriptionData ? 'btn-success' : 'btn-primary'} ${(isTyping || isSending) ? 'loading' : ''}`}
                disabled={!inputMessage.trim() || isTyping || isSending}
              >
                <span className="hidden lg:inline">
                  {isTyping ? 'পাঠাচ্ছি...' : '📤 Send'}
                </span>
                <span className="lg:hidden">
                  {isTyping ? '...' : '📤'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
