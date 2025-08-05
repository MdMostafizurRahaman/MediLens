'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [chatHistory, setChatHistory] = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)
  const messagesEndRef = useRef(null)
  const { currentUser, getToken } = useAuth()
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (currentUser) {
      initializeChat()
    }
  }, [currentUser])

  const initializeChat = async () => {
    try {
      setLoading(true)
      await loadChatHistory()
      
      // Start with welcome message if no chat history
      if (messages.length === 0) {
        setMessages([{
          id: 'welcome-' + Date.now(),
          type: 'bot',
          content: 'আসসালামু আলাইকুম! আমি MediLens এর AI সহায়ক। আপনার স্বাস্থ্য, প্রেসক্রিপশন বা মেডিক্যাল প্রশ্ন করুন। আমি বাংলায় বিস্তারিত উত্তর দিতে পারি। 🏥💊',
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/user/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const chats = await response.json()
        setChatHistory(chats)
        
        // If there are existing chats, load the most recent one
        if (chats.length > 0) {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const chatData = await response.json()
        const formattedMessages = chatData.messages?.map(msg => ({
          id: msg.id,
          type: msg.chatRole === 'USER' ? 'user' : 'bot',
          content: msg.content,
          timestamp: new Date(msg.timestamp || msg.createdAt)
        })) || []
        
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Error loading chat messages:', error)
    }
  }

  const createNewChat = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/chat/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'নতুন চ্যাট - ' + new Date().toLocaleDateString('bn-BD')
        }),
      })

      if (response.ok) {
        const newChat = await response.json()
        setSelectedChatId(newChat.id)
        setMessages([{
          id: 'welcome-' + Date.now(),
          type: 'bot',
          content: 'নতুন চ্যাট শুরু হয়েছে। আপনার স্বাস্থ্য বিষয়ক যেকোনো প্রশ্ন করুন! 🩺',
          timestamp: new Date()
        }])
        await loadChatHistory()
        return newChat.id
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
    return null
  }

  const sendMessageToBackend = async (message, chatId) => {
    try {
      const token = getToken()
      
      // Create message object
      const messageData = {
        content: message,
        role: 'USER'
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/chat/${chatId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      })

      if (response.ok) {
        const chatResponse = await response.json()
        // The backend should return the updated chat with AI response
        // For now, we'll use local AI response
        return getLocalBotResponse(message)
      } else {
        console.warn('Backend chat failed, using local response')
        return getLocalBotResponse(message)
      }
    } catch (error) {
      console.error('Error sending message to backend:', error)
      return getLocalBotResponse(message)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: 'user-' + Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsTyping(true)

    try {
      let currentChatId = selectedChatId
      
      // Create new chat if none exists
      if (!currentChatId) {
        currentChatId = await createNewChat()
      }

      // Send message to backend and get AI response
      const botResponseContent = await sendMessageToBackend(currentMessage, currentChatId)
      
      const botResponse = {
        id: 'bot-' + Date.now(),
        type: 'bot',
        content: botResponseContent,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
      
      // Refresh chat history to show updated conversation
      await loadChatHistory()
      
    } catch (error) {
      console.error('Error handling message:', error)
      
      // Fallback to local response
      const fallbackResponse = {
        id: 'bot-' + Date.now(),
        type: 'bot',
        content: 'দুঃখিত, আমি এখন সংযোগে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন। জরুরি অবস্থায় দ্রুত ডাক্তারের পরামর্শ নিন।',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const getLocalBotResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Enhanced medical responses in Bangla
    if (lowerMessage.includes('fever') || lowerMessage.includes('জ্বর')) {
      return `🌡️ জ্বরের জন্য পরামর্শ:
      
• প্যারাসিটামল ৫০০ মিগ্রা - দিনে ৩ বার খাবারের পর
• প্রচুর পানি ও তরল খাবার খান
• বিশ্রাম নিন এবং হালকা পোশাক পরুন
• কুসুম গরম পানি দিয়ে গোসল করুন

⚠️ সতর্কতা: জ্বর ১০৩°F এর বেশি হলে বা ৩ দিনের বেশি থাকলে অবশ্যই ডাক্তার দেখান।`
    }
    
    if (lowerMessage.includes('pressure') || lowerMessage.includes('রক্তচাপ') || lowerMessage.includes('hypertension')) {
      return `🩺 উচ্চ রক্তচাপ নিয়ন্ত্রণ:
      
• নিয়মিত ওষুধ খান, বন্ধ করবেন না
• লবণ কম খান (দিনে ৫ গ্রামের কম)
• প্রতিদিন ৩০ মিনিট হাঁটাহাঁটি করুন
• ওজন নিয়ন্ত্রণে রাখুন
• ধূমপান ও মদ্যপান ছাড়ুন

📊 স্বাভাবিক রক্তচাপ: ১২০/৮০ mmHg এর নিচে`
    }
    
    if (lowerMessage.includes('diabetes') || lowerMessage.includes('ডায়াবেটিস') || lowerMessage.includes('sugar')) {
      return `🍎 ডায়াবেটিস নিয়ন্ত্রণ:
      
• নিয়মিত ওষুধ/ইনসুলিন নিন
• চিনি, মিষ্টি ও ভাত কম খান
• বেশি শাকসবজি ও আঁশযুক্ত খাবার খান
• নিয়মিত ব্যায়াম করুন
• ওজন নিয়ন্ত্রণে রাখুন

🎯 লক্ষ্য: খালি পেটে ৭ mmol/L এর নিচে`
    }
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('মাথাব্যথা')) {
      return `🧠 মাথাব্যথার সমাধান:
      
• প্যারাসিটামল ৫০০ মিগ্রা খেতে পারেন
• পর্যাপ্ত পানি পান করুন (দিনে ৮-১০ গ্লাস)
• অন্ধকার ঘরে বিশ্রাম নিন
• মাথায় ঠান্ডা সেক দিন
• পর্যাপ্ত ঘুম নিশ্চিত করুন

⚠️ তীব্র মাথাব্যথা, জ্বর বা দৃষ্টি সমস্যা হলে জরুরি ডাক্তার দেখান।`
    }

    if (lowerMessage.includes('cough') || lowerMessage.includes('কাশি')) {
      return `😷 কাশির চিকিৎসা:
      
• কুসুম গরম পানিতে লবণ দিয়ে গড়গড়া করুন
• মধু ও আদার রস খান
• প্রচুর তরল পান করুন
• ধূমপান ও ধুলাবালি এড়িয়ে চলুন

💊 ওষুধ: কাশির সিরাপ (Dextromethorphan) খেতে পারেন।
⚠️ ২ সপ্তাহের বেশি কাশি থাকলে ডাক্তার দেখান।`
    }

    if (lowerMessage.includes('stomach') || lowerMessage.includes('পেট') || lowerMessage.includes('acidity')) {
      return `🍽️ পেটের সমস্যার সমাধান:
      
• নিয়মিত খাবার খান, বেশি খালি পেটে থাকবেন না
• তেল-মসলা কম খান
• ওমিপ্রাজল ২০ মিগ্রা খালি পেটে খেতে পারেন
• প্রচুর পানি পান করুন
• চা-কফি কম পান করুন

🚨 তীব্র পেট ব্যথা, বমি বা রক্ত আসলে তাৎক্ষণিক ডাক্তার দেখান।`
    }
    
    return `ধন্যবাদ আপনার প্রশ্নের জন্য। আরো নির্দিষ্ট উপসর্গ বা রোগের নাম বললে আমি আরো ভালো সাহায্য করতে পারব।

🔍 আপনি চাইলে:
• প্রেসক্রিপশন আপলোড করে বিশ্লেষণ করতে পারেন
• ভাইটাল সাইন চেক করতে পারেন  
• ডাক্তারদের তালিকা দেখতে পারেন

⚕️ মনে রাখবেন: এটি প্রাথমিক পরামর্শ। গুরুতর সমস্যায় অবশ্যই ডাক্তার দেখান।`
  }

  const quickQuestions = [
    'জ্বর হলে কি করব?',
    'রক্তচাপ বেশি হলে কি খাব?',
    'ডায়াবেটিস কন্ট্রোল করার উপায়?',
    'মাথাব্যথার ওষুধ কি?',
    'পেট ব্যথার কারণ কি?',
    'কাশির ঘরোয়া চিকিৎসা',
    'হার্টের সমস্যার লক্ষণ',
    'এসিডিটির সমাধান'
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
      <div className="container mx-auto max-w-6xl h-screen flex">
        {/* Sidebar - Chat History */}
        <div className="w-1/4 bg-base-200 border-r">
          <div className="p-4 border-b">
            <button 
              onClick={createNewChat}
              className="btn btn-primary btn-sm w-full"
            >
              ➕ নতুন চ্যাট
            </button>
          </div>
          <div className="overflow-y-auto h-full">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 border-b cursor-pointer hover:bg-base-300 ${
                  selectedChatId === chat.id ? 'bg-base-300' : ''
                }`}
                onClick={() => {
                  setSelectedChatId(chat.id)
                  loadChatMessages(chat.id)
                }}
              >
                <h4 className="text-sm font-medium truncate">
                  {chat.title || 'Chat ' + chat.id}
                </h4>
                <p className="text-xs text-base-content/60">
                  {new Date(chat.createdAt).toLocaleDateString('bn-BD')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.div 
            className="bg-primary text-primary-content p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.back()} 
                className="btn btn-ghost btn-circle text-primary-content"
              >
                ← Back
              </button>
              <div className="text-center">
                <h1 className="text-2xl font-bold">🤖 MediLens AI Assistant</h1>
                <p className="text-primary-content/80">আপনার স্বাস্থ্য বিষয়ক সহায়ক</p>
              </div>
              <div></div>
            </div>
          </motion.div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-base-100">
            <div className="space-y-4">
              {messages.map((message) => (
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
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-content">
                          🤖
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="chat-header">
                    {message.type === 'user' ? `${currentUser?.firstName || 'You'}` : 'MediLens AI'}
                    <time className="text-xs opacity-50 ml-2">
                      {message.timestamp.toLocaleTimeString('bn-BD')}
                    </time>
                  </div>
                  <div className={`chat-bubble ${message.type === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'} whitespace-pre-line`}>
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
                    <div className="w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-content">
                      🤖
                    </div>
                  </div>
                  <div className="chat-bubble chat-bubble-secondary">
                    <span className="loading loading-dots loading-sm"></span>
                    <span className="ml-2">চিন্তা করছি...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Questions */}
          <div className="p-4 bg-base-200 border-t">
            <p className="text-sm text-base-content/70 mb-2">দ্রুত প্রশ্ন:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="btn btn-xs btn-outline"
                  onClick={() => setInputMessage(question)}
                  disabled={isTyping}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-base-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="আপনার স্বাস্থ্য বিষয়ক প্রশ্ন লিখুন... (বাংলা বা ইংরেজিতে)"
                className="input input-bordered flex-1"
                disabled={isTyping}
              />
              <button
                type="submit"
                className={`btn btn-primary ${isTyping ? 'loading' : ''}`}
                disabled={!inputMessage.trim() || isTyping}
              >
                {isTyping ? 'পাঠাচ্ছি...' : '📤 Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
