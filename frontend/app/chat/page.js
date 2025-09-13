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
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
  >
    <div className={`relative max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl`}>
      <div
        className={`chat-bubble-enhanced ${
          message.type === 'user'
            ? 'chat-bubble-user'
            : 'chat-bubble-ai'
        } ${isTyping ? 'animate-pulse' : ''}`}
      >
        {message.type === 'bot' && (
          <div className="flex items-center mb-3 pb-2 border-b border-gray-200/50">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mr-3 shadow-md">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-800">MediLens AI</span>
              {message.timestamp && (
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(message.timestamp).toLocaleTimeString('bn-BD', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          </div>
        )}
        
        {message.type === 'user' && message.timestamp && (
          <div className="text-xs text-white/80 mb-2 text-right">
            {new Date(message.timestamp).toLocaleTimeString('bn-BD', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
        
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {isTyping ? (
            <div className="flex items-center">
              <span className="mr-2">টাইপ করছি</span>
              <div className="flex space-x-1">
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
    </div>
  </motion.div>
))

// Memoized chat item for performance
const ChatItem = memo(({ chat, isSelected, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.02, x: 4 }}
    whileTap={{ scale: 0.98 }}
    className={`card-enhanced cursor-pointer transition-all duration-300 mb-2 ${
      isSelected 
        ? 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200 shadow-md' 
        : 'hover:bg-gray-50 border-gray-200'
    }`}
    onClick={onSelect}
  >
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className={`text-sm font-semibold truncate ${
          isSelected ? 'text-primary-800' : 'text-gray-800'
        }`}>
          {chat.title || `চ্যাট ${chat.id}`}
        </h4>
        {isSelected && (
          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
        )}
      </div>
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <span className="text-lg">📅</span>
        {new Date(chat.createdAt).toLocaleDateString('bn-BD')}
      </p>
      {chat.lastMessage && (
        <p className="text-xs text-gray-600 mt-2 truncate">
          {chat.lastMessage.substring(0, 50)}...
        </p>
      )}
    </div>
  </motion.div>
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

  // Remove auto-scroll-to-bottom on page load
  // Add scrollToTop function if needed
  const scrollToTop = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.parentNode.scrollTop = 0;
    }
  }, [])

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <div className="card-enhanced p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6 animate-float">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
            <p className="text-gray-600 mb-6">Please log in to access the AI chat assistant</p>
            <a href="/auth/login" className="btn btn-enhanced btn-lg px-8">
              <span className="mr-2">🚪</span>
              Login Now
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <div className="card-enhanced p-12">
            <div className="loading-enhanced mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">Loading your chat...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <Navigation />
  <div className="flex h-screen pt-20">
        {/* Sidebar - Chat History - Enhanced Design */}
        <div className="hidden lg:block w-80 glass-effect border-r border-white/20 backdrop-blur-xl">
          <div className="p-6 border-b border-white/10">
            <motion.button 
              onClick={() => createNewChat()}
              className="btn btn-enhanced w-full py-3 shadow-glow-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl mr-2">➕</span>
              নতুন চ্যাট
            </motion.button>
          </div>
          <div className="overflow-y-auto h-full p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
              <span className="text-lg">📝</span>
              Chat History
            </h3>
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
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">💬</div>
                <p className="text-gray-500 text-sm mb-2">No conversations yet</p>
                <p className="text-gray-400 text-xs">Start a new chat to begin</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area - Enhanced */}
        <div className="flex-1 flex flex-col">
          {/* Header - Enhanced */}
          <motion.div 
            className="glass-effect border-b border-white/20 p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                    prescriptionData 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-primary-500 to-blue-600'
                  } shadow-lg text-white`}>
                    {prescriptionData ? '🔬' : '🤖'}
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                      {prescriptionData ? 'Prescription AI Assistant' : 'MediLens AI Assistant'}
                    </h1>
                    <p className="text-gray-600 text-sm lg:text-base">
                      {prescriptionData ? 'আপনার প্রেসক্রিপশন বিষয়ক সহায়ক' : 'আপনার স্বাস্থ্য বিষয়ক সহায়ক'}
                    </p>
                  </div>
                </div>
                {prescriptionData && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Prescription Data Loaded
                  </div>
                )}
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
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-base-100 via-base-200/30 to-base-100 relative">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
              <div className="absolute bottom-40 left-10 w-24 h-24 bg-secondary/5 rounded-full blur-lg"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/3 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative space-y-6 max-w-4xl mx-auto">
              {messages.filter(message => !message.isHidden).map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`chat ${message.type === 'user' ? 'chat-end' : 'chat-start'}`}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    type: "spring",
                    bounce: 0.3
                  }}
                >
                  <div className="chat-image avatar">
                    <motion.div 
                      className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-base-300 shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                    >
                      {message.type === 'user' ? (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                          {currentUser?.firstName?.[0] || 'U'}
                        </div>
                      ) : (
                        <div className={`w-full h-full ${prescriptionData 
                          ? 'bg-gradient-to-br from-success-400 to-success-600' 
                          : 'bg-gradient-to-br from-secondary-400 to-secondary-600'
                        } flex items-center justify-center text-white text-lg shadow-inner`}>
                          {prescriptionData ? '🔬' : '🤖'}
                        </div>
                      )}
                    </motion.div>
                  </div>
                  
                  <div className={`chat-header mb-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <span className="font-semibold text-base-content/80">
                      {message.type === 'user' ? `${currentUser?.firstName || 'You'}` : (prescriptionData ? 'প্রেসক্রিপশন AI' : 'MediLens AI')}
                    </span>
                    <time className="text-xs text-base-content/50 ml-2 font-medium">
                      {message.timestamp.toLocaleTimeString('bn-BD')}
                    </time>
                  </div>
                  
                  <motion.div 
                    className={`chat-bubble-enhanced ${message.type === 'user' 
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white border-primary-300' 
                      : prescriptionData 
                        ? 'bg-gradient-to-br from-success-50 to-success-100 text-success-800 border-success-200' 
                        : 'bg-gradient-to-br from-secondary-50 to-secondary-100 text-secondary-800 border-secondary-200'
                    } max-w-xs lg:max-w-md xl:max-w-lg shadow-lg backdrop-blur-sm whitespace-pre-line leading-relaxed`}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: message.type === 'user' 
                        ? "0 10px 25px rgba(99, 102, 241, 0.25)" 
                        : prescriptionData 
                          ? "0 10px 25px rgba(34, 197, 94, 0.25)"
                          : "0 10px 25px rgba(168, 85, 247, 0.25)"
                    }}
                    transition={{ type: "spring", bounce: 0.3 }}
                  >
                    {message.content}
                  </motion.div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  className="chat chat-start"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                >
                  <div className="chat-image avatar">
                    <motion.div 
                      className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-base-300 shadow-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className={`w-full h-full ${prescriptionData 
                        ? 'bg-gradient-to-br from-success-400 to-success-600' 
                        : 'bg-gradient-to-br from-secondary-400 to-secondary-600'
                      } flex items-center justify-center text-white text-lg shadow-inner`}>
                        {prescriptionData ? '🔬' : '🤖'}
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className={`chat-bubble-enhanced ${prescriptionData 
                      ? 'bg-gradient-to-br from-success-50 to-success-100 text-success-800 border-success-200' 
                      : 'bg-gradient-to-br from-secondary-50 to-secondary-100 text-secondary-800 border-secondary-200'
                    } shadow-lg backdrop-blur-sm`}
                    animate={{ 
                      boxShadow: [
                        prescriptionData ? "0 4px 15px rgba(34, 197, 94, 0.15)" : "0 4px 15px rgba(168, 85, 247, 0.15)",
                        prescriptionData ? "0 8px 25px rgba(34, 197, 94, 0.25)" : "0 8px 25px rgba(168, 85, 247, 0.25)",
                        prescriptionData ? "0 4px 15px rgba(34, 197, 94, 0.15)" : "0 4px 15px rgba(168, 85, 247, 0.15)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="loading loading-dots loading-sm"></span>
                      <span className="font-medium">চিন্তা করছি...</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Questions */}
          <motion.div 
            className="p-4 lg:p-6 bg-gradient-to-r from-base-200/80 via-base-100/50 to-base-200/80 backdrop-blur-sm border-t border-base-300/50 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
            
            <div className="relative">
              <motion.p 
                className="text-sm lg:text-base text-base-content/80 mb-3 font-medium flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                {prescriptionData ? 'প্রেসক্রিপশন সম্পর্কিত প্রশ্ন:' : 'দ্রুত প্রশ্ন:'}
              </motion.p>
              
              <div className="flex flex-wrap gap-2 lg:gap-3">
                {quickQuestions.slice(0, 8).map((question, index) => (
                  <motion.button
                    key={index}
                    className={`btn btn-sm btn-outline ${prescriptionData 
                      ? 'btn-outline-success hover:btn-success' 
                      : 'btn-outline-primary hover:btn-primary'
                    } text-xs lg:text-sm font-medium transition-all duration-300 
                    hover:scale-105 hover:shadow-lg backdrop-blur-sm
                    ${prescriptionData 
                      ? 'hover:shadow-success/25' 
                      : 'hover:shadow-primary/25'
                    }`}
                    onClick={() => {
                      if (!isTyping && !isSending) {
                        setInputMessage(question)
                      }
                    }}
                    disabled={isTyping || isSending}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.4 + (index * 0.05),
                      type: "spring",
                      bounce: 0.3
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Input */}
          <motion.form 
            onSubmit={handleSendMessage} 
            className="p-4 lg:p-6 bg-gradient-to-r from-base-100 via-base-50 to-base-100 backdrop-blur-sm border-t border-base-300/50 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-secondary/10 rounded-full blur-xl"></div>
            
            <div className="relative flex gap-3 lg:gap-4 items-end max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <motion.input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={prescriptionData ? "প্রেসক্রিপশন সম্পর্কে প্রশ্ন করুন..." : "আপনার স্বাস্থ্য বিষয়ক প্রশ্ন লিখুন..."}
                  className={`input input-bordered w-full text-sm lg:text-base bg-white/90 backdrop-blur-sm 
                  border-2 transition-all duration-300 shadow-lg
                  ${prescriptionData 
                    ? 'border-success/30 focus:border-success focus:shadow-success/25' 
                    : 'border-primary/30 focus:border-primary focus:shadow-primary/25'
                  } 
                  focus:shadow-xl focus:scale-[1.02] placeholder:text-base-content/50`}
                  disabled={isTyping || isSending}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", bounce: 0.3 }}
                />
                
                {/* Input Enhancement Indicators */}
                {inputMessage.trim() && (
                  <motion.div 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <div className={`w-2 h-2 rounded-full ${prescriptionData ? 'bg-success' : 'bg-primary'} animate-pulse`}></div>
                  </motion.div>
                )}
              </div>
              
              <motion.button
                type="submit"
                className={`btn ${prescriptionData ? 'btn-success' : 'btn-primary'} 
                min-h-[3rem] px-4 lg:px-6 shadow-lg backdrop-blur-sm
                ${prescriptionData 
                  ? 'hover:shadow-success/30' 
                  : 'hover:shadow-primary/30'
                } hover:shadow-xl transition-all duration-300
                ${(isTyping || isSending) ? 'loading' : ''}`}
                disabled={!inputMessage.trim() || isTyping || isSending}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.3 }}
              >
                {!isTyping && !isSending && (
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="hidden lg:inline font-medium">
                      📤 Send
                    </span>
                    <span className="lg:hidden text-lg">
                      📤
                    </span>
                  </motion.div>
                )}
                {(isTyping || isSending) && (
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="hidden lg:inline text-sm">পাঠাচ্ছি...</span>
                  </motion.div>
                )}
              </motion.button>
            </div>
            
            {/* Input Helper Text */}
            <motion.div 
              className="mt-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-base-content/50">
                {prescriptionData 
                  ? 'আপনার প্রেসক্রিপশন সম্পর্কে যেকোনো প্রশ্ন করুন' 
                  : 'স্বাস্থ্য সম্পর্কিত যেকোনো প্রশ্ন করতে পারেন'
                }
              </p>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </div>
  )
}
